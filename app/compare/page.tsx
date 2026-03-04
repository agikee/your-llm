'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Lightbulb,
  Loader2,
  AlertCircle,
  Zap,
  FileText,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  cacheQuestionComparison,
  getCachedQuestionComparison,
  getRecentContext,
  type CachedQuestion
} from '@/lib/cache';
import { trackEvent } from '@/lib/analytics';

// Skeleton component for loading states
function SkeletonText({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-deep-700/50 rounded animate-pulse ${className}`} />
  );
}

function ComparisonSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Without Context Skeleton */}
      <div className="bg-deep-800/30 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-deep-600" />
          <SkeletonText className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          <SkeletonText className="h-4 w-full" />
          <SkeletonText className="h-4 w-11/12" />
          <SkeletonText className="h-4 w-4/5" />
          <SkeletonText className="h-4 w-full" />
          <SkeletonText className="h-4 w-3/4" />
        </div>
      </div>

      {/* With Context Skeleton */}
      <div className="bg-warm-500/5 backdrop-blur-sm rounded-2xl border border-warm-500/20 p-6 relative overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-warm-500/5 blur-3xl scale-150" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-warm-500/50" />
            <SkeletonText className="h-4 w-28" />
          </div>
          <div className="space-y-3">
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-11/12" />
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

const sampleContext = `[Communication]
When interacting with Alex, be collaborative and supportive. Alex values thorough explanations and appreciates context before recommendations. Use examples to illustrate points.

[Expertise]
Alex is a creative professional with experience in design and content creation. They understand visual concepts and storytelling, preferring practical examples over theory.

[Goals]
Alex is building a personal brand and online presence. They're looking for actionable advice on content strategy and audience engagement.`;

const exampleQuestions = [
  "How should I prioritize my content creation?",
  "What's the best way to grow my audience?",
  "How do I build a personal brand?",
  "What should I focus on first?",
];

export default function ComparePage() {
  const [userContext, setUserContext] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ withoutContext: string; withContext: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Load recent context from cache on mount
  useEffect(() => {
    const recentContext = getRecentContext();
    if (recentContext?.modules?.comprehensive) {
      setUserContext(recentContext.modules.comprehensive);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsFromCache(false);

    // Track compare question asked
    trackEvent('compare_question_asked');

    // Check cache first
    const cachedResult = getCachedQuestionComparison(question, userContext);
    if (cachedResult) {
      setResult({
        withoutContext: cachedResult.withoutContextResponse,
        withContext: cachedResult.withContextResponse,
      });
      setIsFromCache(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: userContext.trim() || undefined // Use sample if empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get comparison');
      }

      const data = await response.json();
      setResult(data);

      // Cache the result
      cacheQuestionComparison(
        question,
        userContext,
        data.withoutContext,
        data.withContext
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  const useSampleContext = () => {
    setUserContext(sampleContext);
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
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-deep-300 hover:text-warm-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Link href="/" className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <Link
            href="/discover"
            className="text-sm px-4 py-2 rounded-full bg-warm-500 hover:bg-warm-400 text-deep-950 font-medium transition-colors"
          >
            Create Context
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-500/10 border border-warm-500/20 text-warm-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              See the difference context makes
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4">
              Before vs. After
            </h1>
            <p className="text-deep-300 text-lg max-w-2xl mx-auto">
              Ask any question and see how AI responds with and without personal context
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6 mb-8"
          >
            {/* Context Input */}
            <div className="bg-deep-800/50 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-deep-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Your Context (optional)
                </label>
                <button
                  type="button"
                  onClick={useSampleContext}
                  className="text-xs text-warm-500 hover:text-warm-400 transition-colors"
                >
                  Use sample context
                </button>
              </div>
              <textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Paste your generated context here, or use the sample to see the difference..."
                className="w-full h-32 px-4 py-3 bg-deep-900/50 border border-deep-700 rounded-xl text-warm-100 placeholder:text-deep-400 focus:outline-none focus:ring-2 focus:ring-warm-500/50 resize-none transition-all text-sm"
                disabled={isLoading}
                aria-label="Your personal context"
              />
              <p className="text-xs text-deep-400 mt-2">
                💡 No context? We'll use a sample. Or <Link href="/discover" className="text-warm-500 hover:underline">create your own</Link>
              </p>
            </div>

            {/* Question Input */}
            <div className="bg-deep-800/50 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 sm:p-8">
              <label className="block text-sm font-medium text-deep-300 mb-3">
                Ask a question to test
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How should I think about my next career move?"
                className="w-full h-24 px-4 py-3 bg-deep-900/50 border border-deep-700 rounded-xl text-warm-100 placeholder:text-deep-400 focus:outline-none focus:ring-2 focus:ring-warm-500/50 resize-none transition-all"
                disabled={isLoading}
                aria-label="Enter your question to compare AI responses"
              />
              
              {/* Example Questions */}
              <div className="mt-4">
                <p className="text-xs text-deep-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleQuestions.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      aria-label={`Try example question: ${example}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-deep-700/50 border border-deep-600 text-deep-300 hover:text-warm-100 hover:border-warm-500/30 transition-all"
                      disabled={isLoading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  aria-label="Compare AI responses with and without context"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-warm-500 hover:bg-warm-400 disabled:bg-deep-700 text-deep-950 disabled:text-deep-400 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-warm-500/25 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Compare Responses
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State - Skeleton */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ComparisonSkeleton />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
                aria-live="polite"
                aria-label="Comparison results"
              >
                {/* Cache indicator */}
                {isFromCache && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-deep-400"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Results from cache • </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFromCache(false);
                        // Clear cache for this question and refetch
                        const handleSubmitFresh = async () => {
                          setIsLoading(true);
                          setError(null);
                          setResult(null);
                          try {
                            const response = await fetch('/api/compare', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                question,
                                context: userContext.trim() || undefined
                              }),
                            });
                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || 'Failed to get comparison');
                            }
                            const data = await response.json();
                            setResult(data);
                            cacheQuestionComparison(question, userContext, data.withoutContext, data.withContext);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Something went wrong');
                          } finally {
                            setIsLoading(false);
                          }
                        };
                        handleSubmitFresh();
                      }}
                      className="text-warm-500 hover:text-warm-400 transition-colors"
                    >
                      Refresh
                    </button>
                  </motion.div>
                )}

                {/* Comparison Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Without Context */}
                  <div className="bg-deep-800/30 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 opacity-75">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-deep-500" />
                      <h3 className="text-sm font-medium text-deep-400">Without Context</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-deep-300 leading-relaxed whitespace-pre-wrap">{result.withoutContext}</p>
                    </div>
                  </div>

                  {/* With Context */}
                  <div className="bg-warm-500/5 backdrop-blur-sm rounded-2xl border border-warm-500/20 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-warm-500/5 blur-3xl scale-150" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-warm-500" />
                        <h3 className="text-sm font-medium text-warm-400">With Your Context</h3>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-warm-100 leading-relaxed whitespace-pre-wrap">{result.withContext}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-8"
                >
                  <p className="text-deep-300 mb-4">See the difference?</p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-warm-500/25"
                  >
                    Create Your Context
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
