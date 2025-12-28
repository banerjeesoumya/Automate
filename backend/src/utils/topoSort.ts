import { Connection, Node } from "../generated/prisma";
import toposort from "toposort";

type SerializableNode = Omit<Node, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};


export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): SerializableNode[] => {
  if (connections.length === 0) {
    return nodes.map(serializeNode);
  }

  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = [...new Set(toposort(edges))];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("The workflow has cyclic dependencies.");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return sortedNodeIds
    .map((id) => nodeMap.get(id))
    .filter((node): node is Node => node !== undefined)
    .map(serializeNode);
};

const serializeNode = (node: Node): SerializableNode => ({
  ...node,
  createdAt: node.createdAt.toISOString(),
  updatedAt: node.updatedAt.toISOString(),
});
