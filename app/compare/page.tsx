'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Lightbulb, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';

// Sample context for demo
const sampleContext = `
[Communication]
When interacting with Alex, be collaborative and supportive. Alex values thorough explanations and appreciates context before recommendations. Use examples to illustrate points.

[Expertise]
Alex is a creative professional with experience in design and content creation. They understand visual concepts and storytelling, preferring practical examples over theory.

[Goals]
Alex is building a personal brand and online presence. They're looking for actionable advice on content strategy and audience engagement.
`;

const exampleQuestions = [
  "How should I prioritize my product roadmap?",
  "What's the best way to validate a new feature?",
  "How do I improve user onboarding?",
  "What metrics should I track for growth?",
];

export default function ComparePage() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ withoutContext: string; withContext: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get comparison');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-deep-950 text-warm-100 grain relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-warm-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-sage-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-warm-400/5 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-deep-300 hover:text-warm-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <Link
            href="/discover"
            className="text-sm text-deep-300 hover:text-warm-100 transition-colors"
          >
            Create Your Context
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Ask any question and see how AI responds with and without your personal context
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mb-8"
          >
            <div className="bg-deep-800/50 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 sm:p-8">
              <label className="block text-sm font-medium text-deep-300 mb-3">
                Ask a question to test
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How should I think about my career next steps?"
                className="w-full h-32 px-4 py-3 bg-deep-900/50 border border-deep-700 rounded-xl text-warm-100 placeholder:text-deep-500 focus:outline-none focus:ring-2 focus:ring-warm-500/50 focus:border-warm-500/50 resize-none transition-all"
                disabled={isLoading}
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
                  className="inline-flex items-center gap-2 px-8 py-3 bg-warm-500 hover:bg-warm-400 disabled:bg-deep-700 disabled:text-deep-400 text-deep-950 disabled:text-deep-400 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-warm-500/25 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
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
                exit={{ opacity: 0 }}
                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison Panels */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Panel Headers */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Left Panel Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-deep-700/50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-deep-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-deep-300">Without Context</h3>
                      <p className="text-xs text-deep-500">Generic AI response</p>
                    </div>
                  </div>
                  
                  {/* Right Panel Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warm-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-warm-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warm-100">With Your Context</h3>
                      <p className="text-xs text-warm-400">Personalized response</p>
                    </div>
                  </div>
                </div>

                {/* Response Panels */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Without Context Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-deep-800/30 rounded-2xl blur-sm opacity-50" />
                    <div className="relative bg-deep-800/50 backdrop-blur-sm rounded-2xl border border-deep-700/50 p-6 min-h-[300px]">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <p className="text-deep-300 leading-relaxed whitespace-pre-wrap">
                          {result.withoutContext}
                        </p>
                      </div>
                      
                      {/* Dimmed overlay to show "generic" feel */}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-deep-700/50 text-xs text-deep-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Generic
                      </div>
                    </div>
                  </motion.div>

                  {/* With Context Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-warm-500/20 via-warm-400/10 to-sage-400/20 rounded-3xl blur-xl opacity-60" />
                    
                    <div className="relative bg-gradient-to-br from-deep-800/80 to-deep-800/50 backdrop-blur-sm rounded-2xl border border-warm-500/30 p-6 min-h-[300px] shadow-lg shadow-warm-500/5">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <p className="text-warm-100 leading-relaxed whitespace-pre-wrap">
                          {result.withContext}
                        </p>
                      </div>
                      
                      {/* Enhanced badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-warm-500/20 border border-warm-500/30 text-xs text-warm-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Personalized
                      </div>
                      
                      {/* Corner accent */}
                      <div className="absolute bottom-3 right-3 w-20 h-20 bg-warm-500/5 rounded-full blur-2xl" />
                    </div>
                  </motion.div>
                </div>

                {/* Context Used Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-deep-800/30 border border-deep-700/50 rounded-xl p-4"
                >
                  <p className="text-xs text-deep-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-400" />
                    Context applied to right panel:
                  </p>
                  <pre className="text-xs text-deep-300 bg-deep-900/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                    {sampleContext.trim()}
                  </pre>
                </motion.div>

                {/* "See the difference?" Callout */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-warm-500/10 via-warm-400/5 to-sage-400/10 rounded-2xl blur-xl" />
                  <div className="relative bg-gradient-to-r from-deep-800/80 to-deep-800/60 backdrop-blur-sm rounded-2xl border border-warm-500/20 p-8 text-center">
                    <h3 className="text-2xl sm:text-3xl font-serif font-semibold mb-3">
                      See the difference? 👀
                    </h3>
                    <p className="text-deep-300 mb-6 max-w-xl mx-auto">
                      The personalized response is tailored to your communication style, 
                      expertise level, and goals. That's the power of context.
                    </p>
                    
                    {/* Which is more helpful? */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-500/10 border border-warm-500/20 mb-6">
                      <span className="text-warm-400 text-sm font-medium">
                        Which response is more helpful to YOU?
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-warm-500/25"
                      >
                        Create Your Context
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setResult(null);
                          setQuestion('');
                        }}
                        className="text-sm text-deep-400 hover:text-warm-100 transition-colors"
                      >
                        Try another question
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Placeholder */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 gap-4 md:gap-6"
              >
                {[1, 2].map((panel) => (
                  <div
                    key={panel}
                    className={`relative bg-deep-800/50 backdrop-blur-sm rounded-2xl border ${
                      panel === 2 ? 'border-warm-500/30' : 'border-deep-700/50'
                    } p-6 min-h-[300px]`}
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <Loader2 className={`w-8 h-8 animate-spin ${panel === 2 ? 'text-warm-500' : 'text-deep-500'}`} />
                      <p className={`text-sm ${panel === 2 ? 'text-warm-400' : 'text-deep-400'}`}>
                        {panel === 1 ? 'Generating generic response...' : 'Generating personalized response...'}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-deep-800 px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <div className="flex items-center gap-6 text-sm text-deep-500">
            <Link href="/discover" className="hover:text-warm-100 transition-colors">
              Start Discovery
            </Link>
            <span>© {new Date().getFullYear()} Your LLM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
