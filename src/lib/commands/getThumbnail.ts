import { convertFileSrc } from '@tauri-apps/api/core';
import { basename } from '@tauri-apps/api/path';
import type { ImageSource } from '../../types/ImageSource';
import { isStringArray } from '../../utils/isStringArray';
import { listImagesInFolder } from './fs';

/**
 * 指定されたフォルダ内の最初の画像を取得する
 * @param folderPath - 指定の画像フォルダのパス
 * @returns - 画像のURLを含むImageSourceオブジェクト
 */
export async function getThumbnail(
  folderPath: string,
): Promise<ImageSource | null> {
  const files = await listImagesInFolder(folderPath);

  if (!isStringArray(files)) {
    throw new Error(
      `Invalid response from Tauri command. Expected an array of strings. Received: ${files} of type ${typeof files}`,
    );
  }

  if (files.length <= 0) {
    throw new Error(`No images found in the folder: ${folderPath}`);
  }

  // 1つ目の画像のURLを取得
  const firstPath = files[0];

  // パスからファイル名を取得する
  const filename = await basename(firstPath);

  const imageSource: ImageSource = {
    id: firstPath,
    name: filename,
    assetUrl: convertFileSrc(firstPath),
  };

  return imageSource;
}
