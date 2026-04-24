import { ImageResponse } from 'next/og';

export const alt = 'MetaFlux — Talk to your data catalog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0c0c0e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {/* Wordmark */}
        <div style={{ fontSize: 64, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
          MetaFlux
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: '#a78bfa', lineHeight: 1 }}>
          Talk to your data catalog
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ padding: '10px 24px', borderRadius: 999, background: '#1e1a35', border: '1px solid #3d3060', color: '#c4b5fd', fontSize: 20 }}>
            AI Chat
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 999, background: '#1e1a35', border: '1px solid #3d3060', color: '#c4b5fd', fontSize: 20 }}>
            Lineage
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 999, background: '#1e1a35', border: '1px solid #3d3060', color: '#c4b5fd', fontSize: 20 }}>
            PII Sentinel
          </div>
        </div>
      </div>
    ),
    size,
  );
}