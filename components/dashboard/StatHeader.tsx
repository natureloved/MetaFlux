'use client';

import React from 'react';
import { Activity, ShieldAlert, Database, Star } from 'lucide-react';

export default function StatHeader() {
  const stats = [
    { label: 'Avg Health Score', value: '84', unit: '%', icon: Activity, color: 'text-green-500' },
    { label: 'Total Data Assets', value: '1,248', icon: Database, color: 'text-blue-500' },
    { label: 'PII Sentinel Alerts', value: '12', icon: ShieldAlert, color: 'text-red-500' },
    { label: 'Top Tier Assets', value: '42', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center gap-6"
        >
          <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              {stat.unit && <span className="text-sm text-gray-500">{stat.unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
