'use client';

import React, { useState, useEffect } from 'react';
import AssetCard from '../cards/AssetCard';
import { searchAssets } from '@/lib/openmetadata';
import { motion } from 'framer-motion';

export default function AssetGrid() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopAssets() {
      try {
        const result = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: "Show me top quality tables in sample_data", sessionContext: [] }),
        });
        const json = await result.json();
        if (json.intent === 'search') {
          setAssets(json.data.hits?.hits || []);
        }
      } catch (error) {
        console.error('Failed to fetch top assets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopAssets();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-[#09090f] animate-shimmer rounded-xl border border-white/5 overflow-hidden" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">Trending Assets</h2>
          <span className="text-[9px] font-bold text-cyan-500/60 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded-md tabular-nums">
            {assets.length}
          </span>
        </div>
        <button className="text-[11px] text-cyan-500/70 hover:text-cyan-400 transition-colors font-medium">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {assets.map((hit, idx) => (
          <motion.div
            key={hit._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <AssetCard asset={hit} healthScore={hit.healthScore} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
