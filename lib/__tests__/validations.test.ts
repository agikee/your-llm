import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate } from '../validations';

describe('validate', () => {
  describe('with valid data', () => {
    it('should return success with data for valid primitive', () => {
      const schema = z.string();
      const result = validate(schema, 'hello');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('should return success with data for valid object', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const data = { name: 'John', age: 30 };
      const result = validate(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return success for nested object schema', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
          profile: z.object({
            name: z.string(),
          }),
        }),
      });
      const data = {
        user: {
          email: 'test@example.com',
          profile: { name: 'Test User' },
        },
      };
      const result = validate(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return success for array schema', () => {
      const schema = z.array(z.number());
      const data = [1, 2, 3];
      const result = validate(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return success for enum schema', () => {
      const schema = z.enum(['foo', 'bar', 'baz']);
      const result = validate(schema, 'bar');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('bar');
      }
    });
  });

  describe('with invalid data', () => {
    it('should return failure with error for invalid type', () => {
      const schema = z.string();
      const result = validate(schema, 123);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Expected string');
      }
    });

    it('should return failure with error for missing required field', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string(),
      });
      const data = { name: 'John' };
      const result = validate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('email');
      }
    });

    it('should return failure with error for invalid email format', () => {
      const schema = z.object({
        email: z.string().email(),
      });
      const data = { email: 'not-an-email' };
      const result = validate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('email');
      }
    });

    it('should return failure with error for string too short', () => {
      const schema = z.string().min(5);
      const result = validate(schema, 'abc');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('5');
      }
    });

    it('should return failure with error for string too long', () => {
      const schema = z.string().max(5);
      const result = validate(schema, 'abcdefgh');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('5');
      }
    });

    it('should return failure with error for invalid enum value', () => {
      const schema = z.enum(['foo', 'bar']);
      const result = validate(schema, 'baz');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('foo');
        expect(result.error).toContain('bar');
      }
    });

    it('should return failure for null when expecting value', () => {
      const schema = z.string();
      const result = validate(schema, null);

      expect(result.success).toBe(false);
    });

    it('should return failure for undefined when expecting value', () => {
      const schema = z.string();
      const result = validate(schema, undefined);

      expect(result.success).toBe(false);
    });
  });

  describe('error message formatting', () => {
    it('should include field path in error message', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });
      const data = { user: { email: 'invalid' } };
      const result = validate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('user.email');
      }
    });

    it('should separate multiple errors with semicolon', () => {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      });
      const data = { name: '', email: 'invalid' };
      const result = validate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain(';');
      }
    });

    it('should not include path prefix for root-level errors', () => {
      const schema = z.string().min(5);
      const result = validate(schema, 'abc');

      expect(result.success).toBe(false);
      if (!result.success) {
        // Error should start with message, not with a path
        expect(result.error).not.toMatch(/^:/);
      }
    });

    it('should include nested path in error message', () => {
      const schema = z.object({
        items: z.array(
          z.object({
            value: z.number().positive(),
          })
        ),
      });
      const data = {
        items: [{ value: -1 }],
      };
      const result = validate(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('items');
        expect(result.error).toContain('value');
      }
    });
  });
});
