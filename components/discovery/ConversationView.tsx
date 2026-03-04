'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Compass } from 'lucide-react';
import type { Phase } from './ProgressIndicator';

export interface Message {
  id: string;
  role: 'agent' | 'user';
  content: string;
  phase: Phase;
}

interface ConversationViewProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 mb-8"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-compass-gold to-warm-600 flex items-center justify-center shadow-lg shadow-compass-gold/20">
        <Compass className="w-5 h-5 text-slate-900" />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-compass-amber"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function AgentMessage({ message, index }: { message: Message; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex items-start gap-4 mb-10 max-w-3xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-compass-gold to-warm-600 flex items-center justify-center shadow-lg shadow-compass-gold/20"
      >
        <Compass className="w-6 h-6 text-slate-900" />
      </motion.div>
      <div className="flex-1 pt-1">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-display text-slate-100 leading-relaxed tracking-tight"
        >
          {message.content}
        </motion.p>
      </div>
    </motion.div>
  );
}

function UserMessage({ message, index }: { message: Message; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="flex justify-end mb-6 max-w-3xl mx-auto"
    >
      <div className="max-w-lg px-5 py-3 rounded-2xl rounded-br-md bg-slate-800/50 border border-slate-700/50">
        <p className="text-base text-slate-300 leading-relaxed">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

export function ConversationView({
  messages,
  isTyping = false,
  className = '',
}: ConversationViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Conversation messages"
      aria-live="polite"
      aria-atomic="true"
      className={`flex-1 overflow-y-auto no-scrollbar px-6 py-8 ${className}`}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) =>
            message.role === 'agent' ? (
              <AgentMessage key={message.id} message={message} index={index} />
            ) : (
              <UserMessage key={message.id} message={message} index={index} />
            )
          )}
        </AnimatePresence>
        {isTyping && (
          <div aria-label="Assistant is typing" role="status">
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
