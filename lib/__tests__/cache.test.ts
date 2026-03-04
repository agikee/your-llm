import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock localStorage before importing cache module
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
})()

// Set up globals before import
;(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock
;(global as unknown as { window: object }).window = {}

describe('Cache Utility', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Context Caching', () => {
    it('should have cacheContext function available', async () => {
      const { cacheContext } = await import('../cache')
      expect(typeof cacheContext).toBe('function')
    })

    it('should have getCachedContext function available', async () => {
      const { getCachedContext } = await import('../cache')
      expect(typeof getCachedContext).toBe('function')
    })

    it('should have getAllCachedContexts function available', async () => {
      const { getAllCachedContexts } = await import('../cache')
      expect(typeof getAllCachedContexts).toBe('function')
    })

    it('should have getRecentContext function available', async () => {
      const { getRecentContext } = await import('../cache')
      expect(typeof getRecentContext).toBe('function')
    })

    it('should have clearCachedContext function available', async () => {
      const { clearCachedContext } = await import('../cache')
      expect(typeof clearCachedContext).toBe('function')
    })
  })

  describe('Question Pattern Caching', () => {
    it('should have cacheQuestionComparison function available', async () => {
      const { cacheQuestionComparison } = await import('../cache')
      expect(typeof cacheQuestionComparison).toBe('function')
    })

    it('should have getCachedQuestionComparison function available', async () => {
      const { getCachedQuestionComparison } = await import('../cache')
      expect(typeof getCachedQuestionComparison).toBe('function')
    })

    it('should have getCachedQuestionsForContext function available', async () => {
      const { getCachedQuestionsForContext } = await import('../cache')
      expect(typeof getCachedQuestionsForContext).toBe('function')
    })
  })

  describe('Cache Stats & Utilities', () => {
    it('should have getCacheStats function available', async () => {
      const { getCacheStats } = await import('../cache')
      expect(typeof getCacheStats).toBe('function')
    })

    it('should have clearAllCache function available', async () => {
      const { clearAllCache } = await import('../cache')
      expect(typeof clearAllCache).toBe('function')
    })

    it('getCacheStats should return stats object', async () => {
      const { getCacheStats } = await import('../cache')
      const stats = getCacheStats()
      
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('size')
    })
  })
})
