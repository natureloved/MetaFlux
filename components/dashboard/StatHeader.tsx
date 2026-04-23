'use client';

import { Activity, ShieldAlert, Database, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  {
    label: 'Avg Health Score',
    value: '84',
    unit: '%',
    icon: Activity,
    trend: '+2.4%',
    trendUp: true,
    barPct: 84,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: '[box-shadow:0_0_28px_rgba(16,185,129,0.12)]',
    barFrom: 'from-emerald-500',
    barTo: 'to-cyan-400',
  },
  {
    label: 'Total Data Assets',
    value: '1,248',
    icon: Database,
    trend: '+128',
    trendUp: true,
    barPct: 62,
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    valueColor: 'text-cyan-400',
    border: 'border-cyan-500/20',
    glow: '[box-shadow:0_0_28px_rgba(6,182,212,0.12)]',
    barFrom: 'from-cyan-500',
    barTo: 'to-blue-400',
  },
  {
    label: 'PII Sentinel Alerts',
    value: '12',
    icon: ShieldAlert,
    trend: '−3',
    trendUp: false,
    barPct: 12,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    valueColor: 'text-red-400',
    border: 'border-red-500/20',
    glow: '[box-shadow:0_0_28px_rgba(239,68,68,0.12)]',
    barFrom: 'from-red-500',
    barTo: 'to-orange-400',
  },
  {
    label: 'Top Tier Assets',
    value: '42',
    icon: Star,
    trend: '+5',
    trendUp: true,
    barPct: 42,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    valueColor: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: '[box-shadow:0_0_28px_rgba(245,158,11,0.12)]',
    barFrom: 'from-amber-500',
    barTo: 'to-yellow-300',
  },
];

export default function StatHeader() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`relative bg-[#08080f] border ${stat.border} rounded-2xl p-5 overflow-hidden card-lift ${stat.glow}`}
        >
          {/* Subtle top gradient strip */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.barFrom.replace('from-', 'via-')}/40 to-transparent`} />

          {/* Icon + trend row */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
              <stat.icon size={18} className={stat.iconColor} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.trendUp
                ? <TrendingUp size={11} />
                : <TrendingDown size={11} />}
              <span>{stat.trend}</span>
            </div>
          </div>

          {/* Value */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[28px] font-bold tabular-nums leading-none ${stat.valueColor}`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm text-gray-600 font-medium">{stat.unit}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stat.barPct}%` }}
              transition={{ delay: i * 0.1 + 0.4, duration: 0.9, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${stat.barFrom} ${stat.barTo}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
