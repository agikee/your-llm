import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  describe('merging class names', () => {
    it('should merge simple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle single class name', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('should handle empty arguments', () => {
      expect(cn()).toBe('');
    });

    it('should handle arrays of class names', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('should handle objects with boolean values', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle mixed input types', () => {
      expect(cn('foo', ['bar', { baz: true }], { qux: false })).toBe('foo bar baz');
    });
  });

  describe('conditional classes', () => {
    it('should include class when condition is true', () => {
      expect(cn('base', { conditional: true })).toBe('base conditional');
    });

    it('should exclude class when condition is false', () => {
      expect(cn('base', { conditional: false })).toBe('base');
    });

    it('should handle multiple conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('btn', { active: isActive, disabled: isDisabled })).toBe('btn active');
    });

    it('should handle undefined and null values', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });
  });

  describe('tailwind-merge conflicts', () => {
    it('should merge conflicting tailwind classes (padding)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should merge conflicting tailwind classes (margin)', () => {
      expect(cn('m-4', 'm-8')).toBe('m-8');
    });

    it('should merge conflicting tailwind classes (text color)', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should merge conflicting tailwind classes (background)', () => {
      expect(cn('bg-white', 'bg-black')).toBe('bg-black');
    });

    it('should merge conflicting responsive classes', () => {
      expect(cn('md:p-4', 'md:p-8')).toBe('md:p-8');
    });

    it('should preserve non-conflicting classes', () => {
      expect(cn('p-4', 'text-center', 'bg-white')).toBe('p-4 text-center bg-white');
    });

    it('should handle complex tailwind merges', () => {
      expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
    });

    it('should merge conflicting flex classes', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col');
    });
  });
});
