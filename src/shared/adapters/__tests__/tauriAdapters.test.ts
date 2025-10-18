import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tauriFileSystemService } from '../tauriAdapters';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  basename: vi.fn(),
  dirname: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}));

vi.mock('../../utils/isStringArray', () => ({
  isStringArray: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { open as tauriOpenDialog } from '@tauri-apps/plugin-dialog';
import { isStringArray } from '../../utils/isStringArray';

const mockInvoke = vi.mocked(invoke);
const mockTauriOpenDialog = vi.mocked(tauriOpenDialog);
const mockIsStringArray = vi.mocked(isStringArray);

describe('tauriAdapters - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('openImageFileDialog', () => {
    it('should return selected image file path with default extensions', async () => {
      const expectedPath = '/Users/test/image.jpg';
      mockTauriOpenDialog.mockResolvedValue(expectedPath);

      const result = await tauriFileSystemService.openImageFileDialog?.();

      expect(result).toBe(expectedPath);
      expect(mockTauriOpenDialog).toHaveBeenCalledWith({
        directory: false,
        multiple: false,
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        ],
      });
    });

    it('should return selected image file path with custom extensions', async () => {
      const expectedPath = '/Users/test/image.png';
      const customExtensions = ['png', 'svg'];
      mockTauriOpenDialog.mockResolvedValue(expectedPath);

      const result =
        await tauriFileSystemService.openImageFileDialog?.(customExtensions);

      expect(result).toBe(expectedPath);
      expect(mockTauriOpenDialog).toHaveBeenCalledWith({
        directory: false,
        multiple: false,
        filters: [{ name: 'Images', extensions: customExtensions }],
      });
    });

    it('should return null when user cancels file selection', async () => {
      mockTauriOpenDialog.mockResolvedValue(null);

      const result = await tauriFileSystemService.openImageFileDialog?.();

      expect(result).toBeNull();
    });

    it('should return null when dialog returns non-string value', async () => {
      mockTauriOpenDialog.mockResolvedValue(['multiple', 'files']);

      const result = await tauriFileSystemService.openImageFileDialog?.();

      expect(result).toBeNull();
    });
  });

  describe('listImagesInFolder', () => {
    it('should return array of image paths for valid folder', async () => {
      const folderPath = '/Users/test/images';
      const expectedImages = [
        '/Users/test/images/photo1.jpg',
        '/Users/test/images/photo2.png',
        '/Users/test/images/photo3.gif',
      ];
      mockInvoke.mockResolvedValue(expectedImages);

      const result =
        await tauriFileSystemService.listImagesInFolder(folderPath);

      expect(result).toEqual(expectedImages);
      expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
        folderPath,
      });
    });

    it('should return empty array when folder has no images', async () => {
      const folderPath = '/Users/test/empty';
      mockInvoke.mockResolvedValue([]);

      const result =
        await tauriFileSystemService.listImagesInFolder(folderPath);

      expect(result).toEqual([]);
      expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
        folderPath,
      });
    });

    it('should handle folder path with special characters', async () => {
      const folderPath = '/Users/test/フォルダ with spaces & symbols!';
      const expectedImages = [
        '/Users/test/フォルダ with spaces & symbols!/image.jpg',
      ];
      mockInvoke.mockResolvedValue(expectedImages);

      const result =
        await tauriFileSystemService.listImagesInFolder(folderPath);

      expect(result).toEqual(expectedImages);
      expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
        folderPath,
      });
    });
  });
});

describe('tauriAdapters - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // console.errorをモックしてテスト出力を抑制
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('Backend error scenarios', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should handle invoke errors for listImagesInFolder', async () => {
      const folderPath = '/invalid/path';
      const backendError = new Error('Backend error: Folder not found');
      mockInvoke.mockRejectedValue(backendError);

      const result =
        await tauriFileSystemService.listImagesInFolder(folderPath);
      expect(result).toEqual([]);
      expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
        folderPath,
      });
    });

    it('should handle network/permission errors for getSiblingFolders', async () => {
      const folderPath = '/restricted/path';
      const permissionError = new Error('Permission denied');
      mockInvoke.mockRejectedValue(permissionError);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual([]);
    });

    it('should handle timeout errors gracefully', async () => {
      const folderPath = '/slow/network/path';
      const timeoutError = new Error('Request timeout');
      mockInvoke.mockRejectedValue(timeoutError);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual([]);
    });
  });

  describe('Invalid path handling', () => {
    it('should handle empty path for listImagesInFolder', async () => {
      const emptyPath = '';
      const backendError = new Error('Invalid path: empty string');
      mockInvoke.mockRejectedValue(backendError);

      const result = await tauriFileSystemService.listImagesInFolder(emptyPath);

      expect(result).toEqual([]);
    });

    it('should handle null/undefined paths gracefully for getSiblingFolders', async () => {
      const nullPath = null as unknown as string;
      const backendError = new Error('Invalid path: null');
      mockInvoke.mockRejectedValue(backendError);

      const result = await tauriFileSystemService.getSiblingFolders(nullPath);

      expect(result).toEqual([]);
    });

    it('should handle malformed paths for getSiblingFolders', async () => {
      const malformedPath = '///invalid\\\\path//';
      const backendError = new Error('Malformed path');
      mockInvoke.mockRejectedValue(backendError);

      const result =
        await tauriFileSystemService.getSiblingFolders(malformedPath);

      expect(result).toEqual([]);
    });
  });

  describe('Invalid response handling', () => {
    it('should handle non-array response from getSiblingFolders', async () => {
      const folderPath = '/valid/path';
      const invalidResponse = 'not an array';
      mockInvoke.mockResolvedValue(invalidResponse);
      mockIsStringArray.mockReturnValue(false);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual([]);
      expect(mockIsStringArray).toHaveBeenCalledWith(invalidResponse);
    });

    it('should handle null response from getSiblingFolders', async () => {
      const folderPath = '/valid/path';
      const nullResponse = null;
      mockInvoke.mockResolvedValue(nullResponse);
      mockIsStringArray.mockReturnValue(false);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual([]);
    });

    it('should handle array with non-string elements from getSiblingFolders', async () => {
      const folderPath = '/valid/path';
      const mixedResponse = ['valid', 123, null, 'another'];
      mockInvoke.mockResolvedValue(mixedResponse);
      mockIsStringArray.mockReturnValue(false);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual([]);
    });
  });

  describe('Dialog error scenarios', () => {
    it('should handle dialog permission errors for openDirectoryDialog', async () => {
      const permissionError = new Error('User denied permission');
      mockTauriOpenDialog.mockRejectedValue(permissionError);

      await expect(
        tauriFileSystemService.openDirectoryDialog(),
      ).rejects.toThrow(
        'error occurred during open folder Error: User denied permission',
      );
    });

    it('should handle dialog system errors for openImageFileDialog', async () => {
      const systemError = new Error('System dialog unavailable');
      mockTauriOpenDialog.mockRejectedValue(systemError);

      await expect(
        tauriFileSystemService.openImageFileDialog?.(),
      ).rejects.toThrow('System dialog unavailable');
    });

    it('should handle unexpected dialog response types', async () => {
      const unexpectedResponse = { unexpected: 'object' };
      mockTauriOpenDialog.mockResolvedValue(
        unexpectedResponse as unknown as string | null,
      );

      const result = await tauriFileSystemService.openImageFileDialog?.();

      expect(result).toBeNull();
    });
  });
});
describe('tauriAdapters - Path Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getSiblingFolders', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return array of sibling folder paths', async () => {
      const folderPath = '/Users/test/documents';
      const expectedFolders = [
        '/Users/test/downloads',
        '/Users/test/pictures',
        '/Users/test/music',
      ];
      mockInvoke.mockResolvedValue(expectedFolders);
      mockIsStringArray.mockReturnValue(true);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual(expectedFolders);
      expect(mockInvoke).toHaveBeenCalledWith('get_sibling_folders', {
        folderPath,
      });
      expect(mockIsStringArray).toHaveBeenCalledWith(expectedFolders);
    });

    it('should return empty array when no sibling folders exist', async () => {
      const folderPath = '/Users/test/isolated';
      const expectedFolders: string[] = [];
      mockInvoke.mockResolvedValue(expectedFolders);
      mockIsStringArray.mockReturnValue(true);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual(expectedFolders);
      expect(mockInvoke).toHaveBeenCalledWith('get_sibling_folders', {
        folderPath,
      });
    });

    it('should handle folder paths with special characters', async () => {
      const folderPath = '/Users/test/フォルダ with spaces & symbols!';
      const expectedFolders = [
        '/Users/test/another フォルダ',
        '/Users/test/folder with symbols @#$',
      ];
      mockInvoke.mockResolvedValue(expectedFolders);
      mockIsStringArray.mockReturnValue(true);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual(expectedFolders);
      expect(mockInvoke).toHaveBeenCalledWith('get_sibling_folders', {
        folderPath,
      });
    });

    it('should validate response is string array', async () => {
      const folderPath = '/Users/test/documents';
      const validFolders = ['/Users/test/folder1', '/Users/test/folder2'];
      mockInvoke.mockResolvedValue(validFolders);
      mockIsStringArray.mockReturnValue(true);

      const result = await tauriFileSystemService.getSiblingFolders(folderPath);

      expect(result).toEqual(validFolders);
      expect(mockIsStringArray).toHaveBeenCalledWith(validFolders);
    });

    it('should handle root-level folder paths', async () => {
      const rootFolderPath = '/Users';
      const expectedFolders = ['/Applications', '/System', '/Library'];
      mockInvoke.mockResolvedValue(expectedFolders);
      mockIsStringArray.mockReturnValue(true);

      const result =
        await tauriFileSystemService.getSiblingFolders(rootFolderPath);

      expect(result).toEqual(expectedFolders);
      expect(mockInvoke).toHaveBeenCalledWith('get_sibling_folders', {
        folderPath: rootFolderPath,
      });
    });
  });
});
