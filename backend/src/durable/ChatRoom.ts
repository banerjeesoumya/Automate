import { DurableObject } from 'cloudflare:workers'
import { Env } from '../types/env'
import { v4 as uuid} from 'uuid';
import { DurableObjectState } from '@cloudflare/workers-types';
import { getDB } from '../db/client';
import { conversation } from '../db/schema';

type Role = 'user' | 'assistant' | 'system';

type Message = {
  id: string;
  role: Role;
  text: string;
  ts: number;
  meta?: Record<string, unknown>;
}

type Meta = {
  title?: string;
  model?: string;
  params?: Record<string, unknown>;
}
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
    if (url.pathname === '/message' && method === 'POST') {
      return this.handleMessage(request);
    }
    if (url.pathname === '/history' && method === 'GET') {
      return this.handleHistory();
    }
    if (url.pathname === '/meta' && method === 'GET') {
      return this.handleGetMeta();
    }
    if (url.pathname === '/meta' && method === 'POST') {
      return this.handleSetMeta(request);
    }
    if (url.pathname === '/summarize' && method === 'POST') {
      return this.handleSummarize();
    }

    return new Response('Not found', { status: 404 });
  }

  public async getMessages(): Promise<Message[]> {
    return (await this.state.storage.get<Message[]>('messages')) ?? [];
  }

  public async putMessages(messages: Message[]) {
    await this.state.storage.put('messages', messages);
  }

  public async getMeta(): Promise<Meta> {
    return (await this.state.storage.get<Meta>('meta')) ?? {};
  }

  public async putMeta(meta: Meta) {
    await this.state.storage.put('meta', meta);
  }

  public async handleHistory() {
    const messages = await this.getMessages();
    return Response.json({
      messages: messages
    });
  }

  public async handleGetMeta() {
    const meta = await this.getMeta();
    return Response.json({
      meta: meta
    });
  }
  
  public async handleSetMeta(request: Request) {
    const body = await request.json<Partial<Meta>>();
    const current = await this.getMeta();
    const next = { ...current, ...body };
    await this.putMeta(next);
    return Response.json({
      ok: true,
      meta: next
    });
  }

  public buildPrompt(messages: Message[], summary?: string) {
    const recent = messages.slice(-20);
    const history = recent
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const parts = [
      summary ? `SUMMARY:\n${summary}\n` : '',
      'You are helpul develoeper assistant. Use concise, accurate explanations and code when needed.',
      '',
      history,
      '',
      'ASSISTANT:',
    ].filter(Boolean);

    return parts.join('\n');
  }

  public async handleSummarize() {
    const messages = await this.getMessages();
    if (messages.length === 0) {
      return Response.json({ ok: true, summary: '' });
    }
    const prompt = `Summarize the following chat into a compact summary that preserves key goals, decisions, and context within 200 words:\n\n${messages
      .map(m => `${m.role}: ${m.text}`)
      .join("\n")}`;
    const model = "@cf/meta/llama-3.1-8b-instruct" as keyof AiModels;
    const aiRes: any = await this.env.AI.run(model, {
      prompt: prompt,
      max_tokens: 512,
      temperature: 0.7
    });
    const summary = aiRes?.response ?? aiRes?.output_text ?? '[no summary generated]';
    await this.state.storage.put('summary', summary);
    return Response.json({ ok: true, summary });
  }

  public async handleMessage(request: Request) {
    type Payload = {
      userId: string;
      conversationId?: string;
      text: string;
      clientRequestId?: string;
      meta?: Record<string, unknown>; 
    }

    const body = await request.json<Payload>();
    if (!body?.userId || !body?.conversationId || !body?.text) {
      return new Response('Invalid request body', { status: 400 });
    }
    const now = Date.now();
    // TODO: Get previous messages from storage
    let messages: Message[] = [];
    const userMsg: Message = {
      id: `m_${uuid()}`,
      role: 'user',
      text: body.text,
      ts: now,
      meta: body.meta
    };
    messages.push(userMsg);

    const summary = await this.state.storage.get<string>('summary');
    const prompt = this.buildPrompt(messages, summary);

    const model = "@cf/meta/llama-3.1-8b-instruct" as keyof AiModels;
    const aiRes: any = await this.env.AI.run(model, {
      prompt: prompt,
      max_tokens: 1024,
      temperature: 0.7
    });
    const assistantText = aiRes?.response ?? aiRes?.output_text ?? '';
    const assistantMsg: Message = {
      id: `m_${uuid()}`,
      role: 'assistant',
      text: assistantText,
      ts: Date.now()
    };
    messages.push(assistantMsg);
    await this.putMessages(messages);

    const db = getDB(this.env);
    try {
      await db.insert(conversation)
        .values({
          conversation_id: body.conversationId,
          ownerId: body.userId,
          last_message: assistantText.slice(0, 400),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: conversation.conversation_id,
          set: {
            last_message: assistantText.slice(0, 400),
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error('Error inserting/updating conversation:', error);
    }


    return Response.json({
      reply: assistantText,
      conversationId: body.conversationId,
      messageId: assistantMsg.id
    });
  }
}