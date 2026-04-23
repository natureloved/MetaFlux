'use client';

import React from 'react';
import { Database, User, Tag, Calendar, Activity } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';
import { TableEntity, HealthScore } from '../../types/openmetadata';

interface AssetCardProps {
  asset: any;
  healthScore?: HealthScore;
}

export default function AssetCard({ asset, healthScore }: AssetCardProps) {
  const source = asset._source || asset;
  
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-blue-500" />
            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
              {source.name}
            </h3>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {source.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {source.tags?.slice(0, 3).map((tag: any) => (
              <span key={tag.tagFQN} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">
                #{tag.tagFQN.split('.').pop()}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <User size={12} />
              <span>{source.owners?.[0]?.displayName || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <Activity size={12} />
              <span>{source.usageSummary?.weeklyStats?.count || 0} hits/week</span>
            </div>
          </div>
        </div>

        {healthScore && <HealthScoreRing score={healthScore} />}
      </div>
    </div>
  );
}
