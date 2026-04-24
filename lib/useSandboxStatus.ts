'use client';

import { useState, useEffect } from 'react';

export type SandboxStatus = 'checking' | 'live' | 'offline';

export function useSandboxStatus(): SandboxStatus {
  const [status, setStatus] = useState<SandboxStatus>('checking');

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch(
          'http://sandbox.open-metadata.org/api/v1/system/version',
          { signal: AbortSignal.timeout(8000) },
        );
        if (mounted) setStatus(res.ok ? 'live' : 'offline');
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