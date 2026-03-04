'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Plus,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  LogIn,
  ExternalLink,
  FileText
} from 'lucide-react';
import { ContextCard, UsageStats } from '@/components/dashboard';
import { getRecentContext, getAllCachedContexts, type CachedContext } from '@/lib/cache';

// Skeleton components for loading states
function SkeletonText({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-deep-700/50 rounded animate-pulse ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-deep-800/30 border border-deep-700/50 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonText className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <SkeletonText className="h-5 w-32 mb-2" />
          <SkeletonText className="h-3 w-48" />
        </div>
      </div>
      <SkeletonText className="h-4 w-full mb-3" />
      <SkeletonText className="h-4 w-3/4 mb-3" />
      <SkeletonText className="h-4 w-5/6 mb-6" />
      <div className="flex gap-3">
        <SkeletonText className="h-9 w-20 rounded-lg" />
        <SkeletonText className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="bg-deep-800/30 border border-deep-700/50 rounded-2xl p-6 animate-pulse">
      <SkeletonText className="h-5 w-24 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <SkeletonText className="h-8 w-12 mx-auto mb-2" />
          <SkeletonText className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center">
          <SkeletonText className="h-8 w-16 mx-auto mb-2" />
          <SkeletonText className="h-3 w-14 mx-auto" />
        </div>
        <div className="text-center">
          <SkeletonText className="h-8 w-20 mx-auto mb-2" />
          <SkeletonText className="h-3 w-12 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Mock data - sample user context
const mockUser = {
  name: 'Alex',
  email: 'alex@example.com',
  avatar: null,
};

const mockContext = {
  id: 'ctx_1',
  name: 'My Context',
  comprehensive: `When interacting with Alex, be collaborative and supportive. Alex values thorough explanations and appreciates context before recommendations.

Alex is a creative professional with experience in design and content creation. They understand visual concepts and storytelling, preferring practical examples over theoretical discussions.

Key principles:
• Provide context before recommendations
• Use visual and practical examples
• Support collaborative exploration
• Value thoroughness over speed
• Connect concepts to real-world applications`,
  modules: {
    communication: `Alex values collaborative, supportive communication. Prefers thorough explanations with context before recommendations. Appreciates visual and practical examples.

Communication style:
• Start with context, then give recommendations
• Use examples and analogies
• Support exploration and iteration
• Be patient and thorough`,
    expertise: `Creative professional with expertise in design and content creation. Strong visual thinking skills and storytelling ability. Experience translating complex ideas into accessible content.

Core competencies:
• Visual design and aesthetics
• Content strategy and storytelling
• Creative problem-solving
• Audience engagement
• Brand development`,
    goals: `Building a personal brand and online presence. Creating meaningful content that resonates with target audience. Looking to grow audience and establish thought leadership in creative industry.

Current focus areas:
• Content strategy and consistency
• Growing social media presence
• Building email newsletter
• Establishing unique creative voice`,
  },
  createdAt: '2024-03-01',
  lastUsed: '2024-03-03',
};

const mockStats = {
  timesUsed: 12,
  platforms: ['ChatGPT', 'Claude', 'Gemini'],
  lastUpdated: '2 days ago',
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasContext, setHasContext] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cachedContexts, setCachedContexts] = useState<CachedContext[]>([]);
  const [activeContext, setActiveContext] = useState<CachedContext | null>(null);

  // Load user data and cached contexts
  useEffect(() => {
    const loadUserData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Load cached contexts
      const contexts = getAllCachedContexts();
      setCachedContexts(contexts);

      // Set the most recent context as active if available
      if (contexts.length > 0) {
        setActiveContext(contexts[0]);
        setHasContext(true);
      }

      setIsLoading(false);
    };
    loadUserData();
  }, []);

  const handleCopyFull = async () => {
    const textToCopy = activeContext?.modules?.comprehensive || mockContext.comprehensive;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    console.log('Edit context');
  };

  const handleCopy = () => {
    console.log('Copy context');
  };

  const handleShare = () => {
    console.log('Share context');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this context?')) {
      setHasContext(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-950 text-warm-100 grain relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-warm-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-sage-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/discover" className="text-sm text-deep-300 hover:text-warm-100 transition-colors">
              Discover
            </Link>
            <Link href="/dashboard" className="text-sm text-warm-400 font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-6">
              {/* User Header Skeleton */}
              <div className="flex items-center gap-4 mb-8 animate-pulse">
                <SkeletonText className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
                <div className="flex-1">
                  <SkeletonText className="h-7 w-48 mb-2" />
                  <SkeletonText className="h-4 w-32" />
                </div>
              </div>
              {/* Content Skeletons */}
              <SkeletonCard />
              <SkeletonStats />
            </div>
          ) : (
            <>
              {/* User Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center shadow-lg shadow-warm-500/25">
                  {mockUser.avatar ? (
                    <img src={mockUser.avatar} alt={mockUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 sm:w-8 sm:h-8 text-deep-950" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-100">
                    Welcome back, {mockUser.name}
                  </h1>
                  <p className="text-deep-400 text-sm sm:text-base">
                    {mockUser.email}
                  </p>
                </div>
                {/* Sign in prompt (mock) */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Sign in to save your context"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-deep-800/50 border border-deep-700/50 text-deep-300 hover:text-warm-100 hover:border-warm-500/30 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in to save
                </motion.button>
              </motion.div>

              {/* Content Area */}
              {hasContext ? (
                <div className="space-y-6">
                  {/* Cached Contexts Section */}
                  {cachedContexts.length > 1 && (
                    <div className="bg-deep-800/30 border border-deep-700/50 rounded-2xl p-4">
                      <p className="text-sm text-deep-400 mb-3">Your cached contexts:</p>
                      <div className="flex flex-wrap gap-2">
                        {cachedContexts.map((ctx, i) => (
                          <button
                            key={ctx.id}
                            onClick={() => setActiveContext(ctx)}
                            aria-label={`Switch to context ${i + 1}`}
                            aria-pressed={activeContext?.id === ctx.id}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                              activeContext?.id === ctx.id
                                ? 'bg-warm-500 text-deep-950 font-medium'
                                : 'bg-deep-700/50 border border-deep-600 text-deep-300 hover:text-warm-100 hover:border-warm-500/30'
                            }`}
                          >
                            Context {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Context Card */}
                  <ContextCard
                    context={activeContext ? {
                      id: activeContext.id,
                      name: 'My Context',
                      comprehensive: activeContext.modules.comprehensive,
                      modules: activeContext.modules,
                      createdAt: activeContext.createdAt,
                      lastUsed: activeContext.createdAt,
                    } : mockContext}
                    onEdit={handleEdit}
                    onCopy={handleCopy}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />

                  {/* Usage Stats */}
                  <UsageStats
                    timesUsed={mockStats.timesUsed}
                    platforms={mockStats.platforms}
                    lastUpdated={mockStats.lastUpdated}
                  />

                  {/* Use with AI Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-deep-800/30 border border-deep-700/50 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-warm-100 mb-4 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-warm-500" />
                      Use with AI
                    </h3>
                    <div className="space-y-4">
                      <p className="text-deep-300 text-sm leading-relaxed">
                        Copy your context and paste it at the beginning of any AI conversation to get personalized responses.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCopyFull}
                          aria-label={copied ? "Context copied to clipboard" : "Copy your full context to clipboard"}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-lg font-medium transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Full Context
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label="Download your context as a text file"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-deep-700/50 hover:bg-deep-700 text-warm-100 rounded-lg font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Download as Text
                        </motion.button>
                      </div>
                      <div className="mt-4 p-4 bg-deep-900/50 rounded-lg">
                        <p className="text-xs text-deep-400 mb-2 font-medium">Example usage:</p>
                        <p className="text-sm text-deep-300 italic">
                          "Before we start, here's some context about me: [paste your context]. Now, can you help me with..."
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Create New CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-6"
                  >
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 text-warm-400 hover:text-warm-300 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create another context
                    </Link>
                  </motion.div>
                </div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 sm:py-24"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-warm-500/20 to-sage-400/10 flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-warm-500" />
                  </motion.div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-100 mb-4">
                    No context yet
                  </h2>
                  <p className="text-deep-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
                    Start your discovery journey to create a personalized AI context that works everywhere.
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/discover"
                      aria-label="Start discovery to create your first AI context"
                      className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold text-base sm:text-lg shadow-xl shadow-warm-500/25 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      Create Your First Context
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                  <p className="text-deep-400 text-sm mt-6">
                    Free to start • 15-20 minutes • Export anywhere
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-deep-800 px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <p className="text-sm text-deep-400">
            © {new Date().getFullYear()} Your LLM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
