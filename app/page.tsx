import Sidebar from '@/components/layout/Sidebar';
import StatHeader from '@/components/dashboard/StatHeader';
import AssetGrid from '@/components/dashboard/AssetGrid';
import ChatInterface from '@/components/chat/ChatInterface';
import { Search, Bell, AlertTriangle, FileWarning, GitBranch, Plus, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#05050a] text-white overflow-hidden">

      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Dashboard */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/3 w-[480px] h-[480px] bg-cyan-500/4 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-[360px] h-[360px] bg-violet-600/4 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

        {/* ── Top Header ── */}
        <header className="relative z-10 px-8 py-4 border-b border-white/5 flex items-center justify-between bg-[#05050a]/70 backdrop-blur-xl">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors" size={15} />
            <input
              type="text"
              placeholder="Search schemas, tables, owners…"
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-16 text-sm focus:outline-none focus:border-cyan-500/40 focus:bg-white/6 transition-all placeholder:text-gray-700"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-3">
            {/* Live badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Live</span>
            </div>

            <button className="relative p-2 rounded-xl bg-white/5 border border-white/8 text-gray-500 hover:text-white hover:border-white/15 transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#05050a] shadow-[0_0_4px_#ef4444]" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 border border-white/15 shadow-lg glow-cyan flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <div className="max-w-6xl mx-auto">

            {/* Hero heading */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-700 mb-3 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
                sys://metaflux · dashboard
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                Welcome back,{' '}
                <span className="text-gradient-cyan">Admin</span>
              </h1>
              <p className="text-gray-600 text-sm">
                Monitoring{' '}
                <span className="text-gray-400 font-medium">1,248 assets</span>
                {' '}across your data landscape.
              </p>
            </div>

            <StatHeader />

            <div className="grid grid-cols-3 gap-6">
              {/* Asset grid – 2/3 width */}
              <div className="col-span-2">
                <AssetGrid />
              </div>

              {/* Right sidebar cards */}
              <div className="space-y-5">

                {/* Governance card */}
                <div className="relative bg-[#08080f] border border-white/6 rounded-2xl p-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
                  <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] mb-4">
                    Quick Governance
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/25 transition-colors">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className="text-red-500/80" />
                        <span className="text-xs text-red-300/80">Unowned Assets</span>
                      </div>
                      <span className="text-sm font-bold text-red-400 tabular-nums">14</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileWarning size={12} className="text-amber-500/80" />
                        <span className="text-xs text-amber-300/80">Stale Docs</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400 tabular-nums">28</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/25 transition-colors">
                      <div className="flex items-center gap-2">
                        <GitBranch size={12} className="text-blue-500/80" />
                        <span className="text-xs text-blue-300/80">Schema Drift</span>
                      </div>
                      <span className="text-sm font-bold text-blue-400 tabular-nums">6</span>
                    </div>
                  </div>
                </div>

                {/* Connect source card */}
                <div className="relative rounded-2xl overflow-hidden">
                  {/* Gradient border via layered divs */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-violet-500/20 to-blue-500/25 rounded-2xl" />
                  <div className="absolute inset-[1px] bg-[#08080f] rounded-[15px]" />

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

                    {/* Connector chips */}
                    <div className="flex gap-1.5 mb-4">
                      {['SF', 'BQ', 'dbt', <Plus key="plus" size={10} />].map((label, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-gray-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg [box-shadow:0_4px_16px_rgba(6,182,212,0.25)]">
                      Add Connector
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. AI Assistant Sidebar */}
      <aside className="w-80 h-screen border-l border-white/5">
        <ChatInterface mode="sidebar" />
      </aside>
    </div>
  );
}
