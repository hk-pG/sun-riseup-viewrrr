import useSWR from 'swr';
import {
  type FileSystemService,
  LocalFolderContainer,
} from '../../../features/folder-navigation';
import { useServices } from '../../context/ServiceContext';

const fetchImages = async (folderPath: string, fs: FileSystemService) => {
  const container = new LocalFolderContainer(folderPath, fs);
  return await container.listImages();
};

export const useImages = (folderPath: string | null | undefined) => {
  const fs = useServices();
  const { data, error, isLoading } = useSWR(
    folderPath ? ['images', folderPath] : null,
    () => fetchImages(folderPath as string, fs),
    { revalidateOnFocus: false },
  );

  return { images: data, error, isLoading };
};
