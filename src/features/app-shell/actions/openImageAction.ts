import type { OpenImageFileResult } from '@/features/folder-navigation/hooks/useOpenImageFile';
import type { FolderSelectedResult } from './types';

export const openImageAction = async (
  openImageFile: () => Promise<OpenImageFileResult | null>,
): Promise<FolderSelectedResult | null> => {
  const result = await openImageFile();
  if (!result?.folderPath) return null;
  return {
    type: 'folder-selected',
    folderPath: result.folderPath,
    initialImageIndex: result.index,
  };
};
