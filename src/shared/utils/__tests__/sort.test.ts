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
  });

  describe('consistency and stability', () => {
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
