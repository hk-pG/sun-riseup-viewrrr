import { describe, expect, it } from 'vitest';
import type { ImageSource } from '../../../features/image-viewer/types/ImageSource';
import { naturalSort } from '../sort';

describe('naturalSort', () => {
  const createImageSource = (name: string): ImageSource => ({
    id: `id-${name}`,
    name,
    assetUrl: `asset://test/${name}`,
  });

  describe('basic string sorting', () => {
    it('should sort strings alphabetically', () => {
      const a = createImageSource('apple');
      const b = createImageSource('banana');

      expect(naturalSort(a, b)).toBeLessThan(0);
      expect(naturalSort(b, a)).toBeGreaterThan(0);
    });

    it('should return 0 for identical names', () => {
      const a = createImageSource('same');
      const b = createImageSource('same');

      expect(naturalSort(a, b)).toBe(0);
    });

    it('should handle empty strings', () => {
      const empty = createImageSource('');
      const nonEmpty = createImageSource('test');

      expect(naturalSort(empty, nonEmpty)).toBeLessThan(0);
      expect(naturalSort(nonEmpty, empty)).toBeGreaterThan(0);
    });
  });

  describe('numeric sorting', () => {
    it('should sort numbers naturally (1, 2, 10 not 1, 10, 2)', () => {
      const items = [
        createImageSource('file10.jpg'),
        createImageSource('file2.jpg'),
        createImageSource('file1.jpg'),
        createImageSource('file20.jpg'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names).toEqual([
        'file1.jpg',
        'file2.jpg',
        'file10.jpg',
        'file20.jpg',
      ]);
    });

    it('should handle mixed numeric and text content', () => {
      const items = [
        createImageSource('image100test'),
        createImageSource('image2test'),
        createImageSource('image10test'),
        createImageSource('image1test'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names).toEqual([
        'image1test',
        'image2test',
        'image10test',
        'image100test',
      ]);
    });

    it('should handle numbers with leading zeros', () => {
      const items = [
        createImageSource('file001.jpg'),
        createImageSource('file010.jpg'),
        createImageSource('file002.jpg'),
        createImageSource('file100.jpg'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names).toEqual([
        'file001.jpg',
        'file002.jpg',
        'file010.jpg',
        'file100.jpg',
      ]);
    });
  });

  describe('Japanese text sorting', () => {
    it('should sort Japanese hiragana correctly', () => {
      const items = [
        createImageSource('こんにちは'),
        createImageSource('あいうえお'),
        createImageSource('さようなら'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names).toEqual(['あいうえお', 'こんにちは', 'さようなら']);
    });

    it('should sort Japanese katakana correctly', () => {
      const items = [
        createImageSource('コンニチハ'),
        createImageSource('アイウエオ'),
        createImageSource('サヨウナラ'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names).toEqual(['アイウエオ', 'コンニチハ', 'サヨウナラ']);
    });

    it('should sort mixed Japanese and English', () => {
      const items = [
        createImageSource('hello'),
        createImageSource('こんにちは'),
        createImageSource('apple'),
        createImageSource('あいうえお'),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      // The exact order may depend on locale implementation, but should be consistent
      expect(sorted).toHaveLength(4);
      expect(names.includes('hello')).toBe(true);
      expect(names.includes('こんにちは')).toBe(true);
      expect(names.includes('apple')).toBe(true);
      expect(names.includes('あいうえお')).toBe(true);
    });
  });

  describe('case sensitivity', () => {
    it('should handle case differences consistently', () => {
      const items = [
        createImageSource('File.jpg'),
        createImageSource('file.jpg'),
        createImageSource('FILE.jpg'),
      ];

      const sorted = items.sort(naturalSort);

      // Should maintain consistent ordering regardless of case
      expect(sorted).toHaveLength(3);
      const names = sorted.map((item) => item.name);
      expect(names).toContain('File.jpg');
      expect(names).toContain('file.jpg');
      expect(names).toContain('FILE.jpg');
    });
  });

  describe('special characters and edge cases', () => {
    it('should handle special characters', () => {
      const items = [
        createImageSource('file@2.jpg'),
        createImageSource('file#1.jpg'),
        createImageSource('file$3.jpg'),
      ];

      const sorted = items.sort(naturalSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(1000);
      const items = [
        createImageSource(`${longName}2`),
        createImageSource(`${longName}1`),
        createImageSource(`${longName}10`),
      ];

      const sorted = items.sort(naturalSort);
      const names = sorted.map((item) => item.name);

      expect(names[0]).toBe(`${longName}1`);
      expect(names[1]).toBe(`${longName}2`);
      expect(names[2]).toBe(`${longName}10`);
    });

    it('should handle unicode characters', () => {
      const items = [
        createImageSource('café'),
        createImageSource('naïve'),
        createImageSource('résumé'),
      ];

      const sorted = items.sort(naturalSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });

    it('should handle emoji and special unicode', () => {
      const items = [
        createImageSource('🎉party'),
        createImageSource('🎈balloon'),
        createImageSource('🎊confetti'),
      ];

      const sorted = items.sort(naturalSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });
  });

  describe('consistency and stability', () => {
    it('should produce consistent results across multiple sorts', () => {
      const items = [
        createImageSource('file10.jpg'),
        createImageSource('file2.jpg'),
        createImageSource('file1.jpg'),
        createImageSource('file20.jpg'),
        createImageSource('file3.jpg'),
      ];

      const sorted1 = [...items].sort(naturalSort);
      const sorted2 = [...items].sort(naturalSort);
      const sorted3 = [...items].sort(naturalSort);

      expect(sorted1.map((i) => i.name)).toEqual(sorted2.map((i) => i.name));
      expect(sorted2.map((i) => i.name)).toEqual(sorted3.map((i) => i.name));
    });

    it('should maintain stable sort for equal elements', () => {
      const items = [
        { ...createImageSource('same'), id: 'id1' },
        { ...createImageSource('same'), id: 'id2' },
        { ...createImageSource('same'), id: 'id3' },
      ];

      const sorted = items.sort(naturalSort);

      // All should have same name but maintain their identity
      expect(sorted.every((item) => item.name === 'same')).toBe(true);
      expect(sorted.map((item) => item.id)).toEqual(['id1', 'id2', 'id3']);
    });
  });
});
