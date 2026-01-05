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
   * @return {Promise<string[]>} 同じ階層にあるフォルダのパスの配列
   */
  getSiblingFolders(currentFolderPath: string): Promise<string[]>;

  /**
   * ファイルのパスをリソースURLに変換する
   * @param filePath ファイルのパス
   * @return {string} リソースURL
   */
  convertFileSrc(filePath: string): string;

  // Thumbnail optimization methods (001-rust-thumbnail-optimization)

  /**
   * 画像のサムネイルを取得または生成する
   * @param imagePath ソース画像のフルパス
   * @returns {Promise<string>} サムネイルのキャッシュパス
   * @throws {Error} サムネイル生成中にエラーが発生した場合
   */
  getOrCreateThumbnail?(imagePath: string): Promise<string>;

  /**
   * 複数の画像のサムネイルをバッチ生成する
   * @param imagePaths ソース画像のパスの配列
   * @returns {Promise<Record<string, string>>} 各画像パスに対応するサムネイルキャッシュパスのマップ
   * @throws {Error} サムネイル生成中にエラーが発生した場合
   */
  batchCreateThumbnails?(imagePaths: string[]): Promise<Record<string, string>>;

  /**
   * サムネイルキャッシュをクリアする（デバッグ用）
   * @returns {Promise<void>}
   * @throws {Error} キャッシュクリア中にエラーが発生した場合
   */
  clearThumbnailCache?(): Promise<void>;
}
