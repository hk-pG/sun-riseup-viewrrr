import useSWR from 'swr';
import type { ImageContainer } from '@/features/image-viewer';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import { logger } from '@/shared/utils/logger';

type UseImagesSource = string | ImageContainer | null | undefined;

const containerInstanceCacheKeys = new WeakMap<object, string>();
let nextContainerCacheKey = 0;

const isImageContainer = (value: UseImagesSource): value is ImageContainer => {
  return typeof value === 'object' && value !== null;
};

const getContainerCacheKey = (container: ImageContainer): string => {
  const explicitKey = container.getCacheKey?.();

  if (typeof explicitKey === 'string' && explicitKey.length > 0) {
    return explicitKey;
  }

  const containerRecord = container as unknown as Record<string, unknown>;

  if (typeof containerRecord.folderPath === 'string') {
    return containerRecord.folderPath;
  }

  if (typeof containerRecord.containerPath === 'string') {
    return containerRecord.containerPath;
  }

  let cacheKey = containerInstanceCacheKeys.get(container);

  if (!cacheKey) {
    nextContainerCacheKey += 1;
    cacheKey = `instance:${nextContainerCacheKey}`;
    containerInstanceCacheKeys.set(container, cacheKey);
  }

  return cacheKey;
};

const fetchImages = async (
  container?: ImageContainer,
): Promise<ImageSource[]> => {
  if (!container) {
    return [];
  }

  if ('listImages' in container && typeof container.listImages === 'function') {
    return await container.listImages();
  }

  if ('listHandles' in container && 'resolveRange' in container) {
    const handles = await container.listHandles();

    if (handles.length === 0) {
      return [];
    }

    return await container.resolveRange(0, handles.length);
  }

  throw new Error('Unsupported image container contract.');
};

const getImagesKey = (source?: ImageContainer) => {
  if (!source) {
    return null;
  }

  if (isImageContainer(source)) {
    return ['images', getContainerCacheKey(source)] as const;
  }

  return null;
};

/**
 * 指定のコンテナから画像ファイルを取得するためのカスタムフック
 *
 * @param source 画像ファイルを取得したいコンテナパス、または画像コンテナ
 * @returns 画像ファイルのリスト、エラー、ローディング状態
 */
export const useImages = (source?: ImageContainer) => {
  const { data, error, isLoading } = useSWR<ImageSource[]>(
    getImagesKey(source),
    () => fetchImages(source),
    {
      revalidateOnFocus: false,
      // React 19 concurrent features対応
      suspense: false,
      keepPreviousData: true,
      errorRetryCount: 0,
      onError: (err) => {
        logger.error(`${err}`, {
          file: 'useImages.ts',
          line: 124,
        });
      },
    },
  );

  return { images: data, error, isLoading };
};
