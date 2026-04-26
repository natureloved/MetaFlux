'use client';

import { useState, useEffect } from 'react';
import { Search, Database, Layout, Activity, MessageSquare, GitBranch, ArrowRight } from 'lucide-react';

interface Asset {
  name: string;
  fullyQualifiedName: string;
  entityType: string;
  description?: string;
  healthScore?: any;
}

export default function ExploreView({ 
  onViewLineage, 
  onOpenChat 
}: { 
  onViewLineage: (fqn: string) => void;
  onOpenChat: (fqn: string, name: string) => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets(q = '*') {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/metadata?type=assets&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets(searchQuery || '*');
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--mf-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>Explore Catalog</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--mf-text-dim)', fontSize: 13 }}>
            Browse and discover data assets from across the organization.
          </p>
        </div>
        
        <form onSubmit={handleSearch} style={{ position: 'relative', width: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mf-text-dim)' }} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter assets..."
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8,
              background: 'var(--mf-surface)', border: '1px solid var(--mf-border)',
              color: 'var(--mf-text)', fontSize: 13, outline: 'none'
            }}
          />
        </form>
      </div>

      {/* Grid */}
      <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12, background: 'var(--mf-surface)' }} />)}
          </div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--mf-text-muted)' }}>
            No assets found matching your search.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {assets.map(asset => (
              <AssetCard 
                key={asset.fullyQualifiedName} 
                asset={asset} 
                onViewLineage={() => onViewLineage(asset.fullyQualifiedName)}
                onOpenChat={() => onOpenChat(asset.fullyQualifiedName, asset.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset, onViewLineage, onOpenChat }: { asset: Asset; onViewLineage: () => void; onOpenChat: () => void }) {
  const typeIcon = asset.entityType === 'table' ? <Database size={16} /> : <Layout size={16} />;
  const health = asset.healthScore;
  const gradeColor = health?.grade === 'A' ? 'var(--mf-green)' : health?.grade === 'B' ? 'var(--mf-accent)' : '#ef4444';

  return (
    <div style={{
      background: 'var(--mf-surface)', border: '1px solid var(--mf-border)',
      borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'default'
    }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mf-border-accent)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mf-border)'}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, background: 'var(--mf-surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mf-accent)'
          }}>
            {typeIcon}
          </div>
          <div>
            <h3 style={{ 
              margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--mf-text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220
            }} title={asset.name}>
              {asset.name}
            </h3>
            <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)' }}>{asset.entityType}</span>
          </div>
        </div>
        
        {health && (
          <div style={{ 
            padding: '2px 8px', borderRadius: 99, background: 'var(--mf-bg)',
            border: `1px solid ${gradeColor}`, color: gradeColor, fontSize: 11, fontWeight: 700
          }}>
            {health.grade}
          </div>
        )}
      </div>

      <p style={{ 
        margin: 0, fontSize: 12, color: 'var(--mf-text-muted)', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: 36
      }}>
        {asset.description || 'No description available for this asset.'}
      </p>

      <div style={{ height: 1, background: 'var(--mf-border)', marginTop: 'auto' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onViewLineage} style={actionBtnStyle}>
          <GitBranch size={12} /> Lineage
        </button>
        <button onClick={onOpenChat} style={actionBtnStyle}>
          <MessageSquare size={12} /> Ask AI
        </button>
        <button 
          onClick={onOpenChat}
          style={{ ...actionBtnStyle, marginLeft: 'auto', padding: '4px' }} 
          title="Details"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '6px 10px', borderRadius: 6, border: '1px solid var(--mf-border)',
  background: 'transparent', color: 'var(--mf-text-dim)', fontSize: 11, fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.12s'
};
