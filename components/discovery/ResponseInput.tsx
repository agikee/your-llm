'use client';

import { motion } from 'framer-motion';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, SkipForward } from 'lucide-react';

interface ResponseInputProps {
  onSubmit: (response: string) => void;
  onSkip?: () => void;
  placeholder?: string;
  maxLength?: number;
  canSkip?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ResponseInput({
  onSubmit,
  onSkip,
  placeholder = 'Share your thoughts...',
  maxLength = 500,
  canSkip = true,
  disabled = false,
  className = '',
}: ResponseInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSubmit(trimmed);
      setValue('');
    }
  }, [value, disabled, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSkip = () => {
    if (onSkip && !disabled) {
      setValue('');
      onSkip();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`px-6 pb-8 ${className}`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label="Your response"
            aria-describedby="keyboard-hints char-count"
            rows={1}
            className={`
              w-full min-h-[80px] px-6 py-4
              text-lg text-slate-100 placeholder-slate-500
              bg-slate-900/80 backdrop-blur-sm
              border border-slate-700/50 rounded-2xl
              resize-none outline-none
              transition-all duration-300 ease-out
              focus:border-compass-amber/50 focus:ring-2 focus:ring-compass-amber/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />

          {/* Character count */}
          <div
            id="char-count"
            aria-live="polite"
            className={`
              absolute bottom-3 left-6 text-xs transition-colors duration-200
              ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-slate-600'}
            `}
          >
            {charCount}/{maxLength}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4">
          <div id="keyboard-hints" className="text-sm text-slate-500">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-slate-800 rounded border border-slate-700">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 text-xs bg-slate-800 rounded border border-slate-700">Shift+Enter</kbd> for new line
          </div>

          <div className="flex items-center gap-3">
            {canSkip && onSkip && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                disabled={disabled}
                aria-disabled={disabled}
                aria-label="Skip this question"
                className={`
                  flex items-center gap-2 px-4 py-2
                  text-sm text-slate-400 hover:text-slate-300
                  bg-slate-800/50 hover:bg-slate-800
                  border border-slate-700/50 rounded-xl
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              aria-disabled={disabled || !value.trim()}
              aria-label="Send your response"
              className={`
                flex items-center gap-2 px-6 py-2.5
                text-sm font-medium text-slate-900
                bg-gradient-to-r from-compass-gold to-warm-500
                rounded-xl shadow-lg shadow-compass-gold/20
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                hover:shadow-xl hover:shadow-compass-gold/30
              `}
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
