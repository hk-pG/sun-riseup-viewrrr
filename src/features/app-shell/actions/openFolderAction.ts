import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import type { FolderSelectedResult } from './types';

export const openFolderAction = async (
  fss: FileSystemService,
): Promise<FolderSelectedResult | null> => {
  const folderPath = await fss.openDirectoryDialog();
  if (!folderPath) return null;
  return {
    type: 'folder-selected',
    folderPath,
    initialImageIndex: 0,
  };
};
