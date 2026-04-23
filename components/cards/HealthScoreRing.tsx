'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthScore } from '../../types/openmetadata';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HealthScoreRing({ score }: { score: HealthScore }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.total / 100) * circumference;

  const color = 
    score.total >= 65 ? '#22c55e' : 
    score.total >= 50 ? '#f59e0b' : 
    '#ef4444';

  return (
    <div className="relative group flex flex-col items-center justify-center w-24 h-24">
      <svg className="w-20 h-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#222"
          strokeWidth="6"
          fill="transparent"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-white">{score.total}</span>
        <span className="text-[10px] font-medium opacity-60 mt-[-4px] uppercase">{score.grade}</span>
      </div>

      {/* Tooltip Breakdown */}
      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
        <div className="bg-[#111] border border-white/10 rounded-lg p-3 shadow-2xl min-w-[180px]">
          <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Health Breakdown</h4>
          {Object.entries(score.breakdown).map(([key, val]) => (
            <div key={key} className="mb-2 last:mb-0">
              <div className="flex justify-between text-[10px] text-gray-300 mb-1 capitalize">
                <span>{key}</span>
                <span>{val}/25</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(val / 25) * 100}%` }}
                  transition={{ delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
