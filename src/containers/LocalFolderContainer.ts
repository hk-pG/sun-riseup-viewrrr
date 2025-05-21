import { convertFileSrc } from '@tauri-apps/api/core';
import { basename } from '@tauri-apps/api/path';
import type { FileSystemService } from '../service/FileSystem.types';
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
        `Invalid response from Tauri command. Expected an array of strings. Received: ${files} of type ${typeof files}`,
      );
    }

    const imageSources = await Promise.all(
      files.map(async (path) => {
        // ファイルパスからファイル名を取得する
        const fileBasename = await basename(path).catch((error) => {
          console.error('Error getting file basename:', error);
          throw new Error(`Failed to get file basename: ${error}`);
        });

        return {
          id: path,
          name: fileBasename,
          assetUrl: convertFileSrc(path),
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
