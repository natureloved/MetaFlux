'use client';

import { useState, useEffect } from 'react';
import type { HealthScore } from '../../types/openmetadata';

const GRADE_COLOR: Record<string, string> = {
  A: '#22c55e',
  B: '#86efac',
  C: '#f59e0b',
  D: '#ef4444',
  F: '#ef4444',
};

const DIMS = ['description', 'quality', 'ownership', 'freshness'] as const;

interface Props {
  score: HealthScore;
  size?: 'sm' | 'md';
}

export default function HealthScoreRing({ score, size = 'md' }: Props) {
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const diameter  = size === 'sm' ? 48 : 64;
  const sw        = 5;
  const r         = (diameter - sw) / 2;
  const cx        = diameter / 2;
  const circum    = 2 * Math.PI * r;
  const dashOff   = animated ? circum - (score.total / 100) * circum : circum;
  const color     = GRADE_COLOR[score.grade] ?? '#ef4444';
  const numSize   = size === 'sm' ? 12 : 16;
  const gradeSize = size === 'sm' ? 8  : 9;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ring */}
      <svg
        width={diameter}
        height={diameter}
        style={{ display: 'block', transform: 'rotate(-90deg)' }}
      >
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#2a2a30" strokeWidth={sw} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circum}
          strokeDashoffset={dashOff}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: numSize,
          fontWeight: 700,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'var(--mf-text)',
          lineHeight: 1,
        }}>
          {score.total}
        </span>
        <span style={{
          fontSize: gradeSize,
          color,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          lineHeight: 1,
          marginTop: 2,
        }}>
          {score.grade}
        </span>
      </div>

      {/* Breakdown tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#141418',
          border: '1px solid var(--mf-border)',
          borderRadius: 8,
          padding: '10px 12px',
          zIndex: 50,
          minWidth: 172,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {DIMS.map(dim => {
            const entry = score.breakdown[dim];
            const pct   = Math.round((entry.score / 25) * 100);
            return (
              <div key={dim}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--mf-text-muted)',
                    textTransform: 'capitalize',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                  }}>
                    {dim}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--mf-text-dim)',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                  }}>
                    {entry.score}/25
                  </span>
                </div>
                <div style={{ width: 60, height: 3, background: '#2a2a30', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}