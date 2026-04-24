'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Compass, GitMerge, Send, Plus, Trash2 } from 'lucide-react';
import { useChat } from './useChat';
import MessageBubble, { LoadingBubble } from './MessageBubble';
import { useSandboxStatus } from '../../lib/useSandboxStatus';

/* ── Constants ── */
const NAV_ITEMS = [
  { icon: MessageSquare, label: 'Chat',    active: true  },
  { icon: Compass,       label: 'Explore', active: false },
  { icon: GitMerge,      label: 'Lineage', active: false },
] as const;

const CHIPS = [
  'Show PII tables',
  'Lineage of dim_customer',
  'Failing quality tests',
  'Unowned assets',
] as const;

const LS_RECENT = 'mf-recent-queries';

function sessionId() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `session-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/* ════════════════════════════════
   Sidebar sub-components
════════════════════════════════ */
function NavButton({ item }: { item: typeof NAV_ITEMS[number] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  const highlight = item.active || hovered;
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', padding: '7px 10px', borderRadius: 8,
        border: 'none', cursor: 'pointer',
        fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
        background: item.active ? '#1a1a22' : hovered ? 'var(--mf-surface2)' : 'transparent',
        color: highlight ? 'var(--mf-accent)' : 'var(--mf-text-muted)',
        transition: 'background 0.12s, color 0.12s',
        textAlign: 'left',
      }}
    >
      <Icon size={14} />
      {item.label}
    </button>
  );
}

function RecentItem({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        display: 'block', width: '100%',
        padding: '5px 8px', borderRadius: 6,
        border: 'none', background: hovered ? 'var(--mf-surface2)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: 11,
        color: hovered ? 'var(--mf-text)' : 'var(--mf-text-muted)',
        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {label}
    </button>
  );
}

function Chip({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 13px', borderRadius: 999,
        border: `1px solid ${hovered && !disabled ? 'var(--mf-border-accent)' : 'var(--mf-border)'}`,
        background: hovered && !disabled ? 'var(--mf-accent-dim)' : 'transparent',
        color: hovered && !disabled ? 'var(--mf-accent)' : 'var(--mf-text-dim)',
        fontSize: 12, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.13s', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function SandboxStatusPill({ status }: { status: 'checking' | 'live' | 'offline' }) {
  const dotColor = status === 'live' ? 'var(--mf-green)' : status === 'offline' ? '#ef4444' : '#666';
  const label    = status === 'live' ? 'Sandbox Live' : status === 'offline' ? 'Sandbox Offline' : 'Checking…';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: dotColor,
        boxShadow: status === 'live' ? `0 0 4px ${dotColor}` : 'none',
        flexShrink: 0,
      }} />
      <span className="mono" style={{ fontSize: 10, color: dotColor }}>{label}</span>
    </div>
  );
}

/* ════════════════════════════════
   Main component
════════════════════════════════ */
interface ChatProps {
  mode?: 'full' | 'sidebar';
}

export default function ChatInterface({ mode = 'full' }: ChatProps) {
  const {
    messages, sessionContext, isLoading,
    input, setInput, sendMessage, clearSession,
  } = useChat();

  const sandboxStatus = useSandboxStatus();

  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [session] = useState(sessionId);
  const endRef = useRef<HTMLDivElement>(null);

  /* Sync recent queries from localStorage whenever messages change */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RECENT);
      if (raw) setRecentQueries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [messages.length]);

  /* Scroll to bottom on new message or loading */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  /* onRetry: re-submit the last user message */
  const lastUserContent = [...messages].reverse().find(m => m.role === 'user')?.content;
  const onRetry = lastUserContent ? () => sendMessage(lastUserContent) : undefined;

  /* Session memory pill */
  const memoryNames = sessionContext.slice(-3).map(a => a.name).join(' · ');

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ════════════════════════════════
          LEFT SIDEBAR
      ════════════════════════════════ */}
      {mode !== 'sidebar' && (
        <aside style={{
          width: 220, flexShrink: 0,
          display: 'flex', flexDirection: 'column', height: '100vh',
          background: 'var(--mf-surface)',
          borderRight: '1px solid var(--mf-border)',
        }}>

          {/* Logo */}
          <div style={{ padding: '20px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--mf-text)', lineHeight: 1 }}>
                MetaFlux
              </span>
              <span
                className="pulse-dot"
                style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--mf-green)', flexShrink: 0 }}
              />
            </div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)', display: 'block' }}>
              sandbox.open-metadata.org
            </span>
          </div>

          <div style={{ height: 1, background: 'var(--mf-border)', margin: '0 14px' }} />

          {/* Nav */}
          <nav style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map(item => <NavButton key={item.label} item={item} />)}
          </nav>

          <div style={{ height: 1, background: 'var(--mf-border)', margin: '0 14px' }} />

          {/* Recent queries */}
          <div className="scroll-area" style={{ flex: 1, padding: '12px 8px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', padding: '0 8px 8px' }}>
              Recent
            </span>
            {recentQueries.length === 0 ? (
              <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)', padding: '0 8px', opacity: 0.6 }}>
                No searches yet
              </span>
            ) : (
              recentQueries.map(q => (
                <RecentItem key={q} label={q} onClick={() => sendMessage(q)} />
              ))
            )}
          </div>

          {/* Footer — sandbox status */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--mf-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SandboxStatusPill status={sandboxStatus} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--mf-text-dim)' }}>
              {sessionContext.length > 0
                ? `${sessionContext.length} asset${sessionContext.length !== 1 ? 's' : ''} in context`
                : 'No assets in context'}
            </span>
          </div>
        </aside>
      )}

      {/* ════════════════════════════════
          RIGHT MAIN AREA
      ════════════════════════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          height: 48, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--mf-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--mf-text-dim)' }}>{session}</span>
            <span style={{
              fontSize: 9, fontWeight: 700,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              padding: '2px 7px', borderRadius: 999,
              background: 'var(--mf-accent-dim)',
              border: '0.5px solid var(--mf-border-accent)',
              color: 'var(--mf-accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {sessionContext.length} assets in context
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <TopbarBtn icon={<Plus size={12} />} label="New session" onClick={clearSession} />
            <TopbarBtn icon={<Trash2 size={12} />} label="Clear session" onClick={clearSession} />
          </div>
        </div>

        {/* Session memory pill */}
        {sessionContext.length > 0 && (
          <div style={{ flexShrink: 0, padding: '6px 24px', borderBottom: '0.5px solid var(--mf-border)', background: 'var(--mf-bg)' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 999,
                background: '#1a1a22',
                fontSize: 11,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                color: 'var(--mf-text-dim)',
              }}>
                <span style={{ color: 'var(--mf-accent)', fontSize: 8, lineHeight: 1 }}>●</span>
                Remembering: <span style={{ color: 'var(--mf-accent)' }}>{memoryNames}</span>
              </span>
            </div>
          </div>
        )}

        {/* Messages — scrollable, fills space between topbar and input */}
        <div className="scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.length === 0 && !isLoading ? (
            /* Empty state */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10, textAlign: 'center', padding: '40px 24px',
              minHeight: '100%',
            }}>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: 'var(--mf-text)', lineHeight: 1.15 }}>
                MetaFlux
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--mf-text-muted)' }}>
                Talk to your data catalog
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                {CHIPS.map(chip => (
                  <Chip key={chip} label={chip} onClick={() => sendMessage(chip)} />
                ))}
              </div>
            </div>
          ) : (
            /* Message thread */
            <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onAssetClick={(fqn, name) => sendMessage(`Tell me about ${name}`)}
                  onRetry={msg.isError ? onRetry : undefined}
                />
              ))}

              {/* Typing indicator */}
              {isLoading && <LoadingBubble />}

              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          padding: '12px 24px 18px',
          borderTop: '1px solid var(--mf-border)',
          background: 'var(--mf-bg)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Input bar */}
            <InputBar
              value={input}
              disabled={isLoading}
              onChange={setInput}
              onKeyDown={handleKeyDown}
              onSend={() => sendMessage()}
            />

            {/* Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {CHIPS.map(chip => (
                <Chip key={chip} label={chip} disabled={isLoading} onClick={() => sendMessage(chip)} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════
   Small reusable sub-components
════════════════════════════════ */
function TopbarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8,
        border: `1px solid ${hovered ? 'var(--mf-border-accent)' : 'var(--mf-border)'}`,
        background: 'transparent',
        color: hovered ? 'var(--mf-text)' : 'var(--mf-text-muted)',
        fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
        cursor: 'pointer',
        transition: 'border-color 0.12s, color 0.12s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function InputBar({ value, disabled, onChange, onKeyDown, onSend }: {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = value.trim().length > 0 && !disabled;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 999,
      border: `1px solid ${focused ? 'var(--mf-border-accent)' : 'var(--mf-border)'}`,
      background: 'var(--mf-surface)',
      transition: 'border-color 0.15s',
      opacity: disabled ? 0.6 : 1,
    }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder="Ask anything about your data catalog…"
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          color: 'var(--mf-text)', fontSize: 14,
          fontFamily: 'var(--font-syne), system-ui, sans-serif',
          minWidth: 0,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      <button
        onClick={onSend}
        disabled={!active}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          border: 'none',
          background: active ? 'var(--mf-accent)' : 'transparent',
          color: active ? '#fff' : 'var(--mf-text-dim)',
          cursor: active ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        <Send size={14} />
      </button>
    </div>
  );
}