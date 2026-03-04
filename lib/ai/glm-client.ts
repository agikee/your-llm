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
}

interface GLMConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

class GLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config?: GLMConfig) {
    this.apiKey = config?.apiKey || process.env.GLM_API_KEY || '';
    this.baseUrl = config?.baseUrl || process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    this.model = config?.model || 'glm-4-flash'; // Fast model for chat
  }

  /**
   * Create a chat completion
   */
  async chat(messages: GLMMessage[], options?: Partial<GLMChatRequest>): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.top_p ?? 0.9,
        max_tokens: options?.max_tokens ?? 2000,
        stream: false,
        ...options,
      } as GLMChatRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as GLMChatResponse;
    return data.choices[0]?.message?.content || '';
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
}

// Export singleton instance
export const glmClient = new GLMClient();

// Export class for testing
export { GLMClient };
export type { GLMMessage, GLMChatRequest, GLMChatResponse };
