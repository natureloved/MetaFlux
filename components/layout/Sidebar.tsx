'use client';

import {
  Database,
  Search,
  GitMerge,
  ShieldAlert,
  LayoutDashboard,
  Settings,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',         active: true  },
  { icon: Database,        label: 'Data Assets',      active: false },
  { icon: GitMerge,        label: 'Lineage Explorer', active: false },
  { icon: ShieldAlert,     label: 'Governance',       active: false },
  { icon: Search,          label: 'Search',           active: false },
];

const systemNodes = ['API', 'DB', 'AI'];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#05050a] border-r border-white/5 flex flex-col p-5 sticky top-0 overflow-hidden relative">

      {/* Right-edge gradient line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent pointer-events-none" />

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 mb-10">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center glow-cyan">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 blur-lg -z-10"
          />
        </div>
        <div>
          <p className="font-bold text-lg tracking-tight text-white leading-none">MetaFlux</p>
          <p className="text-[9px] text-cyan-500/60 font-mono tracking-[0.2em] uppercase mt-0.5">
            Command Center
          </p>
        </div>
      </div>

      {/* ── Nav label ── */}
      <p className="text-[9px] text-gray-700 uppercase tracking-[0.22em] font-bold mb-3 px-1">
        Navigation
      </p>

      {/* ── Nav items ── */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group ${
              item.active
                ? 'bg-cyan-500/10 text-cyan-300'
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {/* Active left-border glow */}
            {item.active && (
              <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            )}

            <item.icon
              size={16}
              className={item.active ? 'text-cyan-400' : 'group-hover:text-gray-300 transition-colors'}
            />
            <span className="font-medium">{item.label}</span>

            {/* Active dot */}
            {item.active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            )}
          </motion.button>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="space-y-3">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-200 hover:bg-white/5 transition-all">
          <Settings size={16} />
          <span className="font-medium">Settings</span>
        </button>

        {/* Status card */}
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-[0.2em]">
              System Status
            </p>
            <motion.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_7px_#34d399]"
            />
          </div>
          <p className="text-xs font-semibold text-white mb-2.5">Sandbox Connected</p>
          <div className="grid grid-cols-3 gap-1.5">
            {systemNodes.map((node) => (
              <div key={node} className="rounded-lg bg-white/5 border border-white/5 py-1.5 text-center">
                <p className="text-[9px] text-gray-500 mb-1">{node}</p>
                <div className="mx-2 h-0.5 rounded-full bg-gradient-to-r from-emerald-400/80 to-cyan-400/80" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
