'use client';

import React, { useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, BarChart3, GitMerge } from 'lucide-react';

const NodeComponent = ({ data }: any) => {
  const isCenter = data.isCenter;
  const Icon = data.type === 'table' ? Database : data.type === 'dashboard' ? BarChart3 : GitMerge;
  
  const borderColor = data.type === 'table' ? 'border-blue-500' : data.type === 'dashboard' ? 'border-amber-500' : 'border-purple-500';

  return (
    <div className={`px-4 py-2 shadow-lg rounded-md bg-[#111] border-2 ${borderColor} ${isCenter ? 'ring-2 ring-white ring-opacity-50 scale-110' : ''} text-white min-w-[150px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400" />
      <div className="flex items-center gap-2">
        <Icon size={16} className="opacity-70" />
        <div className="flex flex-col">
          <span className="text-xs font-bold truncate max-w-[120px]">{data.label}</span>
          <span className="text-[10px] opacity-50 uppercase tracking-tighter">{data.type}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
};

const nodeTypes = { lineageNode: NodeComponent };

export default function LineageGraph({ nodes: initialNodes, edges: initialEdges, centerFqn }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Transform data for React Flow
    const flowNodes = initialNodes.map((node: any, index: number) => ({
      id: node.id,
      type: 'lineageNode',
      data: { 
        label: node.name, 
        type: node.type, 
        isCenter: node.fullyQualifiedName === centerFqn 
      },
      position: { x: index * 200, y: (index % 3) * 100 }, // Basic layout, ideally use dagre
    }));

    const flowEdges = initialEdges.map((edge: any) => ({
      id: `e-${edge.fromEntity}-${edge.toEntity}`,
      source: edge.fromEntity,
      target: edge.toEntity,
      animated: true,
      style: { strokeDasharray: '5,5', stroke: '#444' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#444' },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [initialNodes, initialEdges, centerFqn]);

  return (
    <div className="w-full h-[280px] bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#222" gap={20} />
        <Controls showInteractive={false} className="bg-black border-white/10" />
      </ReactFlow>
    </div>
  );
}
