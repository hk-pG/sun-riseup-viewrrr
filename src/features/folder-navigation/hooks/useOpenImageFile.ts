import type { FileSystemService } from '../services/FileSystemService';

export interface OpenImageFileResult {
  folderPath: string | null;
  filePath: string | null;
  index: number;
}

export function useOpenImageFile(fs: FileSystemService) {
  // 画像ファイルを選択し、ディレクトリとインデックスを返す
  const openImageFile = async (): Promise<OpenImageFileResult | null> => {
    try {
      if (!fs.openImageFileDialog) return null;
      const filePath = await fs.openImageFileDialog();
      if (!filePath) return null;
      const folderPath = await fs.getDirName(filePath);
      const fileBasename = await fs.getBaseName(filePath);
      const handles = await fs.listImageHandles(folderPath);
      const index = handles.findIndex((handle) => handle.name === fileBasename);
      return {
        folderPath,
        filePath,
        index: index >= 0 ? index : 0,
      };
    } catch (error) {
      console.error('Failed to open image file:', error);
      return null;
    }
  };

  return { openImageFile };
}
