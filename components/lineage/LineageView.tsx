'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ArrowLeft, Database, Search, ChevronRight } from 'lucide-react';

interface LineageNode {
  id: string;
  name: string;
  fullyQualifiedName: string;
  entityType?: string;
  type?: string;
}

interface LineageData {
  entity: LineageNode;
  nodes: LineageNode[];
  upstreamEdges: any[];
  downstreamEdges: any[];
}

export default function LineageView({ 
  targetFqn, 
  onBack,
  onSelectAsset 
}: { 
  targetFqn: string | null; 
  onBack: () => void;
  onSelectAsset: (fqn: string) => void;
}) {
  const [data, setData] = useState<LineageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (targetFqn) fetchLineage(targetFqn);
  }, [targetFqn]);

  async function fetchLineage(fqn: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/metadata?type=lineage&fqn=${encodeURIComponent(fqn)}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch lineage:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!targetFqn) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--mf-text-muted)' }}>
        <GitBranch size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
        <h2 style={{ color: 'var(--mf-text)', margin: 0 }}>Select an asset to view lineage</h2>
        <p style={{ margin: 0, fontSize: 14 }}>Navigate to the Explore tab to pick a table or dashboard.</p>
        <button onClick={onBack} style={{ 
          marginTop: 8, padding: '8px 20px', borderRadius: 8, border: '1px solid var(--mf-border)',
          background: 'var(--mf-surface)', color: 'var(--mf-accent)', cursor: 'pointer'
        }}>
          Go to Explore
        </button>
      </div>
    );
  }

  const upstream = data?.nodes?.filter(n => data?.upstreamEdges?.some((e: any) => e.fromEntity === n.id)) || [];
  const downstream = data?.nodes?.filter(n => data?.downstreamEdges?.some((e: any) => e.toEntity === n.id)) || [];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ 
          background: 'transparent', border: 'none', color: 'var(--mf-text-dim)', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4
        }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--mf-text)' }}>
            Lineage Analysis
          </h1>
          <span className="mono" style={{ fontSize: 11, color: 'var(--mf-accent)' }}>{targetFqn}</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ 
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at center, var(--mf-surface2) 0%, transparent 70%)',
          borderRadius: 24, padding: 40, position: 'relative', overflow: 'auto'
        }}>
          {/* Layout: Upstream -> Center -> Downstream */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 60, minWidth: 'max-content' }}>
            
            {/* Upstream Column */}
            <div style={columnStyle}>
              <span style={colHeaderStyle}>Upstream</span>
              <div style={listStyle}>
                {upstream.map(node => (
                  <LineageCard key={node.id} node={node} onClick={() => onSelectAsset(node.fullyQualifiedName)} />
                ))}
                {upstream.length === 0 && <span style={emptyHintStyle}>No upstream sources</span>}
              </div>
            </div>

            <div style={arrowColStyle}><ChevronRight size={24} color="var(--mf-border)" /></div>

            {/* Target Asset */}
            <div style={{ ...columnStyle, justifyContent: 'center' }}>
              <div style={{
                padding: '24px 32px', borderRadius: 16, background: 'var(--mf-surface)',
                border: '2px solid var(--mf-accent)', boxShadow: '0 0 20px var(--mf-accent-dim)',
                textAlign: 'center', zIndex: 10
              }}>
                <Database size={24} color="var(--mf-accent)" style={{ marginBottom: 12 }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data?.entity.name}</h3>
                <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)' }}>target</span>
              </div>
            </div>

            <div style={arrowColStyle}><ChevronRight size={24} color="var(--mf-border)" /></div>

            {/* Downstream Column */}
            <div style={columnStyle}>
              <span style={colHeaderStyle}>Downstream</span>
              <div style={listStyle}>
                {downstream.map(node => (
                  <LineageCard key={node.id} node={node} onClick={() => onSelectAsset(node.fullyQualifiedName)} />
                ))}
                {downstream.length === 0 && <span style={emptyHintStyle}>No downstream consumers</span>}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function LineageCard({ node, onClick }: { node: LineageNode; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '12px 16px', background: 'var(--mf-surface)', border: '1px solid var(--mf-border)',
        borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 12, minWidth: 180
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mf-border-accent)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--mf-border)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ color: 'var(--mf-text-dim)' }}><Database size={14} /></div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mf-text)' }}>{node.name}</span>
        <span style={{ fontSize: 10, color: 'var(--mf-text-dim)' }}>{node.entityType || node.type}</span>
      </div>
    </div>
  );
}

const columnStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 20, width: 240, position: 'relative'
};

const colHeaderStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em',
  color: 'var(--mf-text-dim)', textAlign: 'center', marginBottom: 8
};

const listStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 12
};

const arrowColStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const emptyHintStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--mf-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0'
};
