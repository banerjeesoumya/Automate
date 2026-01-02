"use client";

import { LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/hooks/workflows/use-workflows";
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

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  useEffect(() => {
    setIsDirty(false);
  }, [workflowId, setIsDirty]);

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
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};
