import { describe, expect, it } from 'vitest';
import { isStringArray } from '../isStringArray';

describe('isStringArray', () => {
  describe('valid string arrays', () => {
    it('should return true for empty array', () => {
      expect(isStringArray([])).toBe(true);
    });

    it('should return true for array with single string', () => {
      expect(isStringArray(['hello'])).toBe(true);
    });

    it('should return true for array with multiple strings', () => {
      expect(isStringArray(['hello', 'world', 'test'])).toBe(true);
    });

    it('should return true for array with empty strings', () => {
      expect(isStringArray(['', 'hello', ''])).toBe(true);
    });

    it('should return true for array with whitespace strings', () => {
      expect(isStringArray([' ', '\t', '\n', 'hello'])).toBe(true);
    });

    it('should return true for array with special character strings', () => {
      expect(isStringArray(['!@#$%', '日本語', 'émojis 🎉'])).toBe(true);
    });
  });

  describe('invalid arrays with mixed types', () => {
    it('should return false for array with numbers', () => {
      expect(isStringArray(['hello', 42])).toBe(false);
    });

    it('should return false for array with booleans', () => {
      expect(isStringArray(['hello', true, false])).toBe(false);
    });

    it('should return false for array with null values', () => {
      expect(isStringArray(['hello', null])).toBe(false);
    });

    it('should return false for array with undefined values', () => {
      expect(isStringArray(['hello', undefined])).toBe(false);
    });

    it('should return false for array with objects', () => {
      expect(isStringArray(['hello', {}])).toBe(false);
    });

    it('should return false for array with nested arrays', () => {
      expect(isStringArray(['hello', ['nested']])).toBe(false);
    });

    it('should return false for array with functions', () => {
      expect(isStringArray(['hello', () => {}])).toBe(false);
    });

    it('should return false for array with symbols', () => {
      expect(isStringArray(['hello', Symbol('test')])).toBe(false);
    });

    it('should return false for array with mixed types', () => {
      expect(isStringArray(['string', 123, true, null, undefined, {}])).toBe(
        false,
      );
    });
  });

  describe('non-array inputs', () => {
    it('should return false for null', () => {
      expect(isStringArray(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isStringArray(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isStringArray('hello')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isStringArray(42)).toBe(false);
    });

    it('should return false for boolean', () => {
      expect(isStringArray(true)).toBe(false);
      expect(isStringArray(false)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isStringArray({})).toBe(false);
    });

    it('should return false for function', () => {
      expect(isStringArray(() => {})).toBe(false);
    });

    it('should return false for symbol', () => {
      expect(isStringArray(Symbol('test'))).toBe(false);
    });

    it('should return false for array-like objects', () => {
      expect(isStringArray({ 0: 'hello', 1: 'world', length: 2 })).toBe(false);
    });

    it('should return false for NodeList-like objects', () => {
      const nodeListLike = {
        0: 'item1',
        1: 'item2',
        length: 2,
        item: () => {},
        forEach: () => {},
      };
      expect(isStringArray(nodeListLike)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for array with only numbers', () => {
      expect(isStringArray([1, 2, 3])).toBe(false);
    });

    it('should return false for array with only booleans', () => {
      expect(isStringArray([true, false, true])).toBe(false);
    });

    it('should return false for array with only null values', () => {
      expect(isStringArray([null, null, null])).toBe(false);
    });

    it('should return false for array with only undefined values', () => {
      expect(isStringArray([undefined, undefined])).toBe(false);
    });

    it('should handle very large arrays', () => {
      const largeStringArray = new Array(10000).fill('test');
      expect(isStringArray(largeStringArray)).toBe(true);

      const largeMixedArray = [...largeStringArray, 42];
      expect(isStringArray(largeMixedArray)).toBe(false);
    });

    it('should handle arrays with string-like objects', () => {
      const stringObject = new String('hello');
      expect(isStringArray(['hello', stringObject])).toBe(false);
    });

    it('should handle arrays with toString methods', () => {
      const objectWithToString = {
        toString: () => 'hello',
      };
      expect(isStringArray(['hello', objectWithToString])).toBe(false);
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

    it('should work with different unknown types', () => {
      const testValues: unknown[] = [
        ['valid', 'array'],
        ['invalid', 123],
        'not an array',
        null,
        undefined,
        42,
        true,
      ];

      const results = testValues.map((value) => isStringArray(value));
      expect(results).toEqual([true, false, false, false, false, false, false]);
    });
  });
});
