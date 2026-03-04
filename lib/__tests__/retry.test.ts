import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { retry, fetchWithRetry } from '../retry'

describe('Retry Utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('retry - successful function without retry', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await retry(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should not delay when function succeeds immediately', async () => {
      const fn = vi.fn().mockResolvedValue('result')

      await retry(fn)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('retry - retry on failure', () => {
    it('should retry on retriable network errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 1000 })

      await vi.advanceTimersByTimeAsync(1000)

      const result = await resultPromise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should retry on fetch errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 500 })

      await vi.advanceTimersByTimeAsync(500)

      const result = await resultPromise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should retry on 5xx error messages', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('5 server error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 500 })

      await vi.advanceTimersByTimeAsync(500)

      const result = await resultPromise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should retry multiple times until success', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 100, backoffFactor: 2 })

      await vi.advanceTimersByTimeAsync(100)
      await vi.advanceTimersByTimeAsync(200)

      const result = await resultPromise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('retry - exponential backoff calculation', () => {
    it('should use initial delay for first retry', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 500 })

      await vi.advanceTimersByTimeAsync(499)
      expect(fn).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(1)
      await resultPromise

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should increase delay by backoff factor', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, {
        initialDelay: 1000,
        backoffFactor: 2,
      })

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000)
      expect(fn).toHaveBeenCalledTimes(2)

      // Second retry after 2000ms (1000 * 2)
      await vi.advanceTimersByTimeAsync(2000)
      await resultPromise

      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should respect max delay cap', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, {
        initialDelay: 1000,
        backoffFactor: 4,
        maxDelay: 2000,
      })

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000)
      expect(fn).toHaveBeenCalledTimes(2)

      // Second retry capped at 2000ms (1000 * 4 = 4000, but maxDelay is 2000)
      await vi.advanceTimersByTimeAsync(2000)
      expect(fn).toHaveBeenCalledTimes(3)

      // Third retry also capped at 2000ms
      await vi.advanceTimersByTimeAsync(2000)
      await resultPromise

      expect(fn).toHaveBeenCalledTimes(4)
    })
  })

  describe('retry - max retries exceeded', () => {
    it('should throw after max retries exceeded', async () => {
      const error = new Error('network error')
      const fn = vi.fn().mockRejectedValue(error)

      // Set up error handler before running timers
      let thrownError: Error | null = null
      const resultPromise = retry(fn, { maxRetries: 2, initialDelay: 100 }).catch(e => {
        thrownError = e
      })

      // Advance through all retry delays
      await vi.runAllTimersAsync()
      await resultPromise

      expect(thrownError).toBeInstanceOf(Error)
      expect(thrownError?.message).toBe('network error')
      expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should use default max retries of 3', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('network error'))

      // Set up error handler before running timers
      let thrownError: Error | null = null
      const resultPromise = retry(fn, { initialDelay: 100 }).catch(e => {
        thrownError = e
      })

      // Advance through all retry delays
      await vi.runAllTimersAsync()
      await resultPromise

      expect(thrownError).toBeInstanceOf(Error)
      expect(thrownError?.message).toBe('network error')
      expect(fn).toHaveBeenCalledTimes(4) // initial + 3 retries
    })
  })

  describe('retry - shouldRetry predicate', () => {
    it('should not retry on non-retriable errors', async () => {
      const error = new Error('validation error')
      const fn = vi.fn().mockRejectedValue(error)

      await expect(retry(fn, { initialDelay: 10 })).rejects.toThrow('validation error')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should use custom shouldRetry function', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('custom retry'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, {
        initialDelay: 100,
        shouldRetry: (err) => err.message.includes('custom'),
      })

      await vi.advanceTimersByTimeAsync(100)

      const result = await resultPromise
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should not retry when custom shouldRetry returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('custom error'))

      await expect(
        retry(fn, { shouldRetry: () => false })
      ).rejects.toThrow('custom error')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchWithRetry', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return response on success', async () => {
      const mockResponse = new Response('OK', { status: 200 })
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const result = await fetchWithRetry('http://example.com')

      expect(result.status).toBe(200)
    })

    it('should retry on 5xx errors', async () => {
      const mockSuccess = new Response('OK', { status: 200 })
      const mockError = new Response('Error', { status: 500 })

      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess)

      const resultPromise = fetchWithRetry('http://example.com', {}, { initialDelay: 100 })

      await vi.advanceTimersByTimeAsync(100)

      const result = await resultPromise
      expect(result.status).toBe(200)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on 4xx errors', async () => {
      const mockResponse = new Response('Not Found', { status: 404 })
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      try {
        await fetchWithRetry('http://example.com')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
