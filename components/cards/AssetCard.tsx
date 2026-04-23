'use client';

import { Database, User, Activity } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';
import { HealthScore } from '../../types/openmetadata';

interface AssetCardProps {
  asset: any;
  healthScore?: HealthScore;
}

const TAG_COLORS = [
  'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  'bg-violet-500/10 border-violet-500/20 text-violet-400',
  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
];

export default function AssetCard({ asset, healthScore }: AssetCardProps) {
  const source = asset._source || asset;
  const tags = source.tags?.slice(0, 3) ?? [];

  return (
    <div className="group relative bg-[#09090f] border border-white/8 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/25 hover:[box-shadow:0_4px_24px_rgba(6,182,212,0.08)]">

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-500/80 via-violet-500/60 to-transparent rounded-l-xl" />

      {/* Top separator that glows on hover */}
      <div className="absolute top-0 left-3 right-0 h-px bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start gap-4 p-4 pl-5">
        {/* Left content */}
        <div className="flex-1 min-w-0">

          {/* Name row */}
          <div className="flex items-center gap-2 mb-1.5">
            <Database size={13} className="text-cyan-500/70 shrink-0" />
            <h3 className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
              {source.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-[11px] text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {source.description || 'No description provided.'}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag: any, idx: number) => (
                <span
                  key={tag.tagFQN}
                  className={`text-[10px] border px-2 py-0.5 rounded-md font-medium ${TAG_COLORS[idx % TAG_COLORS.length]}`}
                >
                  {tag.tagFQN.split('.').pop()}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <User size={11} className="text-gray-700" />
              <span>{source.owners?.[0]?.displayName || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <Activity size={11} className="text-gray-700" />
              <span className="tabular-nums">{source.usageSummary?.weeklyStats?.count ?? 0} hits/wk</span>
            </div>
          </div>
        </div>

        {/* Health ring */}
        {healthScore && (
          <div className="shrink-0">
            <HealthScoreRing score={healthScore} />
          </div>
        )}
      </div>
    </div>
  );
}
