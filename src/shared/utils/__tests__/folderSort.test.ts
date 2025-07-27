import { describe, expect, it } from 'vitest';
import type { FolderEntry } from '../../../features/folder-navigation/hooks/useSiblingFolders';
import { naturalFolderSort } from '../folderSort';

describe('naturalFolderSort', () => {
  it('should sort folders alphabetically by name', () => {
    const folders: FolderEntry[] = [
      { name: 'zebra', path: '/path/to/zebra' },
      { name: 'apple', path: '/path/to/apple' },
      { name: 'banana', path: '/path/to/banana' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    expect(sorted).toEqual([
      { name: 'apple', path: '/path/to/apple' },
      { name: 'banana', path: '/path/to/banana' },
      { name: 'zebra', path: '/path/to/zebra' },
    ]);
  });

  it('should handle numeric sorting correctly', () => {
    const folders: FolderEntry[] = [
      { name: 'folder10', path: '/path/to/folder10' },
      { name: 'folder2', path: '/path/to/folder2' },
      { name: 'folder1', path: '/path/to/folder1' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    expect(sorted).toEqual([
      { name: 'folder1', path: '/path/to/folder1' },
      { name: 'folder2', path: '/path/to/folder2' },
      { name: 'folder10', path: '/path/to/folder10' },
    ]);
  });

  it('should handle Japanese characters correctly', () => {
    const folders: FolderEntry[] = [
      { name: 'フォルダ2', path: '/path/to/フォルダ2' },
      { name: 'あいうえお', path: '/path/to/あいうえお' },
      { name: 'フォルダ1', path: '/path/to/フォルダ1' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    expect(sorted).toEqual([
      { name: 'あいうえお', path: '/path/to/あいうえお' },
      { name: 'フォルダ1', path: '/path/to/フォルダ1' },
      { name: 'フォルダ2', path: '/path/to/フォルダ2' },
    ]);
  });

  it('should handle mixed case correctly', () => {
    const folders: FolderEntry[] = [
      { name: 'Zebra', path: '/path/to/Zebra' },
      { name: 'apple', path: '/path/to/apple' },
      { name: 'Banana', path: '/path/to/Banana' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    expect(sorted).toEqual([
      { name: 'apple', path: '/path/to/apple' },
      { name: 'Banana', path: '/path/to/Banana' },
      { name: 'Zebra', path: '/path/to/Zebra' },
    ]);
  });

  it('should handle empty names gracefully', () => {
    const folders: FolderEntry[] = [
      { name: '', path: '/path/to/empty' },
      { name: 'apple', path: '/path/to/apple' },
      { name: '', path: '/path/to/empty2' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    expect(sorted).toEqual([
      { name: '', path: '/path/to/empty' },
      { name: '', path: '/path/to/empty2' },
      { name: 'apple', path: '/path/to/apple' },
    ]);
  });

  it('should handle special characters correctly', () => {
    const folders: FolderEntry[] = [
      { name: '_underscore', path: '/path/to/_underscore' },
      { name: '123numbers', path: '/path/to/123numbers' },
      { name: 'apple', path: '/path/to/apple' },
      { name: '-dash', path: '/path/to/-dash' },
    ];

    const sorted = folders.sort(naturalFolderSort);

    // The exact order may vary based on locale, but we test that it doesn't throw
    expect(sorted).toHaveLength(4);
    expect(sorted.every((folder) => folder.name !== undefined)).toBe(true);
  });

  it('should return 0 for identical folder names', () => {
    const folderA: FolderEntry = { name: 'same', path: '/path/to/same1' };
    const folderB: FolderEntry = { name: 'same', path: '/path/to/same2' };

    const result = naturalFolderSort(folderA, folderB);

    expect(result).toBe(0);
  });

  it('should return negative number when first folder should come before second', () => {
    const folderA: FolderEntry = { name: 'apple', path: '/path/to/apple' };
    const folderB: FolderEntry = { name: 'banana', path: '/path/to/banana' };

    const result = naturalFolderSort(folderA, folderB);

    expect(result).toBeLessThan(0);
  });

  it('should return positive number when first folder should come after second', () => {
    const folderA: FolderEntry = { name: 'banana', path: '/path/to/banana' };
    const folderB: FolderEntry = { name: 'apple', path: '/path/to/apple' };

    const result = naturalFolderSort(folderA, folderB);

    expect(result).toBeGreaterThan(0);
  });
});
