import useSWR from 'swr';
import type { ImageContainer } from '@/features/image-viewer';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import { logger } from '@/shared/utils/logger';
import {
  type FileSystemService,
  LocalFolderContainer,
} from '../../../features/folder-navigation';
import { useServices } from '../../context/ServiceContext';

type UseImagesSource = string | ImageContainer | null | undefined;

type LegacyImageContainer = {
  listImages?: () => Promise<ImageSource[]>;
};

const containerInstanceCacheKeys = new WeakMap<object, string>();
let nextContainerCacheKey = 0;

const isImageContainer = (value: UseImagesSource): value is ImageContainer => {
  return typeof value === 'object' && value !== null;
};

const createContainer = (
  source: Exclude<UseImagesSource, null | undefined>,
  fs: FileSystemService,
): ImageContainer | LegacyImageContainer => {
  if (typeof source === 'string') {
    return new LocalFolderContainer(source, fs);
  }

  return source;
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
  source: Exclude<UseImagesSource, null | undefined>,
  fs: FileSystemService,
): Promise<ImageSource[]> => {
  const container = createContainer(source, fs);

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

const getImagesKey = (source: UseImagesSource) => {
  if (!source) {
    return null;
  }

  if (typeof source === 'string') {
    return ['images', source] as const;
  }

  if (isImageContainer(source)) {
    return ['images', getContainerCacheKey(source)] as const;
  }

  return null;
};

/**
 * 指定のフォルダから像ファイルを取得するためのカスタムフック

 * @param source 画像ファイルを取得したいフォルダパス、または画像コンテナ
 * @returns 画像ファイルのリスト、エラー、ローディング状態
 */
export const useImages = (source?: UseImagesSource) => {
  const fs = useServices();

  const { data, error, isLoading } = useSWR<ImageSource[]>(
    getImagesKey(source),
    () => fetchImages(source as Exclude<UseImagesSource, null | undefined>, fs),
    {
      revalidateOnFocus: false,
      // React 19 concurrent features対応
      suspense: false,
      keepPreviousData: true,
      errorRetryCount: 0,
      onError: (err) => {
        console.dir(err);
        logger.error(`${err}`, {
          file: 'useImages.ts',
          line: 88,
        });
      },
    },
  );

  return { images: data, error, isLoading };
};
