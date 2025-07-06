import type { FolderInfo, ImageFile } from '@/components';
import type { ImageSource } from '@/types/ImageSource';

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
  return Array.from({ length: count }, (_, index) => ({
    id: `${folderName}-${index + 1}`,
    name: `${folderName}_page_${String(index + 1).padStart(3, '0')}.jpg`,
    assetUrl: `/placeholder.svg?height=800&width=600&text=${folderName}-${index + 1}`,
  }));
};

// ビューアテスト用のサンプル画像データ
export const sampleImageSources1: ImageSource[] = [
  // 上の例と同じ構成の画像を1~10まで生成
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}.png`,
    name: `${i + 1}.png`,
    assetUrl: `/test_images/folder_1/1-${i + 1}.png`,
  })),
];
export const sampleImageSources2: ImageSource[] = [
  // 上の例と同じ構成の画像を1~10まで生成
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}.png`,
    name: `${i + 1}.png`,
    assetUrl: `/test_images/folder_2/2-${i + 1}.png`,
  })),
];
export const sampleImageSources3: ImageSource[] = [
  // 上の例と同じ構成の画像を1~10まで生成
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}.png`,
    name: `${i + 1}.png`,
    assetUrl: `/test_images/folder_3/3-${i + 1}.png`,
  })),
];

// モックフォルダデータ
export const mockFolders: FolderInfo[] = [
  {
    path: '/test_images/folder_1/',
    name: 'ワンピース 第1巻',
    thumbnailImage: {
      path: '/test_images/folder_1/1-1.png',
      name: '1-1.png',
    },
    imageCount: 192,
  },
  {
    path: '/test_images/folder_2/',
    name: 'NARUTO -ナルト- 第1巻',
    thumbnailImage: {
      path: '/test_images/folder_2/2-1.png',
      name: '2-1.png',
    },
    imageCount: 184,
  },
  {
    path: '/test_images/folder_3/',
    name: '進撃の巨人 第1巻',
    thumbnailImage: {
      path: '/test_images/folder_3/3-1.png',
      name: '3-1.png',
    },
    imageCount: 196,
  },
];

// フォルダごとの画像データマップ
export const mockImagesByFolder: Record<string, ImageFile[]> = {
  '/manga/one-piece-vol-1': createMockImages('ワンピース1巻', 192),
  '/manga/naruto-vol-1': createMockImages('ナルト1巻', 184),
  '/manga/attack-on-titan-vol-1': createMockImages('進撃の巨人1巻', 196),
  '/manga/demon-slayer-vol-1': createMockImages('鬼滅の刃1巻', 208),
  '/manga/my-hero-academia-vol-1': createMockImages('ヒロアカ1巻', 200),
  '/manga/jujutsu-kaisen-vol-1': createMockImages('呪術廻戦1巻', 192),
  '/manga/chainsaw-man-vol-1': createMockImages('チェンソーマン1巻', 200),
  '/manga/spy-family-vol-1': createMockImages('スパイファミリー1巻', 188),
};
