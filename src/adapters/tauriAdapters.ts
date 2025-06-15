import {
  invoke,
  convertFileSrc as tauriConvertFileSrc,
} from '@tauri-apps/api/core';
import {
  basename as tauriBasename,
  dirname as tauriDirname,
} from '@tauri-apps/api/path';
import { open as tauriOpenDialog } from '@tauri-apps/plugin-dialog';
import type { FileSystemService } from '../service/FileSystemService';
import { isStringArray } from '../utils/isStringArray';

export const tauriFileSystemService: FileSystemService = {
  openDirectoryDialog: async (): Promise<string | null> => {
    try {
      const selected = await tauriOpenDialog({ directory: true });
      if (selected) {
        return selected as string;
      }
    } catch (error) {
      throw new Error(`error occurred during open folder ${error}`);
    }

    return null;
  },

  openFileDialog: async (): Promise<string | null> => {
    const selected = await tauriOpenDialog({
      directory: false,
      multiple: false,
      // TODO: バックエンド側と連携して対応する拡張子のみのファイルを選択できるようにする
      // filters: [{ name: 'Images', extensions: [] }],
    });

    if (selected) {
      return selected;
    }

    return null;
  },

  getBaseName: async (filePath: string): Promise<string> => {
    const basename = await tauriBasename(filePath);
    return basename;
  },
  getDirName: async (filePath: string): Promise<string> => {
    const dirname = await tauriDirname(filePath);
    return dirname;
  },
  listImagesInFolder: async (folderPath: string): Promise<string[]> => {
    const images = await invoke<string[]>('list_images_in_folder', {
      folderPath,
    });

    return images;
  },

  getSiblingFolders: async (folderPath: string): Promise<string[]> => {
    try {
      const folders = await invoke<string[]>('get_sibling_folders', {
        folderPath,
      });
      if (!isStringArray(folders)) {
        console.error('Invalid response from getSiblingFolders:', folders);
        return [];
      }
      return folders;
    } catch (error) {
      console.error('Error getting sibling folders:', error);
      return [];
    }
  },

  convertFileSrc: (filePath: string): string => {
    return tauriConvertFileSrc(filePath);
  },
};
