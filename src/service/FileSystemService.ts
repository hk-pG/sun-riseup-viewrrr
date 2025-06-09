export interface FileSystemService {
  openDirectoryDialog: () => Promise<string | null>;
  openFileDialog: () => Promise<string | null>;
  getBaseName(filePath: string): Promise<string>;
  getDirName(filePath: string): Promise<string>;

  // ユーザー定義コマンド
  listImagesInFolder(folderPath: string): Promise<string[]>;
  getSiblingFolders(currentFolderPath: string): Promise<string[]>;
  convertFileSrc(filePath: string): string;
}
