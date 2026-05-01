import type { FolderThumbnailResult } from '../types/folderTypes';

export interface FileSystemService {
  openDirectoryDialog: () => Promise<string | null>;
  openImageFileDialog?: (extensions?: string[]) => Promise<string | null>;
  getBaseName(filePath: string): Promise<string>;
  getDirName(filePath: string): Promise<string>;

  // ユーザー定義コマンド

  /**
   * フォルダ内の画像ファイルをリストアップする
   * @param {string} folderPath - 画像ファイルをリストアップするフォルダのパス
   * @returns {Promise<string[]>} - 画像ファイルのパスの配列
   * @throws {Error} - 画像ファイルのリストアップ中にエラーが発生した場合
   */
  listImagesInFolder(folderPath: string): Promise<string[]>;

  /**
   * 指定されたフォルダと同じ階層にあるフォルダのリストを取得する
   * @param currentFolderPath 現在のフォルダのパス
   * @deprecated このメソッドは将来的に削除される予定です。代わりにgetSiblingContainersを使用してください。
   * @return {Promise<string[]>} 同じ階層にあるフォルダのパスの配列
   */
  getSiblingFolders(currentFolderPath: string): Promise<string[]>;

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
