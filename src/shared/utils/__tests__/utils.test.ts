import { describe, expect, it } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  describe('basic functionality', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle single class name', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
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

    it('should handle mixed string and object inputs', () => {
      expect(
        cn(
          'base',
          {
            active: true,
            disabled: false,
          },
          'extra',
        ),
      ).toBe('base active extra');
    });

    it('should handle arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should handle nested arrays and objects', () => {
      expect(
        cn(['base', { active: true, disabled: false }, ['nested1', 'nested2']]),
      ).toBe('base active nested1 nested2');
    });
  });

  describe('Tailwind CSS merge functionality', () => {
    it('should merge conflicting Tailwind classes', () => {
      // Later classes should override earlier ones
      expect(cn('px-2 px-4')).toBe('px-4');
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
    });

    it('should handle responsive variants', () => {
      // twMerge should handle conflicting base classes but preserve responsive variants
      expect(cn('text-sm md:text-lg text-base')).toBe('md:text-lg text-base');
    });

    it('should handle state variants', () => {
      expect(cn('bg-red-500 hover:bg-blue-500 bg-green-500')).toBe(
        'hover:bg-blue-500 bg-green-500',
      );
    });

    it('should preserve non-conflicting classes', () => {
      expect(cn('px-4 py-2 text-center')).toBe('px-4 py-2 text-center');
    });

    it('should handle complex Tailwind class combinations', () => {
      const result = cn(
        'flex items-center justify-center',
        'px-4 py-2',
        'bg-blue-500 hover:bg-blue-600',
        'text-white font-medium',
        'rounded-md shadow-sm',
      );

      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-center');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('hover:bg-blue-600');
      expect(result).toContain('text-white');
      expect(result).toContain('font-medium');
      expect(result).toContain('rounded-md');
      expect(result).toContain('shadow-sm');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(cn('', 'class1', '')).toBe('class1');
    });

    it('should handle whitespace', () => {
      expect(cn('  class1  ', '  class2  ')).toBe('class1 class2');
    });

    it('should handle duplicate classes', () => {
      // clsx doesn't deduplicate non-Tailwind classes, only twMerge handles Tailwind conflicts
      expect(cn('class1', 'class2', 'class1')).toBe('class1 class2 class1');
    });

    it('should handle very long class lists', () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class${i}`);
      const result = cn(...manyClasses);

      expect(result).toContain('class0');
      expect(result).toContain('class99');
      expect(result.split(' ')).toHaveLength(100);
    });

    it('should handle special characters in class names', () => {
      expect(
        cn('class-with-dashes', 'class_with_underscores', 'class:with:colons'),
      ).toBe('class-with-dashes class_with_underscores class:with:colons');
    });

    it('should handle numbers in class names', () => {
      expect(cn('text-2xl', 'w-1/2', 'grid-cols-12')).toBe(
        'text-2xl w-1/2 grid-cols-12',
      );
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle button component classes', () => {
      const isActive = true;
      const isDisabled = false;
      const size: 'small' | 'large' = 'large';

      const buttonClasses = cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': !isDisabled,
          'bg-muted text-muted-foreground cursor-not-allowed': isDisabled,
          'ring-2 ring-primary': isActive,
        },
        (size as string) === 'small' && 'h-8 px-3 text-sm',
        (size as string) === 'large' && 'h-12 px-6 text-lg',
      );

      expect(buttonClasses).toContain('inline-flex');
      expect(buttonClasses).toContain('h-12');
      expect(buttonClasses).toContain('px-6');
      expect(buttonClasses).toContain('text-lg');
      expect(buttonClasses).toContain('ring-2');
      expect(buttonClasses).toContain('ring-primary');
      expect(buttonClasses).not.toContain('cursor-not-allowed');
    });

    it('should handle card component classes', () => {
      const hasError = false;
      const isLoading = true;

      const cardClasses = cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        {
          'border-destructive': hasError,
          'animate-pulse': isLoading,
        },
      );

      expect(cardClasses).toContain('rounded-lg');
      expect(cardClasses).toContain('border');
      expect(cardClasses).toContain('bg-card');
      expect(cardClasses).toContain('animate-pulse');
      expect(cardClasses).not.toContain('border-destructive');
    });

    it('should handle form input classes', () => {
      const hasError = true;
      const isFocused = false;

      const inputClasses = cn(
        'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'border-destructive focus-visible:ring-destructive': hasError,
          'border-input bg-background': !hasError,
          'ring-2 ring-ring': isFocused && !hasError,
        },
      );

      expect(inputClasses).toContain('flex');
      expect(inputClasses).toContain('h-10');
      expect(inputClasses).toContain('border-destructive');
      expect(inputClasses).toContain('focus-visible:ring-destructive');
      expect(inputClasses).not.toContain('border-input');
      expect(inputClasses).not.toContain('bg-background');
    });
  });

  describe('performance considerations', () => {
    it('should handle repeated calls efficiently', () => {
      const classes = ['class1', 'class2', 'class3'];

      // Multiple calls should produce consistent results
      const result1 = cn(...classes);
      const result2 = cn(...classes);
      const result3 = cn(...classes);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should handle complex nested structures', () => {
      const complexInput = [
        'base',
        {
          conditional1: true,
          conditional2: false,
        },
        [
          'nested1',
          {
            'nested-conditional': true,
          },
          ['deeply-nested'],
        ],
        undefined,
        null,
        false && 'hidden',
        true && 'visible',
      ];

      const result = cn(complexInput);

      expect(result).toContain('base');
      expect(result).toContain('conditional1');
      expect(result).toContain('nested1');
      expect(result).toContain('nested-conditional');
      expect(result).toContain('deeply-nested');
      expect(result).toContain('visible');
      expect(result).not.toContain('conditional2');
      expect(result).not.toContain('hidden');
    });
  });
});
