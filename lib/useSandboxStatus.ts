'use client';

import { useState, useEffect } from 'react';

export type SandboxStatus = 'checking' | 'live' | 'offline';

export function useSandboxStatus(): SandboxStatus {
  const [status, setStatus] = useState<SandboxStatus>('checking');

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch('/api/sandbox-status', {
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json() as { status: string };
        if (mounted) setStatus(data.status === 'live' ? 'live' : 'offline');
      } catch {
        if (mounted) setStatus('offline');
      }
    }

    check();
    const id = setInterval(check, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return status;
}
