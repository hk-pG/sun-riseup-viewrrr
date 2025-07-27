import type { FolderInfo, ImageFile } from '@/features/folder-navigation/types/folderTypes';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';

// モック画像データ
export const createMockImages = (
  folderName: string,
  count: number,
): ImageFile[] => {
  return Array.from({ length: count }, (_, index) => ({
    path: `/placeholder.svg?height=800&width=600&text=${folderName}-${index + 1}`,
    name: `${folderName}_page_${String(index + 1).padStart(3, '0')}.jpg`,
    size: Math.floor(Math.random() * 2000000) + 500000, // 0.5MB - 2.5MB
    lastModified: new Date(Date.now() - Math.random() * 86400000 * 30), // 過去30日以内
  }));
};

// ImageSource型のモックデータを作成
export const createMockImageSources = (
  folderName: string,
  count: number,
): ImageSource[] => {
  const folderNum = folderName.replace(/[^0-9]/g, '');
  return Array.from({ length: count }, (_, index) => ({
    id: `${folderNum}-${index + 1}.png`,
    name: `${folderNum}-${index + 1}.png`,
    assetUrl: `/test_images/${folderName}/${folderNum}-${index + 1}.png`,
  }));
};

// ビューアテスト用のサンプル画像データ（パスで一元管理）
// テスト用にimageCountと実データ数を揃える（例: 20件ずつ）
const TEST_IMAGE_COUNT = 10;
export const mockImageSourcesByFolderPath: Record<string, ImageSource[]> = {
  '/test_images/folder_1': createMockImageSources('folder_1', TEST_IMAGE_COUNT),
  '/test_images/folder_2': createMockImageSources('folder_2', TEST_IMAGE_COUNT),
  '/test_images/folder_3': createMockImageSources('folder_3', TEST_IMAGE_COUNT),
};

// 画像付きフォルダ情報はmockImageSourcesByFolderPathからのみ生成
export const getMockImageFolders = (): FolderInfo[] => {
  const folderNames: Record<string, string> = {
    '/test_images/folder_1': 'ワンピース 第1巻',
    '/test_images/folder_2': 'NARUTO -ナルト- 第1巻',
    '/test_images/folder_3': '進撃の巨人 第1巻',
  };
  return Object.entries(mockImageSourcesByFolderPath).map(([path, images]) => ({
    path,
    name: folderNames[path] || path,
    thumbnailImage: images[0]
      ? { path: images[0].assetUrl, name: images[0].name }
      : { path: '', name: '' },
    imageCount: images.length,
  }));
};

// 画像を持たないテスト用フォルダ例（サイドバーUIテスト等）
export const mockSidebarOnlyFolders: Array<{ path: string; name: string }> = [
  { path: '/mock/empty-folder', name: '空のフォルダ（画像なし）' },
  { path: '/mock/settings', name: '設定' },
  { path: '/mock/about', name: 'このアプリについて' },
];

