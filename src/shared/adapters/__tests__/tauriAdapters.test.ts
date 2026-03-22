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

import { invoke } from '@tauri-apps/api/core';
import { open as tauriOpenDialog } from '@tauri-apps/plugin-dialog';

const mockInvoke = vi.mocked(invoke);
const mockTauriOpenDialog = vi.mocked(tauriOpenDialog);

describe('listImagesInFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return array of image paths for valid folder', async () => {
    const folderPath = '/Users/test/images';
    const expectedImages = [
      '/Users/test/images/photo1.jpg',
      '/Users/test/images/photo2.png',
      '/Users/test/images/photo3.gif',
    ];
    mockInvoke.mockResolvedValue(expectedImages);

    const result = await tauriFileSystemService.listImagesInFolder(folderPath);

    expect(result).toEqual(expectedImages);
    expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
      folderPath,
    });
  });

  it('should return empty array when folder has no images', async () => {
    const folderPath = '/Users/test/empty';
    mockInvoke.mockResolvedValue([]);

    const result = await tauriFileSystemService.listImagesInFolder(folderPath);

    expect(result).toEqual([]);
    expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
      folderPath,
    });
  });

  it('should propagate invoke errors for listImagesInFolder', async () => {
    const folderPath = '/invalid/path';
    const backendError = new Error('Backend error: Folder not found');
    mockInvoke.mockRejectedValue(backendError);

    await expect(
      tauriFileSystemService.listImagesInFolder(folderPath),
    ).rejects.toThrow(`Failed to list images in folder "${folderPath}"`);
    expect(mockInvoke).toHaveBeenCalledWith('list_images_in_folder', {
      folderPath,
    });
  });

  it('should propagate invalid response from listImagesInFolder', async () => {
    const folderPath = '/valid/path';
    mockInvoke.mockResolvedValue(null);

    await expect(
      tauriFileSystemService.listImagesInFolder(folderPath),
    ).rejects.toThrow(`Failed to list images in folder "${folderPath}"`);
  });
});

describe('openImageFileDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
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

  it('should handle unexpected dialog response types', async () => {
    const unexpectedResponse = { unexpected: 'object' };
    mockTauriOpenDialog.mockResolvedValue(
      unexpectedResponse as unknown as string | null,
    );

    const result = await tauriFileSystemService.openImageFileDialog?.();

    expect(result).toBeNull();
  });
});

describe('getSiblingFolders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle non-array response from getSiblingFolders', async () => {
    const folderPath = '/valid/path';
    const invalidResponse = 'not an array';
    mockInvoke.mockResolvedValue(invalidResponse);

    await expect(
      tauriFileSystemService.getSiblingFolders(folderPath),
    ).rejects.toThrow('Failed to get sibling folders');
  });

  it('should handle null response from getSiblingFolders', async () => {
    const folderPath = '/valid/path';
    const nullResponse = null;
    mockInvoke.mockResolvedValue(nullResponse);

    await expect(
      tauriFileSystemService.getSiblingFolders(folderPath),
    ).rejects.toThrow('Failed to get sibling folders');
  });

  it('should handle array with non-string elements from getSiblingFolders', async () => {
    const folderPath = '/valid/path';
    const mixedResponse = ['valid', 123, null, 'another'];
    mockInvoke.mockResolvedValue(mixedResponse);

    await expect(
      tauriFileSystemService.getSiblingFolders(folderPath),
    ).rejects.toThrow('Failed to get sibling folders');
  });

  it('should validate response is string array', async () => {
    const folderPath = '/Users/test/documents';
    const validFolders = ['/Users/test/folder1', '/Users/test/folder2'];
    mockInvoke.mockResolvedValue(validFolders);

    const result = await tauriFileSystemService.getSiblingFolders(folderPath);

    expect(result).toEqual(validFolders);
  });
});
