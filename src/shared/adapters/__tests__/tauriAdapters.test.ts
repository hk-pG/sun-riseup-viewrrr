import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImageHandle } from '@/features/image-viewer';
import { tauriFileSystemService } from '../tauriAdapters';

vi.mock('@/shared/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    trace: vi.fn(),
  },
}));

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

describe('listImagesInContainer', () => {
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

    const result =
      await tauriFileSystemService.listImagesInContainer(folderPath);

    expect(result).toEqual(expectedImages);
    expect(mockInvoke).toHaveBeenCalledWith('list_images_in_container', {
      containerPath: folderPath,
    });
  });

  it('should return empty array when folder has no images', async () => {
    const folderPath = '/Users/test/empty';
    mockInvoke.mockResolvedValue([]);

    const result =
      await tauriFileSystemService.listImagesInContainer(folderPath);

    expect(result).toEqual([]);
    expect(mockInvoke).toHaveBeenCalledWith('list_images_in_container', {
      containerPath: folderPath,
    });
  });

  it('should propagate invalid response from listImagesInContainer', async () => {
    const folderPath = '/valid/path';
    mockInvoke.mockResolvedValue(null);

    await expect(
      tauriFileSystemService.listImagesInContainer(folderPath),
    ).rejects.toThrow(`Failed to list images in container "${folderPath}"`);
  });
});

describe('listImageHandles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return image handles for valid container', async () => {
    const containerPath = '/Users/test/images.zip';
    const expectedHandles: ImageHandle[] = [
      { index: 0, name: 'photo1.jpg' },
      { index: 1, name: 'photo2.png' },
    ];
    mockInvoke.mockResolvedValue(expectedHandles);

    const result = await tauriFileSystemService.listImageHandles(containerPath);

    expect(result).toEqual(expectedHandles);
    expect(mockInvoke).toHaveBeenCalledWith('list_image_handles', {
      containerPath,
    });
  });

  it('should reject invalid response from listImageHandles', async () => {
    const containerPath = '/valid/path';
    mockInvoke.mockResolvedValue([{ index: '0', name: 'photo1.jpg' }]);

    await expect(
      tauriFileSystemService.listImageHandles(containerPath),
    ).rejects.toThrow(
      `Failed to list image handles in container "${containerPath}"`,
    );
  });
});

describe('resolveImagesInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should resolve image paths for requested range', async () => {
    const containerPath = '/Users/test/images.zip';
    const expectedImages = [
      '/Users/test/cache/photo2.png',
      '/Users/test/cache/photo3.gif',
    ];
    mockInvoke.mockResolvedValue(expectedImages);

    const result = await tauriFileSystemService.resolveImagesInRange(
      containerPath,
      1,
      2,
    );

    expect(result).toEqual(expectedImages);
    expect(mockInvoke).toHaveBeenCalledWith('resolve_images_in_range', {
      containerPath,
      offset: 1,
      count: 2,
    });
  });

  it('should reject invalid response from resolveImagesInRange', async () => {
    const containerPath = '/valid/path';
    mockInvoke.mockResolvedValue([{ path: '/invalid' }]);

    await expect(
      tauriFileSystemService.resolveImagesInRange(containerPath, 0, 1),
    ).rejects.toThrow(
      `Failed to resolve images in range for "${containerPath}" (offset=0, count=1)`,
    );
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
