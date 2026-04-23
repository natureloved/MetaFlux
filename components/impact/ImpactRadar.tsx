'use client';

import React from 'react';
import { Database, BarChart3, GitMerge, AlertTriangle } from 'lucide-react';

interface ImpactItem {
  name: string;
  type: string;
  depth: number;
  fqn: string;
}

export default function ImpactRadar({ impacts }: { impacts: ImpactItem[] }) {
  const groups = [
    { label: 'Direct Impact', depth: 1, color: 'bg-red-500' },
    { label: 'Indirect Impact', depth: 2, color: 'bg-amber-500' },
    { label: 'Cascading Impact', depth: 3, color: 'bg-yellow-500' },
  ];

  const totalCount = impacts.length;

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 max-h-[300px] overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">Impact Radar</span>
        </div>
        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">
          ⚡ {totalCount} assets affected
        </span>
      </div>

      <div className="space-y-6">
        {groups.map(group => {
          const items = impacts.filter(i => i.depth === group.depth || (group.depth === 3 && i.depth >= 3));
          if (items.length === 0) return null;

          return (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-3 rounded-full ${group.color}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                  {group.label}
                </span>
              </div>

              <div className="space-y-2">
                {items.map(item => {
                  const Icon = item.type === 'table' ? Database : item.type === 'dashboard' ? BarChart3 : GitMerge;
                  return (
                    <div 
                      key={item.fqn}
                      className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                        <span className="text-xs text-gray-300 font-medium">{item.name}</span>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${group.color} text-black`}>
                        DEPTH {item.depth}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
