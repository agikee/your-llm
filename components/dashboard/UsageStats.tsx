'use client';

import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, Clock, Sparkles } from 'lucide-react';

interface UsageStatsProps {
  timesUsed: number;
  platforms: string[];
  lastUpdated: string;
}

export function UsageStats({ timesUsed, platforms, lastUpdated }: UsageStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-deep-800/30 border border-deep-700/50 rounded-2xl p-6 hover:border-warm-500/20 transition-all"
    >
      <h3 className="text-lg font-semibold text-warm-100 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-warm-500" />
        Usage Stats
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Times Used */}
        <div className="bg-deep-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-deep-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            Times Used
          </div>
          <p className="text-2xl font-semibold text-warm-100">{timesUsed}</p>
        </div>

        {/* AI Platforms */}
        <div className="bg-deep-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-deep-400 text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            AI Platforms
          </div>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warm-500/20 text-warm-400"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-deep-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-deep-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Last Updated
          </div>
          <p className="text-lg font-medium text-warm-100">{lastUpdated}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Default export for convenience
export default UsageStats;
