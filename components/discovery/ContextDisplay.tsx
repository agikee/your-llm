'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, MessageSquare, Target, Sparkles, FileText, Download } from 'lucide-react';
import type { ContextModules } from '@/lib/ai/context-generator';

type TabKey = 'communication' | 'expertise' | 'goals' | 'comprehensive';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: Tab[] = [
  { key: 'communication', label: 'Communication', icon: MessageSquare, description: 'How to interact' },
  { key: 'expertise', label: 'Expertise', icon: Target, description: 'Their skills' },
  { key: 'goals', label: 'Goals', icon: Sparkles, description: 'What they want' },
  { key: 'comprehensive', label: 'Full Context', icon: FileText, description: 'Complete profile' },
];

interface ContextDisplayProps {
  modules: ContextModules;
  onDownload?: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [text]);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        copied
          ? 'bg-sage-500/20 text-sage-400 border border-sage-500/30'
          : 'bg-deep-800/50 text-warm-300 border border-deep-700/50 hover:border-warm-500/30 hover:text-warm-200'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy {label}
        </>
      )}
    </motion.button>
  );
}

function ModuleContent({ content }: { content: string }) {
  // Split content into paragraphs for better readability
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="prose prose-invert max-w-none">
      {paragraphs.map((paragraph, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-lg sm:text-xl md:text-2xl text-warm-100/90 leading-relaxed mb-6 font-serif"
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  );
}

export default function ContextDisplay({ modules, onDownload }: ContextDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('communication');

  const currentContent = modules[activeTab];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all ${
                isActive
                  ? 'bg-warm-500 text-deep-950 shadow-lg shadow-warm-500/25'
                  : 'bg-deep-800/50 text-warm-300 hover:bg-deep-800 hover:text-warm-200'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Content Card */}
      <motion.div
        layout
        className="relative bg-deep-900/50 backdrop-blur-sm border border-deep-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-warm-500/5 via-transparent to-sage-500/5 rounded-2xl sm:rounded-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warm-500/10 flex items-center justify-center">
              {(() => {
                const Icon = TABS.find(t => t.key === activeTab)?.icon || FileText;
                return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-warm-400" />;
              })()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
                {TABS.find(t => t.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-deep-400">
                {TABS.find(t => t.key === activeTab)?.description}
              </p>
            </div>
          </div>

          <CopyButton text={currentContent} label="Context" />
        </div>

        {/* Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleContent content={currentContent} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Use with AI Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-deep-800/30 border border-deep-700/30 rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sage-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-sage-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-warm-100 mb-3">
              Use with Any AI
            </h3>
            <p className="text-sm sm:text-base text-warm-300/80 mb-4 leading-relaxed">
              Copy the context above and paste it into any AI assistant. They'll instantly understand who you are and how to help you best.
            </p>
            <div className="bg-deep-900/50 rounded-xl p-4 border border-deep-700/30">
              <p className="text-xs sm:text-sm text-deep-300 font-mono mb-2">
                Example prompt:
              </p>
              <p className="text-sm sm:text-base text-warm-200 font-mono">
                "Here's context about me: [paste context]. Now help me with..."
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {onDownload && (
          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 bg-deep-800/50 hover:bg-deep-800 text-warm-300 hover:text-warm-200 border border-deep-700/50 hover:border-warm-500/30 rounded-xl font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download All Contexts
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
