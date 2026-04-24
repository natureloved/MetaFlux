'use client';

import { MessageSquare, Compass, GitMerge, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { icon: MessageSquare, label: 'Chat',    active: true  },
  { icon: Compass,       label: 'Explore', active: false },
  { icon: GitMerge,      label: 'Lineage', active: false },
];

const RECENT_SEARCHES = [
  'dim_customer schema',
  'fact_orders lineage',
  'payment PII tables',
  'top quality assets',
  'schema drift alerts',
];

interface Props {
  onToggleChat: () => void;
  chatOpen: boolean;
}

export default function Sidebar({ onToggleChat, chatOpen }: Props) {
  return (
    <div className="w-[220px] h-full flex flex-col bg-[#111114] border-r flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <Zap size={13} fill="currentColor" style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">MetaFlux</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 flex-shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === 'Chat' ? chatOpen : item.active;
          return (
            <button
              key={item.label}
              onClick={item.label === 'Chat' ? onToggleChat : undefined}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={
                isActive
                  ? { background: 'rgba(167,139,250,0.10)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.20)' }
                  : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                  (e.currentTarget as HTMLElement).style.background = '';
                }
              }}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Recent searches */}
      <div className="px-4 mt-7 flex-shrink-0">
        <p className="font-jetbrains text-[9px] uppercase tracking-[0.22em] font-semibold mb-2.5" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Recent
        </p>
        <div className="space-y-0.5">
          {RECENT_SEARCHES.map((s) => (
            <button
              key={s}
              className="w-full text-left px-2 py-1.5 rounded-lg font-jetbrains text-[11px] transition-all truncate"
              style={{ color: 'rgba(255,255,255,0.28)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)';
                (e.currentTarget as HTMLElement).style.background = '';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Connection status */}
      <div className="px-4 pb-5 flex-shrink-0">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Connected
            </p>
            <p className="font-jetbrains text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.22)' }}>
              sandbox · openmetadata
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
