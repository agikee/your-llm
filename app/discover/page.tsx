'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RotateCcw, Save, Download } from 'lucide-react';
import ContextDisplay from '@/components/discovery/ContextDisplay';
import type { ContextModules } from '@/lib/ai/context-generator';

type Phase = 'introduction' | 'compass' | 'engine' | 'toolkit' | 'proof' | 'synthesis' | 'complete';

interface Message {
  id: string;
  role: 'agent' | 'user';
  content: string;
  phase: Phase;
}

interface DiscoveryData {
  compass: { value: string; beneficiaries: string; emotionalLanguage?: string[] };
  engine: { beautifulProblem: string; processDriver: string };
  toolkit: { instinct: string; reasoning: string };
  proof?: { accomplishment: string; process: string; meaning: string; obstacles?: string[] };
}

const sessionId = `session-${Date.now()}`;

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex items-center justify-center gap-2 py-8"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-warm-500"
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

function AgentMessage({ content, index }: { content: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="max-w-3xl mx-auto mb-16 text-center px-4"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-warm-500/5 blur-3xl rounded-full scale-150" />
        <p className="relative text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-warm-100 leading-relaxed tracking-tight">
          {content}
        </p>
      </div>
    </motion.div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mb-12 text-center px-4"
    >
      <p className="text-base sm:text-lg md:text-xl text-warm-200/60 leading-relaxed italic">
        {content}
      </p>
    </motion.div>
  );
}

function ProgressDots({ currentPhase }: { currentPhase: Phase }) {
  const phases: Phase[] = ['compass', 'engine', 'toolkit', 'proof', 'synthesis'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {phases.map((phase, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={phase} className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-warm-500' :
                isCurrent ? 'bg-warm-400 shadow-lg shadow-warm-400/50' :
                'bg-deep-700'
              }`}
            />
            <span className={`text-xs font-medium tracking-wide uppercase transition-colors hidden sm:inline ${
              isCurrent ? 'text-warm-400' : 'text-deep-600'
            }`}>
              {phase}
            </span>
            {i < phases.length - 1 && (
              <div className={`w-6 sm:w-8 h-px ml-2 ${i < currentIndex ? 'bg-warm-500/50' : 'bg-deep-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DiscoverPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('compass');
  const [started, setStarted] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [contextModules, setContextModules] = useState<ContextModules | null>(null);
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  // Generate context when discovery completes
  useEffect(() => {
    if (currentPhase === 'complete' && discoveryData && !contextModules && !isGeneratingContext) {
      generateContext();
    }
  }, [currentPhase, discoveryData]);

  const generateContext = async () => {
    if (!discoveryData) return;

    setIsGeneratingContext(true);
    setContextError(null);

    try {
      const res = await fetch('/api/context/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, discoveryData }),
      });

      const data = await res.json();

      if (data.success && data.modules) {
        setContextModules(data.modules);
      } else {
        setContextError(data.error || 'Failed to generate context');
      }
    } catch (err) {
      console.error('Context generation error:', err);
      setContextError('Failed to generate context. Please try again.');
    }

    setIsGeneratingContext(false);
  };

  const startDiscovery = useCallback(async () => {
    setStarted(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'start' }),
      });
      const data = await res.json();
      
      setMessages([{
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: data.message,
        phase: data.phase,
      }]);

      if (data.phase) {
        setCurrentPhase(data.phase);
      }
    } catch {
      setMessages([{
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: "Hey there. I'm Compass, and I'm here to help you discover what makes you uniquely you.\n\nOver the next 15-20 minutes, we're going to have a conversation about three things: what matters to you, what energizes you, and how you naturally operate.\n\nLet's start with something meaningful. Imagine you're looking back on your life from a place of peace and fulfillment. What is the one change or contribution you would be most proud to have made?",
        phase: 'compass',
      }]);
    }

    setIsTyping(false);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      phase: currentPhase,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'respond', 
          message: userMessage.content,
          currentPhase,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'agent',
        content: data.message,
        phase: data.phase,
      }]);

      if (data.phase) {
        setCurrentPhase(data.phase);
      }
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'agent',
          content: "I appreciate you sharing that. Tell me more - what specifically about that feels most meaningful to you?",
          phase: currentPhase,
        }]);
      }, 1000);
    }

    setIsTyping(false);
  }, [input, isTyping, currentPhase]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartOver = useCallback(() => {
    setMessages([]);
    setInput('');
    setCurrentPhase('compass');
    setStarted(false);
    setDiscoveryData(null);
    setContextModules(null);
    setContextError(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!contextModules) return;

    const content = `# Your AI Context

## Communication Style
${contextModules.communication}

---

## Expertise
${contextModules.expertise}

---

## Goals
${contextModules.goals}

---

## Full Context
${contextModules.comprehensive}

---
Generated by Your LLM Discovery on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-context-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [contextModules]);

  // Completion screen with context display
  if (currentPhase === 'complete' && contextModules) {
    return (
      <div className="fixed inset-0 bg-deep-950 flex flex-col overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-warm-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-sage-400/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative flex-shrink-0 pt-6 sm:pt-8 pb-4 px-4 border-b border-deep-800/50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center shadow-lg shadow-warm-500/30"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-deep-950" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
                  Your AI Context
                </h1>
                <p className="text-sm text-deep-400">
                  Ready to use with any AI assistant
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto no-scrollbar py-8 sm:py-12 px-4">
          <ContextDisplay modules={contextModules} onDownload={handleDownload} />
        </div>

        {/* Footer */}
        <div className="relative flex-shrink-0 p-4 sm:p-6 border-t border-deep-800/50">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartOver}
              className="flex items-center gap-2 px-6 py-3 bg-deep-800/50 hover:bg-deep-800 text-warm-300 hover:text-warm-200 border border-deep-700/50 hover:border-warm-500/30 rounded-xl font-medium text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-xl font-semibold text-sm shadow-lg shadow-warm-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Context
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while generating context
  if (currentPhase === 'complete' && isGeneratingContext) {
    return (
      <div className="fixed inset-0 bg-deep-950 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-warm-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-sage-400/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-md"
        >
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center shadow-2xl shadow-warm-500/30"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-deep-950" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-100 mb-4">
            Generating Your Context
          </h2>

          <p className="text-base sm:text-lg text-deep-400 mb-8">
            Creating personalized AI context modules from your discovery responses...
          </p>

          <TypingIndicator />
        </motion.div>
      </div>
    );
  }

  // Error state
  if (currentPhase === 'complete' && contextError) {
    return (
      <div className="fixed inset-0 bg-deep-950 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="relative text-center max-w-md">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-100 mb-4">
            Something went wrong
          </h2>
          <p className="text-base sm:text-lg text-deep-400 mb-8">
            {contextError}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateContext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-xl font-semibold text-sm shadow-lg shadow-warm-500/25 transition-all"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (!started) {
    return (
      <div className="fixed inset-0 bg-deep-950 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-warm-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-sage-400/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-lg px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center shadow-2xl shadow-warm-500/30"
          >
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-deep-950" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-warm-100 mb-4 sm:mb-6">
            Begin Your Discovery
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-deep-400 mb-8 sm:mb-10 leading-relaxed">
            A 15-20 minute guided conversation to uncover what makes you uniquely you.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startDiscovery}
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold text-base sm:text-lg shadow-xl shadow-warm-500/25 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Start Discovery
          </motion.button>

          <p className="text-xs sm:text-sm text-deep-500 mt-6 sm:mt-8">
            Free • No account required • Your data stays private
          </p>
        </motion.div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="fixed inset-0 bg-deep-950 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pt-4 sm:pt-6 pb-2 px-4">
        <ProgressDots currentPhase={currentPhase} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar py-6 sm:py-8">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) =>
            message.role === 'agent' ? (
              <AgentMessage key={message.id} content={message.content} index={index} />
            ) : (
              <UserMessage key={message.id} content={message.content} />
            )
          )}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
      </div>

      <div className="flex-shrink-0 p-3 sm:p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts..."
              disabled={isTyping}
              rows={1}
              className="flex-1 resize-none bg-deep-800/50 border border-deep-700/50 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-warm-100 placeholder-deep-500 focus:outline-none focus:ring-2 focus:ring-warm-500/50 transition-all disabled:opacity-50 text-sm sm:text-base md:text-lg"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warm-500 text-deep-950 flex items-center justify-center shadow-lg shadow-warm-500/25 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
          <p className="text-xs text-deep-500 mt-2 sm:mt-3 text-center hidden sm:block">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
