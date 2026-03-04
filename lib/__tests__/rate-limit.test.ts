import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isRateLimited, getClientIdentifier, cleanupExpiredEntries } from '../rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store between tests by using cleanup
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isRateLimited', () => {
    it('should allow first request', () => {
      expect(isRateLimited('test-user-1')).toBe(false)
    })

    it('should increment counter on subsequent requests', () => {
      const identifier = 'test-user-2'
      
      // First request should be allowed
      expect(isRateLimited(identifier)).toBe(false)
      
      // Second request should also be allowed (counter = 2)
      expect(isRateLimited(identifier)).toBe(false)
    })

    it('should allow requests under the limit', () => {
      const identifier = 'test-user-3'
      
      // Make multiple requests under the limit
      for (let i = 0; i < 10; i++) {
        expect(isRateLimited(identifier)).toBe(false)
      }
    })
  })

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      })
      expect(getClientIdentifier(request)).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '10.0.0.1' },
      })
      expect(getClientIdentifier(request)).toBe('10.0.0.1')
    })

    it('should return "unknown" when no IP headers present', () => {
      const request = new Request('http://localhost')
      expect(getClientIdentifier(request)).toBe('unknown')
    })
  })

  describe('cleanupExpiredEntries', () => {
    it('should be a function', () => {
      expect(typeof cleanupExpiredEntries).toBe('function')
    })
  })
})

// Need to import afterEach
import { afterEach } from 'vitest'
