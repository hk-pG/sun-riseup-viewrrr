import type { FileSystemService } from '../services/FileSystemService';
import type { FolderEntry } from '../types/folderTypes';

export async function createFolderEntry(
  dirPath: string,
  fs: FileSystemService,
): Promise<FolderEntry> {
  return {
    path: dirPath,
    name: await fs.getBaseName(dirPath),
  };
}
