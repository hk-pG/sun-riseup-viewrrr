/**
 * Rust バックエンドなしで UI 開発を行うための開発用モックサービス。
 * Vitest に依存しない純粋なオブジェクトで実装。
 *
 * 使用方法:
 *   VITE_MOCK=true pnpm dev:mock
 */
import type { FileSystemService } from '@/features/folder-navigation';
import {
  getMockImageFolders,
  mockImageSourcesByFolderPath,
} from '../../tests/fixtures/data/mockData';

const folderNameMap: Record<string, string> = Object.fromEntries(
  getMockImageFolders().map((f) => [f.path, f.name]),
);

export const devMockService: FileSystemService = {
  openDirectoryDialog: async () => getMockImageFolders()[0]?.path ?? null,

  openImageFileDialog: async () => null,

  getBaseName: async (filePath: string) =>
    folderNameMap[filePath] ?? filePath.split('/').pop() ?? '',

  getDirName: async (filePath: string) =>
    filePath.split('/').slice(0, -1).join('/') || '/',

  convertFileSrc: (filePath: string) => filePath,

  listImagesInContainer: async (folderPath: string) => {
    const images = mockImageSourcesByFolderPath[folderPath] ?? [];
    return images.map((img) => img.assetUrl);
  },

  getSiblingContainers: async () => getMockImageFolders().map((f) => f.path),

  getFolderThumbnail: async () => null,

  prefetchFolderThumbnails: async () => {
    // dev mock: no-op
  },
};
