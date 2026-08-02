import { describe, expect, it } from 'vitest';
import { isStringArray } from '../isStringArray';

describe('isStringArray', () => {
  describe('valid string arrays', () => {
    it('should return true for empty array', () => {
      expect(isStringArray([])).toBe(true);
    });

    it('should return true for array with multiple strings', () => {
      expect(isStringArray(['hello', 'world', 'test'])).toBe(true);
    });

    it('should return true for array with empty strings', () => {
      expect(isStringArray(['', 'hello', ''])).toBe(true);
    });
  });

  describe('invalid arrays with mixed types', () => {
    it('should return false for array with numbers', () => {
      expect(isStringArray(['hello', 42])).toBe(false);
    });

    it('should return false for array with null values', () => {
      expect(isStringArray(['hello', null])).toBe(false);
    });
  });

  describe('non-array inputs', () => {
    it('should return false for null', () => {
      expect(isStringArray(null)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isStringArray('hello')).toBe(false);
    });

    it('should return false for array-like objects', () => {
      expect(isStringArray({ 0: 'hello', 1: 'world', length: 2 })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle arrays with string-like objects', () => {
      const stringObject = new String('hello');
      expect(isStringArray(['hello', stringObject])).toBe(false);
    });
  });

  describe('type guard behavior', () => {
    it('should narrow type correctly when used as type guard', () => {
      const unknownValue: unknown = ['hello', 'world'];

      if (isStringArray(unknownValue)) {
        // TypeScript should now know this is string[]
        expect(unknownValue.length).toBe(2);
        expect(unknownValue[0]).toBe('hello');
        expect(unknownValue[1]).toBe('world');
        // This should compile without TypeScript errors
        const firstItem: string = unknownValue[0];
        expect(typeof firstItem).toBe('string');
      }
    });
  });
});
