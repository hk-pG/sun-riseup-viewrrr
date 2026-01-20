import {
  invoke,
  convertFileSrc as tauriConvertFileSrc,
} from '@tauri-apps/api/core';
import {
  basename as tauriBasename,
  dirname as tauriDirname,
} from '@tauri-apps/api/path';
import { open as tauriOpenDialog } from '@tauri-apps/plugin-dialog';
import type { FileSystemService } from '../../features/folder-navigation';
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
  getBaseName: async (filePath: string): Promise<string> => {
    const basename = await tauriBasename(filePath);
    return basename;
  },
  getDirName: async (filePath: string): Promise<string> => {
    const dirname = await tauriDirname(filePath);
    return dirname;
  },
  convertFileSrc: (filePath: string): string => {
    return tauriConvertFileSrc(filePath);
  },

  openImageFileDialog: async (
    extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ): Promise<string | null> => {
    try {
      const selected = await tauriOpenDialog({
        directory: false,
        multiple: false,
        filters: [{ name: 'Images', extensions }],
      });
      if (selected && typeof selected === 'string') {
        return selected;
      }
      return null;
    } catch (error) {
      throw new Error(`error occurred during open image file ${error}`);
    }
  },

  listImagesInFolder: async (folderPath: string): Promise<string[]> => {
    try {
      const images = await invoke<string[]>('list_images_in_folder', {
        folderPath,
      });

      return images;
    } catch (error) {
      console.error(`Error listing images in folder ${folderPath}`, error);
      return [];
    }
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

  // Thumbnail optimization methods (001-rust-thumbnail-optimization)

  getOrCreateThumbnail: async (imagePath: string): Promise<string> => {
    try {
      const cachePath = await invoke<string>('get_or_create_thumbnail', {
        imagePath,
      });
      return cachePath;
    } catch (error) {
      throw new Error(
        `Failed to get or create thumbnail for ${imagePath}: ${error}`,
      );
    }
  },

  batchCreateThumbnails: async (
    imagePaths: string[],
    visibleCount?: number,
  ): Promise<
    Record<string, { success: boolean; path?: string; error?: string }>
  > => {
    try {
      const result = await invoke<
        Record<string, { success: boolean; path?: string; error?: string }>
      >('batch_create_thumbnails', {
        imagePaths,
        visibleCount,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to batch create thumbnails: ${error}`);
    }
  },

  clearThumbnailCache: async (): Promise<void> => {
    try {
      await invoke('clear_thumbnail_cache');
    } catch (error) {
      throw new Error(`Failed to clear thumbnail cache: ${error}`);
    }
  },
};
