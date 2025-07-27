import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FolderEntry } from '../../hooks/useSiblingFolders';
import type { FileSystemService } from '../FileSystemService';
import { getSiblingFolderEntries } from '../getSiblingFolders';

// Mock FileSystemService
const mockFileSystemService: FileSystemService = {
  openDirectoryDialog: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
};

describe('getSiblingFolderEntries', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return empty array when currentFolderPath is empty', async () => {
    const result = await getSiblingFolderEntries('', mockFileSystemService);

    expect(result).toEqual([]);
    expect(mockFileSystemService.getSiblingFolders).not.toHaveBeenCalled();
  });

  it('should include current folder in results and sort them', async () => {
    const currentPath = '/path/to/current';
    const siblingPaths = ['/path/to/zebra', '/path/to/apple'];

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue(siblingPaths);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath) return 'current';
        if (path === '/path/to/zebra') return 'zebra';
        if (path === '/path/to/apple') return 'apple';
        return '';
      });

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([
      { name: 'apple', path: '/path/to/apple' },
      { name: 'current', path: '/path/to/current' },
      { name: 'zebra', path: '/path/to/zebra' },
    ]);
  });

  it('should use custom sort function when provided', async () => {
    const currentPath = '/path/to/current';
    const siblingPaths = ['/path/to/apple', '/path/to/zebra'];

    // Custom sort function that sorts in reverse alphabetical order
    const reverseSortFn = (a: FolderEntry, b: FolderEntry) =>
      b.name.localeCompare(a.name);

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue(siblingPaths);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath) return 'current';
        if (path === '/path/to/zebra') return 'zebra';
        if (path === '/path/to/apple') return 'apple';
        return '';
      });

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
      reverseSortFn,
    );

    expect(result).toEqual([
      { name: 'zebra', path: '/path/to/zebra' },
      { name: 'current', path: '/path/to/current' },
      { name: 'apple', path: '/path/to/apple' },
    ]);
  });

  it('should return only current folder when no siblings exist', async () => {
    const currentPath = '/path/to/current';

    mockFileSystemService.getSiblingFolders = vi.fn().mockResolvedValue([]);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath) return 'current';
        return '';
      });

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([{ name: 'current', path: '/path/to/current' }]);
  });

  it('should return sibling folders even if current folder creation fails', async () => {
    const currentPath = '/path/to/current';
    const siblingPaths = ['/path/to/apple', '/path/to/zebra'];

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue(siblingPaths);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath)
          throw new Error('Failed to get current folder name');
        if (path === '/path/to/zebra') return 'zebra';
        if (path === '/path/to/apple') return 'apple';
        return '';
      });

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([
      { name: 'apple', path: '/path/to/apple' },
      { name: 'zebra', path: '/path/to/zebra' },
    ]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error creating current folder entry:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should return empty array when getSiblingFolders fails', async () => {
    const currentPath = '/path/to/current';

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockRejectedValue(new Error('Failed to get siblings'));

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching folder entries:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should return empty array when sibling folder name resolution fails', async () => {
    const currentPath = '/path/to/current';
    const siblingPaths = ['/path/to/apple', '/path/to/invalid'];

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue(siblingPaths);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath) return 'current';
        if (path === '/path/to/apple') return 'apple';
        if (path === '/path/to/invalid') throw new Error('Invalid path');
        return '';
      });

    // This should return empty array because Promise.all will reject and be caught
    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching folder entries:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle numeric folder names correctly with natural sort', async () => {
    const currentPath = '/path/to/folder5';
    const siblingPaths = ['/path/to/folder10', '/path/to/folder2'];

    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue(siblingPaths);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (path) => {
        if (path === currentPath) return 'folder5';
        if (path === '/path/to/folder10') return 'folder10';
        if (path === '/path/to/folder2') return 'folder2';
        return '';
      });

    const result = await getSiblingFolderEntries(
      currentPath,
      mockFileSystemService,
    );

    expect(result).toEqual([
      { name: 'folder2', path: '/path/to/folder2' },
      { name: 'folder5', path: '/path/to/folder5' },
      { name: 'folder10', path: '/path/to/folder10' },
    ]);
  });
});
