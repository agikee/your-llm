/**
 * Retry Utility
 *
 * Generic retry logic with exponential backoff for API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 4000,
  backoffFactor: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return true;
    }
    // Retry on 5xx errors (if included in message)
    if (error.message.includes('5') && error.message.includes('error')) {
      return true;
    }
    return false;
  },
};

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt <= opts.maxRetries && opts.shouldRetry(lastError)) {
        const delay = calculateDelay(attempt, opts);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, lastError.message);
        await sleep(delay);
      } else {
        throw lastError;
      }
    }
  }

  throw lastError;
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(url, options);

      // Check for 5xx errors
      if (response.status >= 500) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      return response;
    },
    {
      ...retryOptions,
      shouldRetry: (error: Error) => {
        // Retry on network errors
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return true;
        }
        // Retry on 5xx errors
        if (error.message.includes('Server error 5')) {
          return true;
        }
        // Use custom shouldRetry if provided
        if (retryOptions.shouldRetry) {
          return retryOptions.shouldRetry(error);
        }
        return false;
      },
    }
  );
}
