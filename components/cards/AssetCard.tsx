'use client';

import { useState } from 'react';
import { Database, BarChart2, GitMerge } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';
import type { SearchResult, HealthScore, Tag } from '../../types/openmetadata';

interface Props {
  result: SearchResult;
  health: HealthScore;
  onClick?: () => void;
}

/* ── Entity icon ── */
function EntityIcon({ entityType }: { entityType: string }) {
  const t = entityType.toLowerCase();
  if (t.includes('dashboard')) return <BarChart2 size={14} />;
  if (t.includes('pipeline') || t.includes('workflow')) return <GitMerge size={14} />;
  return <Database size={14} />;
}

/* ── Tag classification ── */
type TagKind = 'gold' | 'silver' | 'bronze' | 'pii' | 'domain';

function classifyTag(tagFQN: string): TagKind {
  const lower = tagFQN.toLowerCase();
  if (lower.includes('gold'))   return 'gold';
  if (lower.includes('silver')) return 'silver';
  if (lower.includes('bronze')) return 'bronze';
  if (/pii|sensitive/.test(lower)) return 'pii';
  return 'domain';
}

const TAG_STYLE: Record<TagKind, { bg: string; color: string; border: string }> = {
  gold:   { bg: '#1f1600', color: '#f59e0b', border: '#3d2c00' },
  silver: { bg: '#181818', color: '#9ca3af', border: '#2e2e2e' },
  bronze: { bg: '#0a1a0d', color: '#22c55e', border: '#12341a' },
  pii:    { bg: '#1f0808', color: '#ef4444', border: '#3d1010' },
  domain: { bg: '#080f1f', color: '#60a5fa', border: '#0f1e3a' },
};

function TagPill({ tag }: { tag: Tag }) {
  const kind  = classifyTag(tag.tagFQN);
  const style = TAG_STYLE[kind];
  const label = tag.name ?? tag.tagFQN.split('.').pop() ?? tag.tagFQN;
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 10,
      fontFamily: 'var(--font-jetbrains-mono), monospace',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/* ── Card ── */
export default function AssetCard({ result, health, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const tags = result.tags ?? [];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: '#141418',
        border: `0.5px solid ${hovered ? 'var(--mf-border-accent)' : 'var(--mf-border)'}`,
        borderRadius: 8,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Left: entity icon badge */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#0c0c0e',
        border: '1px solid var(--mf-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--mf-text-dim)',
      }}>
        <EntityIcon entityType={result.entityType} />
      </div>

      {/* Middle: text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Name */}
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--mf-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {result.name}
        </span>

        {/* FQN path */}
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'var(--mf-text-dim)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {result.fullyQualifiedName}
        </span>

        {/* Description */}
        <span style={{
          fontSize: 12,
          color: result.description ? 'var(--mf-text-muted)' : 'var(--mf-text-dim)',
          fontStyle: result.description ? 'normal' : 'italic',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {result.description ?? 'No description'}
        </span>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
            {tags.map(tag => (
              <TagPill key={tag.tagFQN} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Right: health ring */}
      <HealthScoreRing score={health} size="sm" />
    </div>
  );
}