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

describe('openDirectoryDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('文字列が返されたら、受け取ったまま返す', async () => {
    // Arrange
    const expected = '/returned/directory/path';
    mockTauriOpenDialog.mockResolvedValue(expected);
    // Action
    const result = await tauriFileSystemService.openDirectoryDialog();
    // Assert
    expect(result).toBe(expected);
  });

  it('文字列以外のオブジェクトが返されたら、nullを返す', async () => {
    // Arrange
    const unexpectedResponse = { unexpected: 'object' };
    mockTauriOpenDialog.mockResolvedValue(
      unexpectedResponse as unknown as string | null,
    );
    // Action
    const result = await tauriFileSystemService.openDirectoryDialog();
    // Assert
    expect(result).toBeNull();
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

  it('should handle unexpected dialog response types', async () => {
    const unexpectedResponse = { unexpected: 'object' };
    mockTauriOpenDialog.mockResolvedValue(
      unexpectedResponse as unknown as string | null,
    );

    const result = await tauriFileSystemService.openImageFileDialog?.();

    expect(result).toBeNull();
  });
});

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

  it('should propagate invalid response from listImagesInFolder', async () => {
    const folderPath = '/valid/path';
    mockInvoke.mockResolvedValue(null);

    await expect(
      tauriFileSystemService.listImagesInFolder(folderPath),
    ).rejects.toThrow(`Failed to list images in folder "${folderPath}"`);
  });
});

describe('getSiblingContainers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should validate response is string array', async () => {
    const folderPath = '/Users/test/documents';
    const validFolders = ['/Users/test/folder1', '/Users/test/folder2'];
    mockInvoke.mockResolvedValue(validFolders);

    const result =
      await tauriFileSystemService.getSiblingContainers(folderPath);

    expect(result).toEqual(validFolders);
  });

  it('should handle non-array response from getSiblingContainers', async () => {
    const folderPath = '/valid/path';
    const invalidResponse = 'not an array';
    mockInvoke.mockResolvedValue(invalidResponse);

    await expect(
      tauriFileSystemService.getSiblingContainers(folderPath),
    ).rejects.toThrow();
  });
});
