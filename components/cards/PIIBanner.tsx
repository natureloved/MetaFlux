'use client';

import { ShieldAlert, X } from 'lucide-react';

interface Props {
  columns: string[];
  owner: string | null;
  onDismiss: () => void;
}

export default function PIIBanner({ columns, owner, onDismiss }: Props) {
  return (
    <>
      <style>{`
        @keyframes shieldPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        padding: '10px 14px',
        marginBottom: 10,
        background: '#1a0808',
        border: '0.5px solid #7f1d1d',
        borderRadius: 8,
        boxSizing: 'border-box',
      }}>

        {/* Shield icon */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: '#2d0f0f',
          border: '0.5px solid #7f1d1d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#ef4444',
          animation: 'shieldPulse 2s ease-in-out infinite',
        }}>
          <ShieldAlert size={14} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Heading */}
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            color: '#ef4444',
            letterSpacing: '0.5px',
          }}>
            PII DETECTED
          </span>

          {/* Subtitle */}
          <span style={{
            fontSize: 11,
            color: '#b45252',
          }}>
            This asset contains sensitive columns
          </span>

          {/* Column pills */}
          {columns.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
              {columns.map(col => (
                <span key={col} style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  background: '#2d0f0f',
                  color: '#ef4444',
                  border: '0.5px solid #7f1d1d',
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </span>
              ))}
            </div>
          )}

          {/* Owner row */}
          <span style={{
            fontSize: 11,
            color: owner ? '#b45252' : '#f59e0b',
            marginTop: 2,
          }}>
            {owner
              ? `Data Owner: ${owner}`
              : '⚠ No owner assigned — governance risk'}
          </span>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: '#7f1d1d',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#7f1d1d')}
        >
          <X size={12} />
        </button>
      </div>
    </>
  );
}