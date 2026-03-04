import { describe, it, expect, vi } from 'vitest'
import { retry, fetchWithRetry } from '../retry'

describe('Retry Utility', () => {
  describe('retry', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await retry(fn)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retriable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success')
      
      const result = await retry(fn, { initialDelay: 10 })
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should throw after max retries exceeded', async () => {
      const error = new Error('network error')
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(
        retry(fn, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow('network error')
      
      expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should not retry on non-retriable errors', async () => {
      const error = new Error('validation error')
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(
        retry(fn, { initialDelay: 10 })
      ).rejects.toThrow('validation error')
      
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should use custom shouldRetry function', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('custom retry'))
        .mockResolvedValue('success')
      
      const result = await retry(fn, {
        initialDelay: 10,
        shouldRetry: (err) => err.message.includes('custom'),
      })
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetchWithRetry', () => {
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
      
      const result = await fetchWithRetry('http://example.com', {}, { initialDelay: 10 })
      
      expect(result.status).toBe(200)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
