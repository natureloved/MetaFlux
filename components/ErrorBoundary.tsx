'use client';

import React from 'react';

interface State { hasError: boolean }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[MetaFlux] Unhandled error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100vh', gap: 16,
          background: '#0c0c0e',
        }}>
          <span style={{ fontSize: 36, lineHeight: 1 }}>⚠</span>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#d4d4e0' }}>
            MetaFlux encountered an error
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
            Something went wrong rendering the interface.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 22px', borderRadius: 8,
              background: '#1e1a35',
              border: '1px solid #3d3060',
              color: '#a78bfa', fontSize: 14,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}