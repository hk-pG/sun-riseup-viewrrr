import { useServices } from '@/context/ServiceContext';
import type { FileSystemService } from '@/service/FileSystemService';
import type { ImageSource } from '@/types/ImageSource';
import { convertFileSrc } from '@tauri-apps/api/core';
import { basename } from '@tauri-apps/api/path';
import useSWR from 'swr';

async function fetchThumbnail(
  folderPath: string,
  fs: FileSystemService,
): Promise<ImageSource | null> {
  const files = await fs.listImagesInFolder(folderPath);

  if (files.length < 1) {
    return null;
  }

  const first = files[0];
  const name = await basename(first).catch((error) => {
    console.error('Error getting file basename:', error);
    throw new Error(`Failed to get file basename: ${error}`);
  });

  return {
    id: first,
    name,
    assetUrl: convertFileSrc(first),
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
