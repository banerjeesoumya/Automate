"use client";

import { LoadingView } from "@/components/entity-components";
import { useExecutionRealtime, useSuspenseWorkflow } from "@/hooks/workflows/use-workflows";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useCallback, useMemo, useState, useEffect } from "react";
import { nodeComponents } from "@/lib/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom, isDirtyAtom } from "../store/atoms";
import { NodeType } from "@/lib/utils";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

export const Editor = ({ workflowId }: { workflowId: string }) => {
  useAuthRedirect({ requireAuth: true });
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const setEditor = useSetAtom(editorAtom);
  const setIsDirty = useSetAtom(isDirtyAtom);

  const [nodes, setNodes] = useState<Node[]>(() =>
    workflow.nodes.map((node: any) => {
      const { executionStatus, error, ...restData } = node.data;
      return {
        ...node,
        data: restData,
      };
    })
  );
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);
  const [executionId, setExecutionId] = useState<string | undefined>(undefined);
  const realtime = useExecutionRealtime(executionId);

  useEffect(() => {
    setNodes(workflow.nodes.map((node: any) => {
      const { executionStatus, error, ...restData } = node.data;
      return {
        ...node,
        data: restData,
      };
    }));
    setEdges(workflow.edges);
  }, [workflow, setNodes, setEdges]);

  useEffect(() => {
    setIsDirty(false);
  }, [workflowId, setIsDirty]);

  useEffect(() => {
    if (executionId) {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          data: {
            ...node.data,
            executionStatus: undefined,
          },
        }))
      );
    }
  }, [executionId, setNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));

      const isMeaningfulChange = changes.some(change =>
        change.type === 'position' ||
        change.type === 'remove' ||
        change.type === 'add'
      );

      if (isMeaningfulChange) {
        setIsDirty(true);
      }
    },
    [setIsDirty]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));

      const isMeaningfulChange = changes.some(change =>
        change.type === 'remove' ||
        change.type === 'add'
      );

      if (isMeaningfulChange) {
        setIsDirty(true);
      }
    },
    [setIsDirty]
  );
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
      setIsDirty(true);
    },
    [setIsDirty]
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.Manual_Trigger)
  }, [nodes]);

  useEffect(() => {
    if (!realtime) return;

    setNodes((prev) => {
      let hasChanged = false;
      const nextNodes = prev.map((node) => {
        const newStatus = realtime.nodes[node.id]?.status;
        if (node.data.executionStatus !== newStatus) {
          hasChanged = true;
          return {
            ...node,
            data: {
              ...node.data,
              executionStatus: newStatus
            }
          };
        }
        return node;
      });

      return hasChanged ? nextNodes : prev;
    });
  }, [realtime, setNodes]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="top-left">
            <ExecuteWorkflowButton workflowId={workflowId} onExecutionStart={setExecutionId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};
