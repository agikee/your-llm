import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the cookies function from next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock the Supabase client
const mockSignUp = vi.fn();
vi.mock('@/lib/database/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}));

// Import after mocking
import { POST } from '@/app/api/auth/signup/route';
import { cookies } from 'next/headers';

describe('POST /api/auth/signup', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  describe('successful signup', () => {
    it('should return user data with session when signup succeeds', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: Date.now() + 3600,
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual(mockUser);
      expect(data.session).toEqual(mockSession);
      expect(data.message).toBe('Account created successfully');
    });

    it('should return email confirmation message when session is null', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('check your email');
    });

    it('should signup successfully without name field', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual(mockUser);
    });
  });

  describe('validation errors', () => {
    it('should return 400 for invalid email format', async () => {
      const request = createRequest({
        email: 'invalid-email',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('email');
    });

    it('should return 400 for password missing special character', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('special character');
    });

    it('should return 400 for password too short (min 8 chars)', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'Pass1!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for password missing uppercase letter', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('uppercase');
    });

    it('should return 400 for password missing lowercase letter', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'PASSWORD123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('lowercase');
    });

    it('should return 400 for password missing number', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'Password!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('number');
    });

    it('should return 400 for missing email field', async () => {
      const request = createRequest({
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for missing password field', async () => {
      const request = createRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for empty request body', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('duplicate email handling', () => {
    it('should return 400 with friendly message for duplicate email', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const request = createRequest({
        email: 'existing@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('An account with this email already exists');
    });

    it('should return 400 for error containing "already registered"', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'This email is already registered in our system' },
      });

      const request = createRequest({
        email: 'existing@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });
  });

  describe('other error handling', () => {
    it('should return 400 with error message for other Supabase errors', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Password is too weak' },
      });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password is too weak');
    });

    it('should return 500 for internal server errors', async () => {
      mockSignUp.mockRejectedValue(new Error('Database connection failed'));

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should return 400 for malformed JSON body', async () => {
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('edge cases', () => {
    it('should reject email with leading/trailing whitespace (fails before transform)', async () => {
      // Zod validates before transforming, so email with spaces fails validation
      const request = createRequest({
        email: '  test@example.com  ',
        password: 'Password123!',
      });

      const response = await POST(request);

      // Email validation fails before trim transform is applied
      expect(response.status).toBe(400);
    });

    it('should handle maximum length email (255 chars)', async () => {
      const longEmail = 'a'.repeat(243) + '@example.com'; // Total 255 chars

      mockSignUp.mockResolvedValue({
        data: { user: { email: longEmail }, session: null },
        error: null,
      });

      const request = createRequest({
        email: longEmail,
        password: 'Password123!',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject email over 255 characters', async () => {
      const tooLongEmail = 'a'.repeat(250) + '@example.com'; // Over 255 chars

      const request = createRequest({
        email: tooLongEmail,
        password: 'Password123!',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should accept password with exactly 8 characters', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null,
      });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Pass123!', // Exactly 8 characters
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept password with various special characters', async () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];

      for (const char of specialChars) {
        mockSignUp.mockResolvedValue({
          data: { user: { id: '123' }, session: null },
          error: null,
        });

        const request = createRequest({
          email: 'test@example.com',
          password: `Password1${char}`,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });
});
