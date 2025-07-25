import useSWR from 'swr';
import { useServices } from '@/context/ServiceContext';
import type { FileSystemService } from '@/service/FileSystemService';
import type { ImageSource } from '@/types/ImageSource';

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
