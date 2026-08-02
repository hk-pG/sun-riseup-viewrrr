import { describe, expect, it } from 'vitest';
import type { FolderEntry } from '../../../features/folder-navigation/hooks/useSiblingContainers';
import { naturalFolderSort } from '../folderSort';

describe('naturalFolderSort', () => {
  const createFolderEntry = (name: string, path?: string): FolderEntry => ({
    name,
    path: path || `/test/${name}`,
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
  });

  describe('null and undefined handling', () => {
    it('should handle null folder names gracefully', () => {
      const a = { name: null as unknown as string, path: '/test/null' };
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

  describe('consistency and stability', () => {
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
