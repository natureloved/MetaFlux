'use client';

import { useState, useCallback, useEffect } from 'react';

/* ── Types ── */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  data?: unknown;
  hasPII?: boolean;
  piiDetails?: unknown;
  timestamp: number;
  isError?: boolean;
}

export interface AssetContext {
  name: string;
  fqn: string;
  entityType: string;
}

/* ── localStorage helpers ── */

const LS_SESSION = 'mf-session-context';
const LS_RECENT  = 'mf-recent-queries';

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function removeLS(...keys: string[]): void {
  try { keys.forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ }
}

/* ── Hook ── */

export function useChat() {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [sessionContext, setSessionContext] = useState<AssetContext[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [input, setInput]                 = useState('');

  /* Restore session context from localStorage on mount */
  useEffect(() => {
    const saved = readLS<AssetContext[]>(LS_SESSION, []);
    if (saved.length > 0) setSessionContext(saved);
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      /* Persist recent queries (last 5 unique) */
      const recent  = readLS<string[]>(LS_RECENT, []);
      const updated = [message, ...recent.filter(q => q !== message)].slice(0, 5);
      writeLS(LS_RECENT, updated);

      try {
        /* Last 8 messages as history — current message is sent separately */
        const conversationHistory = messages
          .slice(-8)
          .map(m => ({ role: m.role, content: m.content }));

        const res  = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionContext, conversationHistory }),
        });

        const json = await res.json() as {
          error?: string;
          intent?: string;
          aiResponse?: string;
          data?: unknown;
          hasPII?: boolean;
          piiDetails?: unknown;
          assetsDiscovered?: AssetContext[];
        };

        if (json.error) throw new Error(json.error);

        /* Merge newly discovered assets into session context */
        if (json.assetsDiscovered?.length) {
          setSessionContext(prev => {
            const existing = new Set(prev.map(a => a.fqn));
            const novel    = json.assetsDiscovered!.filter(a => !existing.has(a.fqn));
            const merged   = [...prev, ...novel];
            writeLS(LS_SESSION, merged);
            return merged;
          });
        }

        setMessages(prev => [
          ...prev,
          {
            id:         crypto.randomUUID(),
            role:       'assistant',
            content:    json.aiResponse ?? '',
            intent:     json.intent,
            data:       json.data,
            hasPII:     json.hasPII,
            piiDetails: json.piiDetails,
            timestamp:  Date.now(),
          },
        ]);
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id:        crypto.randomUUID(),
            role:      'assistant',
            content:   "Couldn't reach the data catalog. Try again.",
            timestamp: Date.now(),
            isError:   true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sessionContext],
  );

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionContext([]);
    setInput('');
    removeLS(LS_SESSION, LS_RECENT);
  }, []);

  return {
    messages,
    sessionContext,
    isLoading,
    input,
    setInput,
    sendMessage,
    clearSession,
  };
}