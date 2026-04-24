'use client';

import {
  Database,
  Search,
  GitMerge,
  ShieldAlert,
  LayoutDashboard,
  Settings,
  Zap,
  Bell,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',  active: true  },
  { icon: Database,        label: 'Assets',    active: false },
  { icon: GitMerge,        label: 'Lineage',   active: false },
  { icon: ShieldAlert,     label: 'Governance',active: false },
  { icon: Search,          label: 'Search',    active: false },
];

interface TopNavProps {
  onToggleChat?: () => void;
  chatOpen?: boolean;
}

export default function Sidebar({ onToggleChat, chatOpen }: TopNavProps) {
  return (
    <header className="h-14 bg-[#030308]/95 border-b border-white/5 flex items-center px-5 gap-4 sticky top-0 z-50 backdrop-blur-xl flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.25)]">
          <Zap size={14} className="text-white" fill="white" />
        </div>
        <div>
          <p className="font-bold text-[15px] tracking-tight text-white leading-none">MetaFlux</p>
          <p className="text-[8px] text-cyan-500/50 font-mono tracking-[0.18em] uppercase">Command Center</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 flex-shrink-0" />

      {/* Nav items */}
      <nav className="flex items-center gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              item.active
                ? 'bg-white/8 text-white border border-white/10'
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <item.icon
              size={13}
              className={item.active ? 'text-cyan-400' : 'opacity-50'}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-white/5 border border-white/8 text-gray-500 hover:text-white hover:border-white/15 transition-all">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#030308] shadow-[0_0_4px_#ef4444]" />
        </button>

        {/* AI Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
            chatOpen
              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-white/5 border border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/15'
          }`}
        >
          <Sparkles size={12} className={chatOpen ? 'text-cyan-400' : ''} />
          AI
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
          <Settings size={15} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          A
        </div>
      </div>
    </header>
  );
}
