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
});
