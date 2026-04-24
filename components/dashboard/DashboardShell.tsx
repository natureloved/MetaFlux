'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileWarning, GitBranch, Zap, Sparkles } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatHeader from '@/components/dashboard/StatHeader';
import AssetGrid from '@/components/dashboard/AssetGrid';
import ChatInterface from '@/components/chat/ChatInterface';

const GOVERNANCE = [
  {
    icon: AlertTriangle,
    label: 'Unowned Assets',
    value: 14,
    bg: 'bg-red-500/5',
    border: 'border-red-500/10',
    hover: 'hover:border-red-500/25',
    ic: 'text-red-500/80',
    lc: 'text-red-300/80',
    vc: 'text-red-400',
  },
  {
    icon: FileWarning,
    label: 'Stale Docs',
    value: 28,
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/10',
    hover: 'hover:border-amber-500/25',
    ic: 'text-amber-500/80',
    lc: 'text-amber-300/80',
    vc: 'text-amber-400',
  },
  {
    icon: GitBranch,
    label: 'Schema Drift',
    value: 6,
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/10',
    hover: 'hover:border-blue-500/25',
    ic: 'text-blue-500/80',
    lc: 'text-blue-300/80',
    vc: 'text-blue-400',
  },
];

const QUICK_PROMPTS = ['Show lineage', 'Find PII tables', 'Top quality assets', 'Schema drift'];

export default function DashboardShell() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#030308] text-white overflow-hidden">
      <Sidebar onToggleChat={() => setChatOpen((o) => !o)} chatOpen={chatOpen} />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">

          {/* Aurora background orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
              transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
              className="absolute -top-48 left-1/3 w-[580px] h-[580px] bg-cyan-500/5 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
              transition={{ repeat: Infinity, duration: 17, ease: 'easeInOut' }}
              className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
              className="absolute -bottom-32 left-0 w-[420px] h-[420px] bg-blue-500/4 rounded-full blur-[80px]"
            />
          </div>

          {/* Fine grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-50" />

          {/* ── Hero section ── */}
          <div className="relative z-10 px-8 pt-9 pb-7 border-b border-white/5 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-500/50 mb-4 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse inline-block" />
                sys://metaflux.ai · live dashboard
              </div>

              {/* Heading */}
              <h1 className="text-[40px] font-bold tracking-tight leading-[1.1] mb-2">
                AI Data{' '}
                <span className="text-gradient-aurora">Command Center</span>
              </h1>
              <p className="text-gray-500 text-sm mb-7">
                Monitoring{' '}
                <span className="text-white/70 font-mono font-semibold">1,248</span>{' '}
                assets across your data landscape
              </p>

              {/* AI command bar */}
              <div className="relative max-w-xl command-bar-glow">
                <div className="flex items-center gap-3 px-4 py-3.5 bg-white/4 border border-white/10 rounded-2xl backdrop-blur-xl hover:border-cyan-500/25 focus-within:border-cyan-500/50 focus-within:bg-white/[0.06] transition-all">
                  <Sparkles size={15} className="text-cyan-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Ask MetaFlux anything… 'show PII tables in production'"
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-600 min-w-0"
                  />
                  <kbd className="text-[9px] text-gray-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono flex-shrink-0">
                    ↵
                  </kbd>
                </div>
              </div>

              {/* Quick prompts */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/25 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Stats row ── */}
          <div className="relative z-10 px-8 py-5 border-b border-white/5 flex-shrink-0">
            <StatHeader />
          </div>

          {/* ── Content grid ── */}
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar relative z-10">
            <div className="grid grid-cols-3 gap-5">

              {/* Asset grid 2/3 */}
              <div className="col-span-2">
                <AssetGrid />
              </div>

              {/* Right sidebar 1/3 */}
              <div className="space-y-5">

                {/* Governance card */}
                <div className="relative bg-[#0a0a15] border border-white/6 rounded-2xl p-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
                    Quick Governance
                  </h3>
                  <div className="space-y-2">
                    {GOVERNANCE.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between p-2.5 rounded-xl ${item.bg} border ${item.border} ${item.hover} transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon size={12} className={item.ic} />
                          <span className={`text-xs ${item.lc}`}>{item.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.vc} tabular-nums`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connect source card */}
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-violet-500/15 to-blue-500/20" />
                  <div className="absolute inset-[1px] bg-[#0a0a15] rounded-[15px]" />
                  <div className="relative p-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg">
                        <Zap size={13} className="text-white" fill="white" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Connect New Source</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                      Ingest metadata from Snowflake, BigQuery, dbt, and 40+ connectors.
                    </p>
                    <div className="flex gap-1.5 mb-4">
                      {['SF', 'BQ', 'dbt', '+'].map((label) => (
                        <div
                          key={label}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-gray-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all [box-shadow:0_4px_16px_rgba(6,182,212,0.25)]">
                      Add Connector
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* ── Collapsible chat panel ── */}
        <aside
          className={`flex-shrink-0 overflow-hidden border-l border-white/5 transition-all duration-300 ease-in-out ${
            chatOpen ? 'w-80' : 'w-0 border-transparent'
          }`}
        >
          <div className="w-80 h-full">
            <ChatInterface mode="sidebar" />
          </div>
        </aside>

      </div>
    </div>
  );
}
