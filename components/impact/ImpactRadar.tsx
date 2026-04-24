'use client';

import { useState } from 'react';
import { Database, BarChart2, GitMerge, FileText, Layers } from 'lucide-react';
import type { ImpactNode } from '../../types/openmetadata';

interface Props {
  impacts:    ImpactNode[];
  totalCount: number;
  onItemClick: (fqn: string, name: string) => void;
}

/* ── Depth tiers ── */
const TIERS = [
  { label: 'Direct Impact',    minDepth: 1, maxDepth: 1, badge: '#ef4444', badgeBg: '#2d0f0f' },
  { label: 'Indirect Impact',  minDepth: 2, maxDepth: 2, badge: '#f59e0b', badgeBg: '#1f1408' },
  { label: 'Cascading Impact', minDepth: 3, maxDepth: Infinity, badge: '#84cc16', badgeBg: '#1a1f08' },
] as const;

function depthStyle(depth: number): { color: string; bg: string } {
  if (depth <= 1) return { color: '#ef4444', bg: '#2d0f0f' };
  if (depth === 2) return { color: '#f59e0b', bg: '#1f1408' };
  return { color: '#84cc16', bg: '#1a1f08' };
}

function EntityIcon({ entityType }: { entityType: string }) {
  const t = entityType.toLowerCase();
  if (t.includes('dashboard')) return <BarChart2 size={12} />;
  if (t.includes('pipeline') || t.includes('workflow')) return <GitMerge size={12} />;
  if (t.includes('topic') || t.includes('stream')) return <Layers size={12} />;
  if (t.includes('chart') || t.includes('report')) return <FileText size={12} />;
  return <Database size={12} />;
}

function countColor(n: number): string {
  if (n > 5)  return '#ef4444';
  if (n >= 2) return '#f59e0b';
  return '#22c55e';
}

/* ── Impact row ── */
function ImpactRow({ node, onItemClick }: { node: ImpactNode; onItemClick: Props['onItemClick'] }) {
  const [hovered, setHovered] = useState(false);
  const ds = depthStyle(node.depth);

  return (
    <div
      onClick={() => onItemClick(node.fqn, node.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 5,
        background: hovered ? '#1a1a22' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
    >
      {/* Depth badge */}
      <span style={{
        fontSize: 9,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontWeight: 600,
        color: ds.color,
        background: ds.bg,
        padding: '1px 5px',
        borderRadius: 999,
        flexShrink: 0,
      }}>
        D{node.depth}
      </span>

      {/* Entity icon */}
      <span style={{ color: hovered ? 'var(--mf-text-muted)' : 'var(--mf-text-dim)', flexShrink: 0 }}>
        <EntityIcon entityType={node.entityType} />
      </span>

      {/* Name */}
      <span style={{
        fontSize: 11,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color: hovered ? 'var(--mf-text)' : 'var(--mf-text-muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: 'color 0.12s',
      }}>
        {node.name}
      </span>
    </div>
  );
}

/* ── Section header ── */
function TierHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      background: color + '18',
      border: `0.5px solid ${color}40`,
      marginBottom: 4,
    }}>
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}

/* ── Component ── */
export default function ImpactRadar({ impacts, totalCount, onItemClick }: Props) {
  return (
    <div style={{
      background: '#0f0f14',
      border: '0.5px solid var(--mf-border)',
      borderRadius: 8,
      padding: 14,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'var(--mf-text-dim)',
          letterSpacing: '0.04em',
        }}>
          ⚡ BLAST RADIUS
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: countColor(totalCount),
        }}>
          {totalCount} assets affected
        </span>
      </div>

      {/* Impact list */}
      <div
        className="scroll-area"
        style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {TIERS.map(tier => {
          const items = impacts.filter(n => n.depth >= tier.minDepth && n.depth <= tier.maxDepth);
          if (items.length === 0) return null;

          return (
            <div key={tier.label}>
              <TierHeader label={tier.label} color={tier.badge} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(node => (
                  <ImpactRow key={node.fqn} node={node} onItemClick={onItemClick} />
                ))}
              </div>
            </div>
          );
        })}

        {impacts.length === 0 && (
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            color: 'var(--mf-text-dim)',
            fontStyle: 'italic',
          }}>
            No downstream impacts found.
          </span>
        )}
      </div>
    </div>
  );
}