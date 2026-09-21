import { describe, expect, it } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  describe('basic functionality', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2');
    });

    it('should handle boolean conditions', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe(
        'base conditional',
      );
    });
  });

  describe('conditional classes', () => {
    it('should handle object with boolean values', () => {
      expect(
        cn({
          class1: true,
          class2: false,
          class3: true,
        }),
      ).toBe('class1 class3');
    });
  });

  describe('Tailwind CSS merge functionality', () => {
    it('should merge conflicting Tailwind classes', () => {
      // Later classes should override earlier ones
      expect(cn('px-2 px-4')).toBe('px-4');
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
    });
  });
});
