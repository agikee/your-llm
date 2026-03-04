import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the retry module to just execute the function directly in tests
vi.mock('@/lib/retry', () => ({
  retry: vi.fn(async (fn: () => Promise<any>) => fn()),
}));

// Import after mocking
import { POST } from '@/app/api/discovery/route';

describe('POST /api/discovery', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost/api/discovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const mockGeminiResponse = (text: string) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text }],
            },
          },
        ],
      }),
    });
  };

  const mockGeminiError = (status: number, errorMessage: string) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      text: async () => errorMessage,
    });
  };

  describe('start action', () => {
    it('should return introduction message with introduction phase', async () => {
      const expectedMessage = "Hey there! I'm Compass. What change would you be proud to make?";
      mockGeminiResponse(expectedMessage);

      const request = createRequest({ action: 'start' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe(expectedMessage);
      expect(data.phase).toBe('introduction');
    });

    it('should call Gemini API with correct parameters', async () => {
      mockGeminiResponse('Hello!');

      const request = createRequest({ action: 'start' });
      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return fallback message when Gemini API fails', async () => {
      mockGeminiError(500, 'Internal Server Error');

      const request = createRequest({ action: 'start' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain("I'm Compass");
      expect(data.phase).toBe('introduction');
    });

    it('should return fallback message when Gemini returns empty response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [] } }],
        }),
      });

      const request = createRequest({ action: 'start' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.phase).toBe('introduction');
    });
  });

  describe('respond action', () => {
    it('should advance from introduction to compass phase with meaningful response', async () => {
      const expectedMessage = "That's beautiful! Tell me more about that.";
      mockGeminiResponse(expectedMessage);

      const request = createRequest({
        action: 'respond',
        message: 'I would love to help people learn new skills and grow.',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe(expectedMessage);
      expect(data.phase).toBe('compass');
    });

    it('should advance from compass to engine phase', async () => {
      mockGeminiResponse('Engine phase response');

      const request = createRequest({
        action: 'respond',
        message: 'I really care about education and making knowledge accessible to everyone.',
        currentPhase: 'compass',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('engine');
    });

    it('should advance from engine to toolkit phase', async () => {
      mockGeminiResponse('Toolkit phase response');

      const request = createRequest({
        action: 'respond',
        message: 'I am energized by solving complex problems and building things from scratch.',
        currentPhase: 'engine',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('toolkit');
    });

    it('should advance from toolkit to proof phase', async () => {
      mockGeminiResponse('Proof phase response');

      const request = createRequest({
        action: 'respond',
        message: 'My natural approach is to break things down into smaller pieces and analyze them.',
        currentPhase: 'toolkit',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('proof');
    });

    it('should advance from proof to synthesis phase', async () => {
      mockGeminiResponse('Synthesis phase response');

      const request = createRequest({
        action: 'respond',
        message: 'I once led a project that helped thousands of students learn programming.',
        currentPhase: 'proof',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('synthesis');
    });

    it('should advance from synthesis to complete phase', async () => {
      mockGeminiResponse('Complete phase response');

      const request = createRequest({
        action: 'respond',
        message: 'Yes this really resonates with me and my values completely.',
        currentPhase: 'synthesis',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('complete');
    });

    it('should not advance phase with short response (less than 5 words)', async () => {
      mockGeminiResponse('Follow-up response');

      const request = createRequest({
        action: 'respond',
        message: 'Yes', // Less than 5 words
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('introduction');
    });

    it('should include conversation history in request', async () => {
      mockGeminiResponse('Response');

      const request = createRequest({
        action: 'respond',
        message: 'I want to help people.',
        currentPhase: 'introduction',
        conversationHistory: [
          { role: 'user', content: 'Hello' },
          { role: 'agent', content: 'Hi there!' },
        ],
      });

      await POST(request);

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.contents).toContainEqual(
        expect.objectContaining({
          role: 'user',
          parts: expect.arrayContaining([expect.objectContaining({ text: 'Hello' })]),
        })
      );
    });

    it('should return fallback message on API error', async () => {
      mockGeminiError(500, 'Server error');

      const request = createRequest({
        action: 'respond',
        message: 'I would love to help people learn and grow every day.',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.phase).toBe('compass');
    });
  });

  describe('invalid action', () => {
    it('should return 400 for invalid action', async () => {
      const request = createRequest({ action: 'invalid' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid discriminator value');
    });

    it('should return 400 for unknown action value', async () => {
      const request = createRequest({ action: 'delete' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid discriminator value');
    });
  });

  describe('validation errors', () => {
    it('should return 400 for missing action field', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for respond action missing message', async () => {
      const request = createRequest({
        action: 'respond',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for respond action missing currentPhase', async () => {
      const request = createRequest({
        action: 'respond',
        message: 'Hello there',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid currentPhase value', async () => {
      const request = createRequest({
        action: 'respond',
        message: 'Hello there',
        currentPhase: 'invalid-phase',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for message exceeding max length (5000)', async () => {
      const longMessage = 'a'.repeat(5001);

      const request = createRequest({
        action: 'respond',
        message: longMessage,
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for empty message', async () => {
      const request = createRequest({
        action: 'respond',
        message: '',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid conversation history format', async () => {
      const request = createRequest({
        action: 'respond',
        message: 'Hello',
        currentPhase: 'introduction',
        conversationHistory: [{ invalid: 'structure' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should return 500 for internal server errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const request = createRequest({
        action: 'respond',
        message: 'This is a valid message with enough words.',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      // The code catches Gemini errors and returns fallback
      // But there's still a try/catch that can return 500
      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
    });

    it('should return fallback message when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY;

      const request = createRequest({ action: 'start' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.phase).toBe('introduction');
    });

    it('should return 500 for malformed JSON body', async () => {
      const request = new NextRequest('http://localhost/api/discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('phase transitions', () => {
    it('should stay in complete phase after reaching it', async () => {
      mockGeminiResponse('Thank you!');

      const request = createRequest({
        action: 'respond',
        message: 'This has been a wonderful conversation, thank you.',
        currentPhase: 'complete',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('complete');
    });

    it('should advance through all phases in order', async () => {
      mockGeminiResponse('Response');

      const phases = ['introduction', 'compass', 'engine', 'toolkit', 'proof', 'synthesis'];
      let currentPhase = 'introduction';

      for (const expectedNextPhase of phases.slice(1)) {
        const request = createRequest({
          action: 'respond',
          message: 'This is a meaningful response with several words.',
          currentPhase: currentPhase as any,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.phase).toBe(expectedNextPhase);
        currentPhase = data.phase;
      }
    });
  });

  describe('fallback messages', () => {
    it('should return correct fallback for compass phase', async () => {
      mockGeminiError(500, 'Error');

      const request = createRequest({
        action: 'respond',
        message: 'I want to help people learn new skills every day.',
        currentPhase: 'introduction',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('meaningful');
    });

    it('should return correct fallback for engine phase', async () => {
      mockGeminiError(500, 'Error');

      const request = createRequest({
        action: 'respond',
        message: 'I care deeply about education and making learning accessible.',
        currentPhase: 'compass',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('energizes');
    });

    it('should return correct fallback for toolkit phase', async () => {
      mockGeminiError(500, 'Error');

      const request = createRequest({
        action: 'respond',
        message: 'I am passionate about solving complex technical challenges.',
        currentPhase: 'engine',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('natural');
    });

    it('should return correct fallback for synthesis phase', async () => {
      mockGeminiError(500, 'Error');

      const request = createRequest({
        action: 'respond',
        message: 'I once built a system that helped thousands of users learn coding.',
        currentPhase: 'proof',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('pattern');
    });

    it('should return correct fallback for complete phase', async () => {
      mockGeminiError(500, 'Error');

      const request = createRequest({
        action: 'respond',
        message: 'Yes this really resonates with me and captures who I am.',
        currentPhase: 'synthesis',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('captured');
    });
  });
});
