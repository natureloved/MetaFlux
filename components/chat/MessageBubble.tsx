'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Search, GitMerge, ShieldCheck } from 'lucide-react';
import PIIBanner from '../cards/PIIBanner';
import AssetCard from '../cards/AssetCard';
import LineageGraph from '../lineage/LineageGraph';
import ImpactRadar from '../impact/ImpactRadar';
import type { Message } from './useChat';
import type {
  Column,
  SearchResult,
  TableEntity,
  LineageData,
  TestCase,
  ImpactNode,
  HealthScore,
} from '../../types/openmetadata';

/* ── Data shapes per intent ── */
type SearchData   = { results: Array<SearchResult & { healthScore?: HealthScore }>; query?: string };
type LineageShape = { table: TableEntity; lineage: LineageData };
type ImpactShape  = { lineage: LineageData; impacts: ImpactNode[] };
type SchemaShape  = { table: TableEntity };
type QualityShape = { table: TableEntity; tests: TestCase[]; health: HealthScore };
type CompareShape = {
  table1: TableEntity; table2: TableEntity;
  health1: HealthScore; health2: HealthScore;
};
type PIIDetails = { columns: string[]; owner: string | null };

/* ── Props ── */
interface Props {
  message:      Message;
  onAssetClick: (fqn: string, name: string) => void;
  onRetry?:     () => void;
}

/* ── Fallback health for results without a score ── */
const NULL_HEALTH: HealthScore = {
  total: 0, grade: 'F',
  breakdown: {
    description: { score: 0, max: 25, label: '—' },
    quality:     { score: 0, max: 25, label: '—' },
    ownership:   { score: 0, max: 25, label: '—' },
    freshness:   { score: 0, max: 25, label: '—' },
  },
  warnings: [], isPII: false, piiColumns: [],
};

/* ── Helpers ── */
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function daysAgo(ts?: number): string {
  if (!ts) return 'Unknown';
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0)  return 'Today';
  if (d === 1)  return 'Yesterday';
  if (d < 30)   return `${d} days ago`;
  if (d < 365)  return `${Math.floor(d / 30)} mo ago`;
  return `${Math.floor(d / 365)} yr ago`;
}

function tableToResult(t: TableEntity): SearchResult {
  return {
    id: t.id, name: t.name,
    fullyQualifiedName: t.fullyQualifiedName,
    description: t.description,
    entityType: t.entityType ?? 'table',
    tags: t.tags, owners: t.owners, updatedAt: t.updatedAt,
  };
}

function isColPII(col: Column): boolean {
  return col.tags?.some(tag => /pii|sensitive/i.test(tag.tagFQN)) ?? false;
}

/* ── Shared mono label style ── */
const mono = (color = 'var(--mf-text-dim)') => ({
  fontSize: 10,
  fontFamily: 'var(--font-jetbrains-mono), monospace',
  color,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontWeight: 600,
});

/* ════════════════════════════════
   Shared empty state card
════════════════════════════════ */
function EmptyCard({ icon, message, hint }: { icon: ReactNode; message: string; hint?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      padding: '20px 24px', marginTop: 10,
      background: '#111114', border: '0.5px solid var(--mf-border)',
      borderRadius: 8, textAlign: 'center',
    }}>
      <span style={{ color: 'var(--mf-text-dim)', opacity: 0.45 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--mf-text-muted)', lineHeight: 1.5 }}>{message}</span>
      {hint && (
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'var(--mf-text-dim)', fontStyle: 'italic',
        }}>
          {hint}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════
   Intent-specific bodies
════════════════════════════════ */

/* ── Schema ── */
function SchemaBody({ data }: { data: SchemaShape }) {
  const cols = data?.table?.columns || [];
  return (
    <div style={{ marginTop: 10, border: '0.5px solid var(--mf-border)', borderRadius: 6, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 2fr 44px', background: '#111114' }}>
        {['Column', 'Type', 'Description', 'PII'].map(h => (
          <span key={h} style={{ ...mono(), padding: '5px 8px' }}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      {cols.map((col, i) => {
        const pii = isColPII(col);
        return (
          <div
            key={col.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 2fr 44px',
              background: i % 2 === 0 ? '#111114' : '#141418',
              borderLeft: pii ? '2px solid #ef444450' : '2px solid transparent',
              fontSize: 11,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            <span style={{ padding: '5px 8px', color: pii ? '#ef4444' : 'var(--mf-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.name}</span>
            <span style={{ padding: '5px 8px', color: 'var(--mf-text-dim)' }}>{col.dataType}</span>
            <span style={{ padding: '5px 8px', color: col.description ? 'var(--mf-text-muted)' : 'var(--mf-text-dim)', fontStyle: col.description ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {col.description ?? 'No description'}
            </span>
            <span style={{ padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
              {pii && <span style={{ fontSize: 9, background: '#2d0f0f', color: '#ef4444', padding: '1px 5px', borderRadius: 999 }}>PII</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Quality ── */
function testStatusStyle(s?: string) {
  if (s === 'Success') return { bg: '#0a2a0a', color: '#22c55e', label: 'PASS' };
  if (s === 'Failed')  return { bg: '#2a0a0a', color: '#ef4444', label: 'FAIL' };
  if (s === 'Aborted') return { bg: '#1f1408', color: '#f59e0b', label: 'ABORT' };
  return { bg: '#141414', color: '#666',     label: 'QUEUED' };
}

function QualityBody({ data, onAssetClick }: { data: QualityShape; onAssetClick: Props['onAssetClick'] }) {
  const table = data?.table;
  const tests = data?.tests || [];
  const health = data?.health || NULL_HEALTH;
  if (!table) return <EmptyCard icon={<ShieldCheck size={20} />} message="No table data available" />;
  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AssetCard
        result={tableToResult(table)}
        health={health}
        onClick={() => onAssetClick?.(table.fullyQualifiedName, 'details')}
      />
      {tests.length === 0
        ? <EmptyCard icon={<ShieldCheck size={20} />} message="No data quality tests configured" />
        : (
        <div style={{ border: '0.5px solid var(--mf-border)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px', padding: '5px 10px', background: '#111114' }}>
            {['Test', 'Status', 'Last Run'].map(h => <span key={h} style={{ ...mono(), padding: 0 }}>{h}</span>)}
          </div>
          {tests.map((test, i) => {
            const { bg, color, label } = testStatusStyle(test.testCaseResult?.testCaseStatus);
            return (
              <div key={test.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px', padding: '5px 10px', background: i % 2 === 0 ? '#111114' : '#141418', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {test.displayName ?? test.name}
                </span>
                <span style={{ fontSize: 9, background: bg, color, padding: '2px 6px', borderRadius: 999, fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600, justifySelf: 'start' }}>
                  {label}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-dim)' }}>
                  {test.testCaseResult?.timestamp ? daysAgo(test.testCaseResult.timestamp) : '—'}
                </span>
              </div>
            );
          })}
        </div>
        )
      }
    </div>
  );
}

/* ── Compare ── */
function CompareRow({ label, v1, v2, highlight }: { label: string; v1: ReactNode; v2: ReactNode; highlight?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', padding: '6px 10px', background: highlight ? 'var(--mf-accent-dim)' : 'transparent', alignItems: 'center', borderBottom: '0.5px solid var(--mf-border)' }}>
      <span style={{ ...mono(), padding: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-muted)', paddingRight: 8 }}>{v1}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-muted)' }}>{v2}</span>
    </div>
  );
}

function CompareBody({ data, onAssetClick }: { data: CompareShape; onAssetClick: Props['onAssetClick'] }) {
  const { table1, table2, health1, health2 } = data || {};
  if (!table1 || !table2) return <EmptyCard icon={<RefreshCw size={20} />} message="Comparison data incomplete" />;
  const owner = (t: TableEntity) => t?.owners?.[0]?.displayName ?? t?.owners?.[0]?.name ?? 'Unassigned';
  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <AssetCard result={tableToResult(table1)} health={health1} onClick={() => onAssetClick(table1.fullyQualifiedName, table1.name)} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <AssetCard result={tableToResult(table2)} health={health2} onClick={() => onAssetClick(table2.fullyQualifiedName, table2.name)} />
        </div>
      </div>
      <div style={{ border: '0.5px solid var(--mf-border)', borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', padding: '5px 10px', background: '#111114' }}>
          <span style={{ ...mono(), padding: 0 }}>Metric</span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-accent)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{table1.name}</span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-accent)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table2.name}</span>
        </div>
        <CompareRow label="Health"  v1={`${health1.total} (${health1.grade})`} v2={`${health2.total} (${health2.grade})`} highlight={Math.abs(health1.total - health2.total) > 20} />
        <CompareRow label="Owner"   v1={owner(table1)}       v2={owner(table2)} />
        <CompareRow label="Desc"    v1={table1.description ? '✓ Present' : '✗ Missing'} v2={table2.description ? '✓ Present' : '✗ Missing'} />
        <CompareRow label="Updated" v1={daysAgo(table1.updatedAt)} v2={daysAgo(table2.updatedAt)} />
      </div>
    </div>
  );
}

/* ── Intent dispatcher ── */
function IntentBody({ message, piiDismissed, onDismissPII, onAssetClick }: {
  message:      Message;
  piiDismissed: boolean;
  onDismissPII: () => void;
  onAssetClick: Props['onAssetClick'];
}) {
  const { intent, data, hasPII, piiDetails: rawPII } = message;
  if (!data || intent === 'general') return null;

  const piiDetails = rawPII as PIIDetails | null;

  switch (intent) {
    case 'search': {
      const d = data as SearchData;
      return (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hasPII && !piiDismissed && piiDetails && (
            <PIIBanner columns={piiDetails.columns} owner={piiDetails.owner} onDismiss={onDismissPII} />
          )}
          {d.results.length === 0
            ? <EmptyCard icon={<Search size={20} />} message={`No assets found for "${d.query ?? 'your query'}"`} hint="Try broader terms" />
            : (
              <>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-dim)' }}>
                  Showing {d.results.length} result{d.results.length !== 1 ? 's' : ''}
                </span>
                {d.results.map(r => (
                  <AssetCard key={r.id} result={r} health={r.healthScore ?? NULL_HEALTH}
                    onClick={() => onAssetClick?.(r.fullyQualifiedName, 'details')} />
                ))}
              </>
            )
          }
        </div>
      );
    }

    case 'lineage': {
      const d = data as LineageShape;
      const hasEdges = ((d.lineage?.upstreamEdges?.length ?? 0) + (d.lineage?.downstreamEdges?.length ?? 0)) > 0;
      return (
        <div style={{ marginTop: 10 }}>
          {hasEdges
            ? <LineageGraph lineageData={d.lineage} centerFqn={d.table.fullyQualifiedName} onNodeClick={onAssetClick} />
            : <EmptyCard icon={<GitMerge size={20} />} message="No lineage data for this asset yet" />
          }
        </div>
      );
    }

    case 'impact': {
      const d = data as ImpactShape;
      return (
        <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <LineageGraph lineageData={d.lineage} centerFqn={d.lineage.entity.fullyQualifiedName} onNodeClick={onAssetClick} />
          </div>
          <div style={{ width: 220, flexShrink: 0 }}>
            <ImpactRadar impacts={d.impacts} totalCount={d.impacts.length} onItemClick={onAssetClick} />
          </div>
        </div>
      );
    }

    case 'schema': return <SchemaBody data={data as SchemaShape} />;
    case 'quality': return <QualityBody data={data as QualityShape} onAssetClick={onAssetClick} />;
    case 'compare': return <CompareBody data={data as CompareShape} onAssetClick={onAssetClick} />;

    default: return null;
  }
}

/* ════════════════════════════════
   Avatar (shared between bubble + loading)
════════════════════════════════ */
function MFAvatar() {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: 'var(--mf-accent-dim)', border: '0.5px solid #3d3060',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8, fontWeight: 700,
      color: 'var(--mf-accent)',
      fontFamily: 'var(--font-jetbrains-mono), monospace',
      flexShrink: 0,
    }}>
      MF
    </div>
  );
}

/* ════════════════════════════════
   Main component
════════════════════════════════ */
export default function MessageBubble({ message, onAssetClick, onRetry }: Props) {
  const [hovered,      setHovered]      = useState(false);
  const [piiDismissed, setPiiDismissed] = useState(false);

  /* ── User bubble ── */
  if (message.role === 'user') {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'flex-end' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{
            padding: '10px 14px',
            background: '#1e1a35',
            border: '0.5px solid #3d3060',
            borderRadius: '10px 10px 2px 10px',
            color: '#c4b5fd',
            fontSize: 14,
            lineHeight: 1.5,
          }}>
            {message.content}
          </div>
          {hovered && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-dim)' }}>
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  /* ── Error bubble ── */
  if (message.isError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px',
        background: '#1a1408', border: '0.5px solid #854f0b',
        borderRadius: 8,
      }}>
        <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
        <span style={{ flex: 1, fontSize: 13, color: '#d97706', lineHeight: 1.6 }}>
          {message.content}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              border: '0.5px solid #854f0b',
              background: 'transparent',
              color: '#f59e0b',
              fontSize: 11,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={10} />
            Try again
          </button>
        )}
      </div>
    );
  }

  /* ── AI bubble ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <MFAvatar />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-dim)' }}>
          metaflux{message.intent ? ` · ${message.intent}` : ''}
        </span>
      </div>

      {/* Response prose */}
      {message.content && (
        <p style={{ margin: 0, paddingLeft: 28, fontSize: 13, color: 'var(--mf-text-muted)', lineHeight: 1.6 }}>
          {message.content}
        </p>
      )}

      {/* Data visualisation */}
      <div style={{ paddingLeft: 28 }}>
        <IntentBody
          message={message}
          piiDismissed={piiDismissed}
          onDismissPII={() => setPiiDismissed(true)}
          onAssetClick={onAssetClick}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Loading bubble (named export)
════════════════════════════════ */
export function LoadingBubble() {
  return (
    <>
      <style>{`
        @keyframes mfDotBounce {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <MFAvatar />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--mf-text-dim)' }}>
            metaflux · thinking
          </span>
        </div>
        <div style={{ paddingLeft: 28, display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0, 400, 800].map(delay => (
            <span
              key={delay}
              style={{
                display: 'inline-block',
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--mf-accent)',
                animation: `mfDotBounce 1200ms ${delay}ms ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}