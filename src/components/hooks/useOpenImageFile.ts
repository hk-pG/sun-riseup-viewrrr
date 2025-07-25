import { useCallback } from 'react';
import type { FileSystemService } from '@/service/FileSystemService';

export interface OpenImageFileResult {
  folderPath: string | null;
  filePath: string | null;
  index: number;
}

export function useOpenImageFile(fs: FileSystemService) {
  // 画像ファイルを選択し、ディレクトリとインデックスを返す
  const openImageFile =
    useCallback(async (): Promise<OpenImageFileResult | null> => {
      if (!fs.openImageFileDialog) return null;
      const filePath = await fs.openImageFileDialog();
      if (!filePath) return null;
      const folderPath = await fs.getDirName(filePath);
      const images = await fs.listImagesInFolder(folderPath);
      const index = images.findIndex((img) => img === filePath);
      return {
        folderPath,
        filePath,
        index: index >= 0 ? index : 0,
      };
    }, [fs]);

  return { openImageFile };
}
