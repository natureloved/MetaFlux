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
          <div key={i} className="h-40 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trending Assets</h2>
        <button className="text-xs text-blue-500 hover:text-blue-400 transition-colors">View All</button>
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
