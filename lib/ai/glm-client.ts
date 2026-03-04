/**
 * GLM API Client
 * 
 * Wrapper for interacting with the Zhipu AI GLM API
 * Base URL: https://open.bigmodel.cn/api/paas/v4
 */

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMChatRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GLMChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: GLMMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

interface GLMConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Model priorities: FlashX (fastest) -> Flash (fallback)
const MODEL_PRIORITY = ['GLM-4.7-FlashX', 'GLM-4.7-Flash', 'glm-4-flash'];

class GLMClient {
  private apiKey: string;
  private baseUrl: string;
  private preferredModel: string;
  private currentModelIndex: number = 0;

  constructor(config?: GLMConfig) {
    this.apiKey = config?.apiKey || process.env.GLM_API_KEY || '';
    this.baseUrl = config?.baseUrl || process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    this.preferredModel = config?.model || MODEL_PRIORITY[0];
    
    // Find the index of the preferred model
    this.currentModelIndex = MODEL_PRIORITY.indexOf(this.preferredModel);
    if (this.currentModelIndex === -1) this.currentModelIndex = 0;

    if (!this.apiKey) {
      console.warn('GLM_API_KEY is not set. AI features will not work.');
    }
  }

  private get currentModel(): string {
    return MODEL_PRIORITY[this.currentModelIndex] || MODEL_PRIORITY[0];
  }

  /**
   * Create a chat completion with automatic model fallback
   */
  async chat(messages: GLMMessage[], options?: Partial<GLMChatRequest>): Promise<string> {
    let lastError: Error | null = null;
    
    // Try each model in priority order
    while (this.currentModelIndex < MODEL_PRIORITY.length) {
      const model = this.currentModel;
      
      try {
        console.log(`[GLM] Trying model: ${model}`);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options?.temperature ?? 0.7,
            top_p: options?.top_p ?? 0.9,
            max_tokens: options?.max_tokens ?? 1000,
            stream: false,
            ...options,
          } as GLMChatRequest),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GLM API error (${model}): ${response.status} - ${errorText}`);
        }

        const data = await response.json() as GLMChatResponse;
        
        if (data.error) {
          throw new Error(`GLM API error: ${data.error.message}`);
        }

        const content = data.choices[0]?.message?.content;
        if (content) {
          console.log(`[GLM] Success with model: ${model}`);
          return content;
        }
        
        throw new Error('Empty response from GLM API');
      } catch (error) {
        lastError = error as Error;
        console.error(`[GLM] Model ${model} failed:`, lastError.message);
        
        // Try next model
        this.currentModelIndex++;
      }
    }

    // All models failed, reset index and throw
    this.currentModelIndex = 0;
    throw lastError || new Error('All GLM models failed');
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
   * Health check for GLM API
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
    return this.currentModel;
  }
}

// Export singleton instance
export const glmClient = new GLMClient();

// Export class for testing
export { GLMClient };
export type { GLMMessage, GLMChatRequest, GLMChatResponse };
