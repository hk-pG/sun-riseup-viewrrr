/**
 * Rust バックエンドなしで UI 開発を行うための開発用モックサービス。
 * Vitest に依存しない純粋なオブジェクトで実装。
 *
 * 使用方法:
 *   VITE_MOCK=true pnpm dev:mock
 */
import type { FileSystemService } from '@/features/folder-navigation';
import {
  generateDummyEmptyFolders,
  getMockImageFolders,
  mockImageSourcesByFolderPath,
} from '../../tests/fixtures/data/mockData';

const TARGET_FOLDER_COUNT = 100;
const imageFolders = getMockImageFolders();
// 画像ありフォルダ数が TARGET_FOLDER_COUNT に満たない分をダミーで補完
const dummyFolders = generateDummyEmptyFolders(
  Math.max(0, TARGET_FOLDER_COUNT - imageFolders.length),
);
const allFolderPaths = [
  ...imageFolders.map((f) => f.path),
  ...dummyFolders.map((f) => f.path),
];

const folderNameMap: Record<string, string> = {
  ...Object.fromEntries(imageFolders.map((f) => [f.path, f.name])),
  ...Object.fromEntries(dummyFolders.map((f) => [f.path, f.name])),
};

export const devMockService: FileSystemService = {
  openDirectoryDialog: async () => imageFolders[0]?.path ?? null,

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

  getSiblingContainers: async (containerPath: string) =>
    allFolderPaths.filter((p) => p !== containerPath),

  getFolderThumbnail: async () => null,

  prefetchFolderThumbnails: async () => {
    // dev mock: no-op
  },
};
