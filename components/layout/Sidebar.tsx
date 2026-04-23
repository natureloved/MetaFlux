'use client';

import React from 'react';
import { 
  Database, 
  Search, 
  GitMerge, 
  ShieldAlert, 
  LayoutDashboard, 
  Settings,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Database, label: 'Data Assets' },
  { icon: GitMerge, label: 'Lineage Explorer' },
  { icon: ShieldAlert, label: 'Governance' },
  { icon: Search, label: 'Search' },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">MetaFlux</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              item.active 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </button>
        
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/10">
          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs font-medium text-white">Sandbox Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
