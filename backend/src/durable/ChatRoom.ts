import { DurableObject } from 'cloudflare:workers'
import { Env } from '../types/env'

export class ChatRoom extends DurableObject<Env>{
  // In-memory state
  count = 0;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async increment() {
    this.count++;
    return this.count;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname === '/increment' && request.method === 'POST') {
      const newCount = await this.increment();
      return new Response(JSON.stringify(newCount), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
}