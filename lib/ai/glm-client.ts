/**
 * Gemini API Client
 *
 * Wrapper for interacting with Google Gemini API
 * Model: gemini-2.5-flash-preview-05-20
 *
 * Includes retry logic with exponential backoff for resilience
 */

import { retry, type RetryOptions } from '@/lib/retry';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
  };
  systemInstruction?: {
    parts: { text: string }[];
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

class GeminiClient {
  private apiKey: string;
  private model: string;

  constructor(config?: GeminiConfig) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config?.model || 'gemini-2.5-flash';

    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features will not work.');
    }
  }

  /**
   * Convert messages to Gemini format
   */
  private convertMessages(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): {
    systemInstruction?: { parts: { text: string }[] };
    contents: GeminiMessage[];
  } {
    const systemMessages: string[] = [];
    const geminiMessages: GeminiMessage[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessages.push(msg.content);
      } else {
        geminiMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    return {
      systemInstruction: systemMessages.length > 0 
        ? { parts: systemMessages.map(text => ({ text })) }
        : undefined,
      contents: geminiMessages,
    };
  }

  /**
   * Create a chat completion with retry logic
   */
  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; max_tokens?: number; top_p?: number; retryOptions?: RetryOptions }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const { systemInstruction, contents } = this.convertMessages(messages);

    const request: GeminiRequest = {
      contents,
      systemInstruction,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.max_tokens ?? 1000,
        topP: options?.top_p ?? 0.9,
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    // Use retry wrapper for resilience
    return retry(
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = (await response.json()) as GeminiResponse;

        if (data.error) {
          throw new Error(`Gemini API error: ${data.error.message}`);
        }

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
          throw new Error('Empty response from Gemini API');
        }

        return content;
      },
      {
        maxRetries: 3,
        shouldRetry: (error: Error) => {
          // Retry on network errors
          if (error.message.includes('network') || error.message.includes('fetch')) {
            return true;
          }
          // Retry on 5xx errors from Gemini API
          if (error.message.includes('Gemini API error: 5')) {
            return true;
          }
          // Retry on rate limiting (429)
          if (error.message.includes('429')) {
            return true;
          }
          // Use custom retry logic if provided
          if (options?.retryOptions?.shouldRetry) {
            return options.retryOptions.shouldRetry(error);
          }
          return false;
        },
        ...options?.retryOptions,
      }
    );
  }

  /**
   * Chat with system prompt (for Compass agent)
   */
  async chatWithSystem(systemPrompt: string, userMessage: string): Promise<string> {
    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);
  }

  /**
   * Health check for Gemini API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Say "ok" if you can hear me.' },
      ], { max_tokens: 10 });
      return response.toLowerCase().includes('ok');
    } catch {
      return false;
    }
  }

  /**
   * Get current model being used
   */
  getModel(): string {
    return this.model;
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();

// Also export as glmClient for backward compatibility
export const glmClient = geminiClient;

// Export class for testing
export { GeminiClient };
