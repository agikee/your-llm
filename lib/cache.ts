/**
 * Simple Cache Utility
 *
 * MVP caching solution using localStorage for persistence
 * For production, would use Vercel KV or Redis
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
}

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour default TTL
const CONTEXT_TTL = 1000 * 60 * 60 * 24; // 24 hours for contexts
const QUESTION_TTL = 1000 * 60 * 60 * 2; // 2 hours for question patterns

// In-memory stats tracking
const stats: CacheStats = { hits: 0, misses: 0 };

/**
 * Check if running in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get item from localStorage cache
 */
function getFromStorage<T>(key: string): CacheEntry<T> | null {
  if (!isBrowser()) return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry = JSON.parse(item) as CacheEntry<T>;
    const now = Date.now();

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    stats.hits++;
    return entry;
  } catch {
    return null;
  }
}

/**
 * Set item in localStorage cache
 */
function setToStorage<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (!isBrowser()) return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Storage might be full, try to clear old entries
    console.warn('Cache storage full, clearing old entries');
    clearExpiredEntries();
  }
}

/**
 * Clear expired entries from cache
 */
function clearExpiredEntries(): void {
  if (!isBrowser()) return;

  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('cache_')) continue;

    try {
      const item = localStorage.getItem(key);
      if (!item) continue;

      const entry = JSON.parse(item) as CacheEntry<unknown>;
      if (now - entry.timestamp > entry.ttl) {
        keysToRemove.push(key);
      }
    } catch {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ============================================================================
// Context Caching
// ============================================================================

const CONTEXT_CACHE_PREFIX = 'cache_context_';

export interface CachedContext {
  id: string;
  modules: {
    communication: string;
    expertise: string;
    goals: string;
    comprehensive: string;
  };
  discoveryData?: unknown;
  createdAt: string;
}

/**
 * Cache a generated context
 */
export function cacheContext(sessionId: string, context: CachedContext): void {
  const key = `${CONTEXT_CACHE_PREFIX}${sessionId}`;
  setToStorage(key, context, CONTEXT_TTL);
}

/**
 * Get cached context by session ID
 */
export function getCachedContext(sessionId: string): CachedContext | null {
  const key = `${CONTEXT_CACHE_PREFIX}${sessionId}`;
  const entry = getFromStorage<CachedContext>(key);
  return entry?.data ?? null;
}

/**
 * Get all cached contexts
 */
export function getAllCachedContexts(): CachedContext[] {
  if (!isBrowser()) return [];

  const contexts: CachedContext[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CONTEXT_CACHE_PREFIX)) continue;

    const entry = getFromStorage<CachedContext>(key);
    if (entry?.data) {
      contexts.push(entry.data);
    }
  }

  return contexts.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get the most recent cached context
 */
export function getRecentContext(): CachedContext | null {
  const contexts = getAllCachedContexts();
  return contexts[0] ?? null;
}

/**
 * Clear a specific cached context
 */
export function clearCachedContext(sessionId: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(`${CONTEXT_CACHE_PREFIX}${sessionId}`);
}

// ============================================================================
// Question Pattern Caching
// ============================================================================

const QUESTION_CACHE_PREFIX = 'cache_question_';

export interface CachedQuestion {
  question: string;
  contextHash: string;
  withoutContextResponse: string;
  withContextResponse: string;
  timestamp: string;
}

/**
 * Generate a simple hash for context (for cache key)
 */
function hashContext(context: string): string {
  let hash = 0;
  for (let i = 0; i < context.length; i++) {
    const char = context.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Cache a question comparison result
 */
export function cacheQuestionComparison(
  question: string,
  context: string,
  withoutContextResponse: string,
  withContextResponse: string
): void {
  const contextHash = hashContext(context || 'default');
  const questionKey = question.toLowerCase().slice(0, 50).replace(/\s+/g, '_');
  const key = `${QUESTION_CACHE_PREFIX}${contextHash}_${questionKey}`;

  const cached: CachedQuestion = {
    question,
    contextHash,
    withoutContextResponse,
    withContextResponse,
    timestamp: new Date().toISOString(),
  };

  setToStorage(key, cached, QUESTION_TTL);
}

/**
 * Get cached question comparison
 */
export function getCachedQuestionComparison(
  question: string,
  context: string
): CachedQuestion | null {
  const contextHash = hashContext(context || 'default');
  const questionKey = question.toLowerCase().slice(0, 50).replace(/\s+/g, '_');
  const key = `${QUESTION_CACHE_PREFIX}${contextHash}_${questionKey}`;

  const entry = getFromStorage<CachedQuestion>(key);
  return entry?.data ?? null;
}

/**
 * Get all cached questions for a context
 */
export function getCachedQuestionsForContext(context: string): CachedQuestion[] {
  if (!isBrowser()) return [];

  const contextHash = hashContext(context || 'default');
  const questions: CachedQuestion[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(QUESTION_CACHE_PREFIX)) continue;
    if (!key.includes(contextHash)) continue;

    const entry = getFromStorage<CachedQuestion>(key);
    if (entry?.data) {
      questions.push(entry.data);
    }
  }

  return questions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============================================================================
// Cache Stats & Utilities
// ============================================================================

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats & { size: number } {
  let size = 0;
  if (isBrowser()) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        size++;
      }
    }
  }

  return { ...stats, size };
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  if (!isBrowser()) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cache_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
