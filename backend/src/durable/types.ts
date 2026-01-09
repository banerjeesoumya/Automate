export type NodeExecutionStatus =
  | "IDLE"
  | "RUNNING"
  | "COMPLETED"
  | "ERRORED";

export interface RealtimeExecutionStatus {
    executionId: string;
    nodes: Record<string, {
        status: NodeExecutionStatus;
        startedAt?: number;
        completedAt?: number;
        error?: string;
    }>
}