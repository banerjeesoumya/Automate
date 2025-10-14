import { randomUUID } from "node:crypto";

type Role = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: Role;
  text: string;
  ts: number;
  meta?: Record<string, unknown>;
};

type Meta = {
  title?: string;
  model?: string;
  params?: Record<string, unknown>;
};

export class ChatRoom {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (url.pathname === "/message" && method === "POST") {
      return this.handleMessage(request);
    }
    if (url.pathname === "/history" && method === "GET") {
      return this.handleHistory();
    }
    if (url.pathname === "/meta" && method === "GET") {
      return this.handleGetMeta();
    }
    if (url.pathname === "/meta" && method === "POST") {
      return this.handleSetMeta(request);
    }
    if (url.pathname === "/summarize" && method === "POST") {
      return this.handleSummarize();
    }
    if (url.pathname === "/stream" && method === "GET") {
      return new Response("Streaming not implemented", { status: 501 });
    }

    return new Response("Not found", { status: 404 });
  }

  private async getMessages(): Promise<Message[]> {
    return (await this.state.storage.get<Message[]>("messages")) ?? [];
  }

  private async putMessages(messages: Message[]) {
    await this.state.storage.put("messages", messages);
  }

  private async getMeta(): Promise<Meta> {
    return (await this.state.storage.get<Meta>("meta")) ?? {};
  }

  private async putMeta(meta: Meta) {
    await this.state.storage.put("meta", meta);
  }

  private async handleHistory() {
    const messages = await this.getMessages();
    return Response.json({ messages });
  }

  private async handleGetMeta() {
    const meta = await this.getMeta();
    return Response.json({ meta });
  }

  private async handleSetMeta(request: Request) {
    const body = await request.json<Partial<Meta>>();
    const current = await this.getMeta();
    const next = { ...current, ...body };
    await this.putMeta(next);
    return Response.json({ ok: true, meta: next });
  }

  private buildPromptFromMessages(messages: Message[], summary?: string) {
    const recent = messages.slice(-20); // small context window
    const history = recent
      .map(m => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n");

    const parts = [
      summary ? `SUMMARY:\n${summary}\n` : "",
      "You are a helpful developer assistant.",
      "Use concise, accurate explanations and code when needed.",
      "",
      history,
      "",
      "ASSISTANT:",
    ].filter(Boolean);

    return parts.join("\n");
  }

  private async handleSummarize() {
    const messages = await this.getMessages();
    if (messages.length === 0) {
      return Response.json({ ok: true, summary: "" });
    }

    const prompt = `Summarize the following chat into a compact summary that preserves key goals, decisions, and context within 200 words:\n\n${messages
      .map(m => `${m.role}: ${m.text}`)
      .join("\n")}`;

    const model = "@cf/meta/llama-3.3-8b-instruct";
    const aiRes: any = await this.env.AI.run(model, {
      input: prompt,
      max_output_tokens: 300,
    });

    const summary =
      aiRes?.response ?? aiRes?.output_text ?? "[no summary generated]";

    await this.state.storage.put("summary", summary);
    return Response.json({ ok: true, summary });
  }

  private async handleMessage(request: Request) {
    type Payload = {
      userId: string;
      conversationId: string;
      text: string;
      clientRequestId?: string;
      meta?: Record<string, unknown>;
    };

    const body = await request.json<Payload>();
    if (!body?.userId || !body?.text || !body?.conversationId) {
      return new Response("Missing userId, text, or conversationId", { status: 400 });
    }

    const now = Date.now();
    const messages = await this.getMessages();

    const userMsg: Message = {
      id: `m_${randomUUID()}`,
      role: "user",
      text: body.text,
      ts: now,
      meta: body.meta,
    };
    messages.push(userMsg);

    const summary = (await this.state.storage.get<string>("summary")) ?? "";
    const prompt = this.buildPromptFromMessages(messages, summary);

    // Call Workers AI
    const model = "@cf/meta/llama-3.3-8b-instruct";
    const aiRes: any = await this.env.AI.run(model, {
      input: prompt,
      max_output_tokens: 700,
      temperature: 0.2,
    });

    const assistantText = aiRes?.response ?? aiRes?.output_text ?? "";
    const assistantMsg: Message = {
      id: `m_${randomUUID()}`,
      role: "assistant",
      text: assistantText,
      ts: Date.now(),
    };

    messages.push(assistantMsg);
    await this.putMessages(messages);

    // Update conversations index in D1
    try {
      await this.env.hr_d1
        .prepare(
          "UPDATE conversations SET last_message = ?, updated_at = ? WHERE id = ? AND owner_id = ?"
        )
        .bind(assistantText.slice(0, 400), Date.now(), body.conversationId, body.userId)
        .run();
    } catch {
      // best-effort; avoid failing the request if index update fails
    }

    return Response.json({
      reply: assistantText,
      conversationId: body.conversationId,
      messageId: assistantMsg.id,
    });
  }
}

type Env = import("../types/env").Env;