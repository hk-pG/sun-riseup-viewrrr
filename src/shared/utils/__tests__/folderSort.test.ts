import { describe, expect, it } from 'vitest';
import type { FolderEntry } from '../../../features/folder-navigation/hooks/useSiblingFolders';
import { naturalFolderSort } from '../folderSort';

describe('naturalFolderSort', () => {
  const createFolderEntry = (name: string, path?: string): FolderEntry => ({
    name,
    path: path || `/test/${name}`,
  });

  describe('basic string sorting', () => {
    it('should sort folder names alphabetically', () => {
      const a = createFolderEntry('Documents');
      const b = createFolderEntry('Pictures');

      expect(naturalFolderSort(a, b)).toBeLessThan(0);
      expect(naturalFolderSort(b, a)).toBeGreaterThan(0);
    });

    it('should return 0 for identical folder names', () => {
      const a = createFolderEntry('SameFolder');
      const b = createFolderEntry('SameFolder');

      expect(naturalFolderSort(a, b)).toBe(0);
    });

    it('should handle empty folder names', () => {
      const empty = createFolderEntry('');
      const nonEmpty = createFolderEntry('Documents');

      expect(naturalFolderSort(empty, nonEmpty)).toBeLessThan(0);
      expect(naturalFolderSort(nonEmpty, empty)).toBeGreaterThan(0);
    });
  });

  describe('numeric sorting', () => {
    it('should sort numbered folders naturally', () => {
      const folders = [
        createFolderEntry('Folder10'),
        createFolderEntry('Folder2'),
        createFolderEntry('Folder1'),
        createFolderEntry('Folder20'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual(['Folder1', 'Folder2', 'Folder10', 'Folder20']);
    });

    it('should handle mixed numeric and text content', () => {
      const folders = [
        createFolderEntry('Project100_final'),
        createFolderEntry('Project2_draft'),
        createFolderEntry('Project10_review'),
        createFolderEntry('Project1_initial'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual([
        'Project1_initial',
        'Project2_draft',
        'Project10_review',
        'Project100_final',
      ]);
    });

    it('should handle folders with leading zeros', () => {
      const folders = [
        createFolderEntry('Backup001'),
        createFolderEntry('Backup010'),
        createFolderEntry('Backup002'),
        createFolderEntry('Backup100'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual([
        'Backup001',
        'Backup002',
        'Backup010',
        'Backup100',
      ]);
    });
  });

  describe('Japanese text sorting', () => {
    it('should sort Japanese hiragana folder names correctly', () => {
      const folders = [
        createFolderEntry('こんにちは'),
        createFolderEntry('あいうえお'),
        createFolderEntry('さようなら'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual(['あいうえお', 'こんにちは', 'さようなら']);
    });

    it('should sort Japanese katakana folder names correctly', () => {
      const folders = [
        createFolderEntry('コンニチハ'),
        createFolderEntry('アイウエオ'),
        createFolderEntry('サヨウナラ'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual(['アイウエオ', 'コンニチハ', 'サヨウナラ']);
    });

    it('should sort mixed Japanese and English folder names', () => {
      const folders = [
        createFolderEntry('Documents'),
        createFolderEntry('ドキュメント'),
        createFolderEntry('Pictures'),
        createFolderEntry('写真'),
      ];

      const sorted = folders.sort(naturalFolderSort);

      // Should maintain consistent ordering
      expect(sorted).toHaveLength(4);
      const names = sorted.map((folder) => folder.name);
      expect(names.includes('Documents')).toBe(true);
      expect(names.includes('ドキュメント')).toBe(true);
      expect(names.includes('Pictures')).toBe(true);
      expect(names.includes('写真')).toBe(true);
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null folder names gracefully', () => {
      const a = { name: null as unknown as string, path: '/test/null' };
      const b = createFolderEntry('ValidFolder');

      expect(() => naturalFolderSort(a, b)).not.toThrow();
      expect(naturalFolderSort(a, b)).toBeLessThan(0);
    });

    it('should handle undefined folder names gracefully', () => {
      const a = {
        name: undefined as unknown as string,
        path: '/test/undefined',
      };
      const b = createFolderEntry('ValidFolder');

      expect(() => naturalFolderSort(a, b)).not.toThrow();
      expect(naturalFolderSort(a, b)).toBeLessThan(0);
    });

    it('should handle both null/undefined names', () => {
      const a = { name: null as unknown as string, path: '/test/null' };
      const b = {
        name: undefined as unknown as string,
        path: '/test/undefined',
      };

      expect(() => naturalFolderSort(a, b)).not.toThrow();
      expect(naturalFolderSort(a, b)).toBe(0);
    });
  });

  describe('case sensitivity', () => {
    it('should handle case differences consistently', () => {
      const folders = [
        createFolderEntry('Documents'),
        createFolderEntry('documents'),
        createFolderEntry('DOCUMENTS'),
      ];

      const sorted = folders.sort(naturalFolderSort);

      // Should maintain consistent ordering regardless of case
      expect(sorted).toHaveLength(3);
      const names = sorted.map((folder) => folder.name);
      expect(names).toContain('Documents');
      expect(names).toContain('documents');
      expect(names).toContain('DOCUMENTS');
    });
  });

  describe('special characters and edge cases', () => {
    it('should handle special characters in folder names', () => {
      const folders = [
        createFolderEntry('Folder@2'),
        createFolderEntry('Folder#1'),
        createFolderEntry('Folder$3'),
      ];

      const sorted = folders.sort(naturalFolderSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });

    it('should handle very long folder names', () => {
      const longName = 'VeryLongFolderName'.repeat(50);
      const folders = [
        createFolderEntry(`${longName}2`),
        createFolderEntry(`${longName}1`),
        createFolderEntry(`${longName}10`),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names[0]).toBe(`${longName}1`);
      expect(names[1]).toBe(`${longName}2`);
      expect(names[2]).toBe(`${longName}10`);
    });

    it('should handle unicode characters in folder names', () => {
      const folders = [
        createFolderEntry('Café'),
        createFolderEntry('Naïve'),
        createFolderEntry('Résumé'),
      ];

      const sorted = folders.sort(naturalFolderSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });

    it('should handle emoji in folder names', () => {
      const folders = [
        createFolderEntry('🎉 Party Photos'),
        createFolderEntry('🎈 Birthday'),
        createFolderEntry('🎊 Celebration'),
      ];

      const sorted = folders.sort(naturalFolderSort);

      // Should not throw errors and maintain consistent ordering
      expect(sorted).toHaveLength(3);
    });
  });

  describe('real-world folder scenarios', () => {
    it('should sort typical folder names correctly', () => {
      const folders = [
        createFolderEntry('Desktop'),
        createFolderEntry('Documents'),
        createFolderEntry('Downloads'),
        createFolderEntry('Pictures'),
        createFolderEntry('Music'),
        createFolderEntry('Videos'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual([
        'Desktop',
        'Documents',
        'Downloads',
        'Music',
        'Pictures',
        'Videos',
      ]);
    });

    it('should sort date-based folder names correctly', () => {
      const folders = [
        createFolderEntry('2024-01-15'),
        createFolderEntry('2024-01-02'),
        createFolderEntry('2024-01-10'),
        createFolderEntry('2024-12-01'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual([
        '2024-01-02',
        '2024-01-10',
        '2024-01-15',
        '2024-12-01',
      ]);
    });

    it('should sort version-based folder names correctly', () => {
      const folders = [
        createFolderEntry('v1.10.0'),
        createFolderEntry('v1.2.0'),
        createFolderEntry('v1.1.0'),
        createFolderEntry('v2.0.0'),
      ];

      const sorted = folders.sort(naturalFolderSort);
      const names = sorted.map((folder) => folder.name);

      expect(names).toEqual(['v1.1.0', 'v1.2.0', 'v1.10.0', 'v2.0.0']);
    });
  });

  describe('consistency and stability', () => {
    it('should produce consistent results across multiple sorts', () => {
      const folders = [
        createFolderEntry('Folder10'),
        createFolderEntry('Folder2'),
        createFolderEntry('Folder1'),
        createFolderEntry('Folder20'),
        createFolderEntry('Folder3'),
      ];

      const sorted1 = [...folders].sort(naturalFolderSort);
      const sorted2 = [...folders].sort(naturalFolderSort);
      const sorted3 = [...folders].sort(naturalFolderSort);

      expect(sorted1.map((f) => f.name)).toEqual(sorted2.map((f) => f.name));
      expect(sorted2.map((f) => f.name)).toEqual(sorted3.map((f) => f.name));
    });

    it('should maintain stable sort for equal elements', () => {
      const folders = [
        { name: 'SameFolder', path: '/path1' },
        { name: 'SameFolder', path: '/path2' },
        { name: 'SameFolder', path: '/path3' },
      ];

      const sorted = folders.sort(naturalFolderSort);

      // All should have same name but maintain their path identity
      expect(sorted.every((folder) => folder.name === 'SameFolder')).toBe(true);
      expect(sorted.map((folder) => folder.path)).toEqual([
        '/path1',
        '/path2',
        '/path3',
      ]);
    });
  });
});
