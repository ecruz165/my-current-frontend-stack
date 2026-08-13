import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { stackEdges, stackNodes } from './stackFlowData';

export function StackFlow() {
  const [nodes, , onNodesChange] = useNodesState(stackNodes);
  const [edges, , onEdgesChange] = useEdgesState(stackEdges);

  return (
    <div className="h-[32rem] rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="system"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
