import { DurableObjectState } from "@cloudflare/workers-types";
import { Env } from "../types/env";
import { RealtimeExecutionStatus } from "./types";

export class ExecutionState {
    state: DurableObjectState;
    env: Env;

    execution: RealtimeExecutionStatus;
    sockets = new Set<WebSocket>();

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;

        this.execution = {
            executionId: "",
            nodes: {}
        }
    }

    async fetch(request: Request) {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();
        if (url.pathname === '/update' && method === 'POST') {
            return this.handleUpdate(request);
        }
        if (url.pathname === '/connect' && method === 'GET') {
            return this.handleConnect();
        }

        return new Response('Not found', { status: 404 });
    }

    public async handleUpdate(request: Request) {
        // @ts-ignore
        const { executionId, nodeId, status, error } = await request.json();

        this.execution.executionId = executionId;

        const now = Date.now();

        this.execution.nodes[nodeId] = {
            status,
            ...(status === "RUNNING" && { startedAt: now }),
            ...(status === "COMPLETED" && { completedAt: now }),
            ...(status === "ERRORED" && { error, completedAt: now })
        };

        this.broadcast();

        return new Response("Updated", { status: 200 });
    }

    private broadcast() {
        const payload = JSON.stringify(this.execution);
        this.sockets.forEach(socket => {
            socket.send(payload);
        });
    }

    public async handleConnect() {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        server.accept();
        this.sockets.add(server);

        server.send(JSON.stringify(this.execution));

        server.addEventListener('close', () => {
            this.sockets.delete(server);
        });
        console.log("WebSocket connected to execution:", this.execution.executionId);
        return new Response(null, { status: 101, webSocket: client });
    }
}