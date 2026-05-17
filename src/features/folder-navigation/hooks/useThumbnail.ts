import useSWR from 'swr';
import { useServices } from '../../../shared/context/ServiceContext';
import type { ImageSource } from '../../image-viewer/types/ImageSource';
import type { FileSystemService } from '../services/FileSystemService';

async function fetchThumbnail(
  folderPath: string,
  fs: FileSystemService,
): Promise<ImageSource | null> {
  const result = await fs.getFolderThumbnail(folderPath);
  if (!result) return null;
  return {
    id: result.imagePath,
    name: result.imageName,
    assetUrl: fs.convertFileSrc(result.thumbnailPath),
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
