'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type Phase = 'compass' | 'engine' | 'toolkit';

interface ProgressIndicatorProps {
  currentPhase: Phase;
  className?: string;
}

const phases: { id: Phase; label: string }[] = [
  { id: 'compass', label: 'Compass' },
  { id: 'engine', label: 'Engine' },
  { id: 'toolkit', label: 'Toolkit' },
];

export function ProgressIndicator({ currentPhase, className = '' }: ProgressIndicatorProps) {
  const currentIndex = phases.findIndex((p) => p.id === currentPhase);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {phases.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase.id} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div
                className={`
                  relative w-2.5 h-2.5 rounded-full transition-all duration-500
                  ${isCompleted ? 'bg-compass-gold' : ''}
                  ${isCurrent ? 'bg-compass-amber shadow-lg shadow-compass-amber/30' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-700' : ''}
                `}
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="w-2 h-2 text-slate-900" strokeWidth={3} />
                  </motion.div>
                )}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-compass-amber"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>
              <span
                className={`
                  text-xs font-medium tracking-wide uppercase transition-colors duration-300
                  ${isCurrent ? 'text-compass-amber' : 'text-slate-500'}
                  ${isCompleted ? 'text-slate-400' : ''}
                `}
              >
                {phase.label}
              </span>
            </motion.div>
            {index < phases.length - 1 && (
              <div
                className={`
                  w-8 h-px transition-colors duration-500
                  ${index < currentIndex ? 'bg-compass-gold/50' : 'bg-slate-800'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
