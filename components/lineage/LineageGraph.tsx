'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
  type NodeTypes,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { LineageData, LineageNode } from '../../types/openmetadata';

/* ── Types ── */
interface NodeData {
  label: string;
  fqn: string;
  entityType: string;
  isCenter: boolean;
  isDirectDownstream: boolean;
  isSelected: boolean;
  onClick: () => void;
}

/* ── Custom node ── */
function MetaNode({ data }: NodeProps<NodeData>) {
  const { label, entityType, isCenter, isDirectDownstream, isSelected, onClick } = data;

  const width       = isCenter ? 180 : 160;
  const bg          = isCenter ? '#1e1a35' : '#141418';
  const borderColor = isSelected
    ? '#a78bfa'
    : isCenter
    ? '#3d3060'
    : isDirectDownstream
    ? '#7f1d1d'
    : '#2a2a30';
  const nameColor   = isCenter ? '#a78bfa' : isDirectDownstream ? '#ef4444' : 'var(--mf-text)';
  const badgeBg     = isCenter ? '#2a1f55' : isDirectDownstream ? '#2d0f0f' : '#1a1a1f';
  const badgeColor  = isCenter ? '#7c5fa8' : isDirectDownstream ? '#7f1d1d' : '#555';

  const truncated = label.length > 18 ? `${label.slice(0, 17)}…` : label;

  return (
    <div
      onClick={isCenter ? undefined : onClick}
      style={{
        width,
        padding: '8px 10px',
        background: bg,
        border: `0.5px solid ${borderColor}`,
        borderRadius: 6,
        cursor: isCenter ? 'default' : 'pointer',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3d3060', border: 'none', width: 6, height: 6 }}
      />

      <div style={{
        fontSize: 11,
        fontWeight: 500,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color: nameColor,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {truncated}
      </div>

      <span style={{
        display: 'inline-block',
        marginTop: 3,
        padding: '1px 5px',
        borderRadius: 999,
        fontSize: 9,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        background: badgeBg,
        color: badgeColor,
        textTransform: 'lowercase',
      }}>
        {entityType || 'table'}
      </span>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3d3060', border: 'none', width: 6, height: 6 }}
      />
    </div>
  );
}

/* Stable reference — must be outside the component */
const nodeTypes: NodeTypes = { metaNode: MetaNode };

/* ── Layout helpers ── */
function yFor(i: number, total: number) {
  return (i - (total - 1) / 2) * 60;
}

function buildGraph(
  lineageData: LineageData,
  centerFqn: string,
  onClickFn: (fqn: string, name: string) => void,
): { flowNodes: Node<NodeData>[]; flowEdges: Edge[] } {
  const center   = lineageData.entity;
  const nodeById = new Map<string, LineageNode>(lineageData.nodes.map(n => [n.id, n]));

  /* Which node IDs sit upstream / downstream of the center */
  const upstreamIds   = new Set(lineageData.upstreamEdges.map(e => e.fromEntity.id));
  const downstreamIds = new Set(lineageData.downstreamEdges.map(e => e.toEntity.id));

  /* Direct downstream = edges that start FROM the center entity */
  const directDownstreamIds = new Set(
    lineageData.downstreamEdges
      .filter(e => e.fromEntity.id === center.id)
      .map(e => e.toEntity.id),
  );

  const upstreamNodes   = [...upstreamIds].map(id => nodeById.get(id)).filter(Boolean) as LineageNode[];
  const downstreamNodes = [...downstreamIds].map(id => nodeById.get(id)).filter(Boolean) as LineageNode[];

  const flowNodes: Node<NodeData>[] = [];

  /* Center */
  flowNodes.push({
    id:       center.id,
    type:     'metaNode',
    position: { x: 0, y: 0 },
    data: {
      label:               center.name,
      fqn:                 center.fullyQualifiedName,
      entityType:          center.entityType ?? center.type ?? 'table',
      isCenter:            true,
      isDirectDownstream:  false,
      isSelected:          false,
      onClick:             () => {},
    },
  });

  /* Upstream */
  upstreamNodes.forEach((n, i) => {
    flowNodes.push({
      id:       n.id,
      type:     'metaNode',
      position: { x: -240, y: yFor(i, upstreamNodes.length) },
      data: {
        label:               n.name,
        fqn:                 n.fullyQualifiedName,
        entityType:          n.entityType ?? n.type ?? 'table',
        isCenter:            false,
        isDirectDownstream:  false,
        isSelected:          false,
        onClick:             () => onClickFn(n.fullyQualifiedName, n.name),
      },
    });
  });

  /* Downstream */
  downstreamNodes.forEach((n, i) => {
    flowNodes.push({
      id:       n.id,
      type:     'metaNode',
      position: { x: 240, y: yFor(i, downstreamNodes.length) },
      data: {
        label:               n.name,
        fqn:                 n.fullyQualifiedName,
        entityType:          n.entityType ?? n.type ?? 'table',
        isCenter:            false,
        isDirectDownstream:  directDownstreamIds.has(n.id),
        isSelected:          false,
        onClick:             () => onClickFn(n.fullyQualifiedName, n.name),
      },
    });
  });

  /* Edge validity guard */
  const validIds = new Set(flowNodes.map(n => n.id));

  const flowEdges: Edge[] = [
    ...lineageData.upstreamEdges
      .filter(e => validIds.has(e.fromEntity.id) && validIds.has(e.toEntity.id))
      .map(e => ({
        id:        `u-${e.fromEntity.id}-${e.toEntity.id}`,
        source:    e.fromEntity.id,
        target:    e.toEntity.id,
        type:      'smoothstep' as const,
        animated:  false,
        style:     { stroke: '#3d3060', strokeWidth: 1 },
      })),

    ...lineageData.downstreamEdges
      .filter(e => validIds.has(e.fromEntity.id) && validIds.has(e.toEntity.id))
      .map(e => ({
        id:        `d-${e.fromEntity.id}-${e.toEntity.id}`,
        source:    e.fromEntity.id,
        target:    e.toEntity.id,
        type:      'smoothstep' as const,
        animated:  true,
        style:     { stroke: '#7f1d1d', strokeWidth: 1 },
      })),
  ];

  return { flowNodes, flowEdges };
}

/* ── Component ── */
interface Props {
  lineageData: LineageData;
  centerFqn:  string;
  onNodeClick: (fqn: string, name: string) => void;
}

export default function LineageGraph({ lineageData, centerFqn, onNodeClick }: Props) {
  const [selectedFqn, setSelectedFqn]   = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleClick = useCallback((fqn: string, name: string) => {
    setSelectedFqn(fqn);
    onNodeClick(fqn, name);
  }, [onNodeClick]);

  /* (Re-)build graph when data changes */
  useEffect(() => {
    const { flowNodes, flowEdges } = buildGraph(lineageData, centerFqn, handleClick);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [lineageData, centerFqn, handleClick, setNodes, setEdges]);

  /* Update selection highlight without rebuilding the whole graph */
  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isSelected: n.data.fqn === selectedFqn },
    })));
  }, [selectedFqn, setNodes]);

  return (
    <>
      {/* Override React Flow default handle/edge colors in this scope */}
      <style>{`
        .metaflux-lineage .react-flow__edge-path { stroke-opacity: 0.8; }
        .metaflux-lineage .react-flow__handle { opacity: 0; }
        .metaflux-lineage .react-flow__handle:hover { opacity: 1; }
      `}</style>

      <div
        className="metaflux-lineage"
        style={{
          height: 260,
          width: '100%',
          background: '#0f0f14',
          border: '0.5px solid var(--mf-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
        </ReactFlow>
      </div>
    </>
  );
}