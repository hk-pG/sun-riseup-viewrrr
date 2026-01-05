import useSWR from 'swr';
import { useServices } from '../../../shared/context/ServiceContext';
import type { ImageSource } from '../../image-viewer/types/ImageSource';
import type { FileSystemService } from '../services/FileSystemService';

/**
 * フォルダのサムネイルを取得
 * 001-rust-thumbnail-optimization: Rustバックエンドでサムネイル生成する場合はgetOrCreateThumbnailを使用
 */
async function fetchThumbnail(
  folderPath: string,
  fs: FileSystemService,
): Promise<ImageSource | null> {
  const files = await fs.listImagesInFolder(folderPath);

  if (files.length < 1) {
    return null;
  }

  const first = files[0];
  const name = await fs.getBaseName(first);

  // Rustサムネイル最適化が有効な場合はそれを使用
  if (fs.getOrCreateThumbnail) {
    try {
      const thumbnailPath = await fs.getOrCreateThumbnail(first);
      return {
        id: first,
        name,
        assetUrl: fs.convertFileSrc(thumbnailPath),
      };
    } catch (error) {
      console.warn(
        'Failed to generate thumbnail, falling back to original:',
        error,
      );
      // フォールバック: 元の画像を使用
      return {
        id: first,
        name,
        assetUrl: fs.convertFileSrc(first),
      };
    }
  }

  // フォールバック: 元の画像を直接使用
  return {
    id: first,
    name,
    assetUrl: fs.convertFileSrc(first),
  };
}

export function useThumbnail(folderPath: string) {
  const fs = useServices();

  const { data, isLoading, error } = useSWR(
    folderPath,
    (key) => fetchThumbnail(key, fs),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    thumbnail: data ?? null,
    isLoading,
    isError: !!error,
  };
}
