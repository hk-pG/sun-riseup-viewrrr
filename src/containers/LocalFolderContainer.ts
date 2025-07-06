import type { FileSystemService } from '../service/FileSystemService';
import type { ImageContainer } from '../types/ImageContainer';
import type { ImageSource } from '../types/ImageSource';
import { isStringArray } from '../utils/isStringArray';
import { naturalSort } from '../utils/sort';

export class LocalFolderContainer implements ImageContainer {
  constructor(
    private folderPath: string,
    private fs: FileSystemService,
  ) {}

  async listImages(): Promise<ImageSource[]> {
    const files = await this.fs.listImagesInFolder(this.folderPath);

    // Tauriのコマンドの戻り値が文字列の配列であることを確認する
    if (!isStringArray(files)) {
      throw new Error(
        `Invalid response from FileSystemService. Expected an array of strings. Received: ${files} of type ${typeof files}`,
      );
    }

    const imageSources = await Promise.all(
      files.map(async (imgPath) => {
        // ファイルパスからファイル名を取得する
        const fileBasename = await this.fs.getBaseName(imgPath);
        return {
          id: imgPath,
          name: fileBasename,
          assetUrl: this.fs.convertFileSrc(imgPath),
        };
      }),
    ).catch((error) => {
      console.error('Error converting file paths to asset URLs:', error);
      throw new Error(`Failed to convert file paths to asset URLs: ${error}`);
    });

    // 画像を名前でソートする
    imageSources.sort(naturalSort);

    return imageSources;
  }
}
