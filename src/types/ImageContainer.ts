import type { ImageSource } from './ImageSource';

/**
 * 画像リスト取得のための抽象インターフェース。
 * - listImages()でImageSource型の配列を返す。
 * - LocalFolderContainerなどで実装される。
 * - 画像ビューアやサムネイル表示などで利用される。
 */
export interface ImageContainer {
  listImages(): Promise<ImageSource[]>;
}
