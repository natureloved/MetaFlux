'use client';

import { Activity, ShieldAlert, Database, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 60, H = 24;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - 2 - ((v - min) / range) * (H - 6);
      return `${x},${y}`;
    })
    .join(' ');
  const lastY = H - 2 - ((data[data.length - 1] - min) / range) * (H - 6);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      <circle cx={W} cy={lastY} r="2.2" fill={color} />
    </svg>
  );
}

const stats = [
  {
    label: 'Health Score',
    value: '84',
    unit: '%',
    icon: Activity,
    trend: '+2.4%',
    trendUp: true,
    barPct: 84,
    sparkData: [70, 73, 76, 79, 81, 83, 84],
    accentColor: '#10b981',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
    barFrom: 'from-emerald-500',
    barTo: 'to-cyan-400',
  },
  {
    label: 'Data Assets',
    value: '1,248',
    icon: Database,
    trend: '+128 this wk',
    trendUp: true,
    barPct: 62,
    sparkData: [900, 980, 1050, 1100, 1180, 1220, 1248],
    accentColor: '#06b6d4',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    valueColor: 'text-cyan-400',
    border: 'border-cyan-500/20',
    barFrom: 'from-cyan-500',
    barTo: 'to-blue-400',
  },
  {
    label: 'PII Alerts',
    value: '12',
    icon: ShieldAlert,
    trend: '−3 resolved',
    trendUp: false,
    barPct: 12,
    sparkData: [20, 18, 15, 17, 14, 15, 12],
    accentColor: '#ef4444',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    valueColor: 'text-red-400',
    border: 'border-red-500/20',
    barFrom: 'from-red-500',
    barTo: 'to-orange-400',
  },
  {
    label: 'Top Tier',
    value: '42',
    icon: Star,
    trend: '+5 promoted',
    trendUp: true,
    barPct: 42,
    sparkData: [28, 30, 33, 36, 38, 40, 42],
    accentColor: '#f59e0b',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    valueColor: 'text-amber-400',
    border: 'border-amber-500/20',
    barFrom: 'from-amber-500',
    barTo: 'to-yellow-300',
  },
];

export default function StatHeader() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
          className={`relative bg-[#0a0a15] border ${stat.border} rounded-2xl p-4 overflow-hidden card-lift`}
          style={{ boxShadow: `0 0 28px ${stat.accentColor}18` }}
        >
          {/* Top accent strip */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${stat.accentColor}50, transparent)`,
            }}
          />

          {/* Icon + sparkline row */}
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon size={15} className={stat.iconColor} />
            </div>
            <Sparkline data={stat.sparkData} color={stat.accentColor} />
          </div>

          {/* Value */}
          <div className="mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[28px] font-bold tabular-nums leading-none ${stat.valueColor}`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-gray-600">{stat.unit}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mt-0.5">
              {stat.label}
            </p>
          </div>

          {/* Trend */}
          <div
            className={`flex items-center gap-1 text-[10px] font-medium ${
              stat.trendUp ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            <span>{stat.trend}</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
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
