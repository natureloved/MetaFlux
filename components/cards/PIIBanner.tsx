'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PIIBannerProps {
  piiColumns: string[];
  owner: { name: string; email: string } | null;
}

export default function PIIBanner({ piiColumns, owner }: PIIBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-[#1a0505] border border-red-500/50 rounded-lg p-4 mb-4 overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-red-500 mt-1"
          >
            <ShieldAlert size={20} />
          </motion.div>
          
          <div>
            <h3 className="text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
              PII Detected
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Sensitive columns: <span className="text-red-300 font-medium">{piiColumns.join(', ')}</span>
            </p>
            
            <div className="flex items-center gap-2 text-xs bg-red-950/30 w-fit px-2 py-1 rounded border border-red-900/30">
              <User size={12} className="text-red-400" />
              <span className="text-gray-300 font-medium">Data Owner:</span>
              <span className="text-red-400">
                {owner ? `${owner.name} (${owner.email})` : '⚠️ No owner assigned'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsDismissed(true)}
          className="text-gray-600 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
