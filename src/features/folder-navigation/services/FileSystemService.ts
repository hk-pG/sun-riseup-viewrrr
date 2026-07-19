import type { ImageHandle } from '../../image-viewer/types/ImageSource';
import type { FolderThumbnailResult } from '../types/folderTypes';

export interface FileSystemService {
  openDirectoryDialog: () => Promise<string | null>;
  openImageFileDialog?: (extensions?: string[]) => Promise<string | null>;
  getBaseName(filePath: string): Promise<string>;
  getDirName(filePath: string): Promise<string>;

  // ユーザー定義コマンド

  /**
   * コンテナ内の画像ファイルをリストアップする
   * @param {string} containerPath - 画像ファイルをリストアップするコンテナのパス
   * @returns {Promise<string[]>} - 画像ファイルのパスの配列
   * @throws {Error} - 画像ファイルのリストアップ中にエラーが発生した場合
   */
  listImagesInContainer(containerPath: string): Promise<string[]>;

  /**
   * コンテナ内の画像ハンドルを軽量に取得する
   * @param {string} containerPath - 画像ハンドルを取得するコンテナのパス
   * @returns {Promise<ImageHandle[]>} - 画像ハンドルの配列
   * @throws {Error} - ハンドル取得中にエラーが発生した場合
   */
  listImageHandles(containerPath: string): Promise<ImageHandle[]>;

  /**
   * コンテナ内の指定範囲の画像パスを解決する
   * @param {string} containerPath - 画像を解決するコンテナのパス
   * @param {number} offset - 解決開始オフセット
   * @param {number} count - 解決する件数
   * @returns {Promise<string[]>} - 解決された画像ファイルパスの配列
   * @throws {Error} - 画像解決中にエラーが発生した場合
   */
  resolveImagesInRange(
    containerPath: string,
    offset: number,
    count: number,
  ): Promise<string[]>;

  /**
   * 指定されたコンテナと同じ階層にあるコンテナのリストを取得する。
   * **コンテナ**は、フォルダに加えてアーカイブを含む。
   * @param currentContainerPath 現在のコンテナパス
   * @returns {Promise<string[]>} 同じ階層にあるコンテナのパス配列
   */
  getSiblingContainers(currentContainerPath: string): Promise<string[]>;

  /**
   * ファイルのパスをリソースURLに変換する
   * @param filePath ファイルのパス
   * @return {string} リソースURL
   */
  convertFileSrc(filePath: string): string;

  /**
   * フォルダのサムネイル（代表画像）を取得する
   * バックエンドが画像選択・サムネイル生成を一括処理
   * @param folderPath フォルダのパス
   * @returns {Promise<FolderThumbnailResult | null>} サムネイル情報、画像なしの場合null
   */
  getFolderThumbnail(folderPath: string): Promise<FolderThumbnailResult | null>;

  /**
   * 複数フォルダのサムネイルをバックグラウンドでプリフェッチする
   * @param folderPaths フォルダパスの配列
   */
  prefetchFolderThumbnails(folderPaths: string[]): Promise<void>;
}
