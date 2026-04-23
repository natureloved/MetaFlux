import Sidebar from '@/components/layout/Sidebar';
import StatHeader from '@/components/dashboard/StatHeader';
import AssetGrid from '@/components/dashboard/AssetGrid';
import ChatInterface from '@/components/chat/ChatInterface';
import { Search, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#080808] text-white overflow-hidden">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-[#080808]/50 backdrop-blur-md">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search schemas, tables, or owners..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#080808]" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 border border-white/20 shadow-lg" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
              <p className="text-gray-500">Here's what's happening in your data landscape today.</p>
            </div>

            <StatHeader />

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <AssetGrid />
              </div>
              
              <div className="space-y-8">
                {/* Governance Card */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Governance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <span className="text-xs text-red-200">Unowned Assets</span>
                      <span className="text-xs font-bold text-red-500">14</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <span className="text-xs text-amber-200">Stale Documentation</span>
                      <span className="text-xs font-bold text-amber-500">28</span>
                    </div>
                  </div>
                </div>

                {/* Integration Card */}
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-2">Connect New Source</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Easily ingest metadata from Snowflake, BigQuery, or dbt.
                  </p>
                  <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Add Connector
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. AI Assistant Sidebar */}
      <aside className="w-80 h-screen">
        <ChatInterface mode="sidebar" />
      </aside>
    </div>
  );
}
