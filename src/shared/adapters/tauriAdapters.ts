import {
  invoke,
  convertFileSrc as tauriConvertFileSrc,
} from '@tauri-apps/api/core';
import {
  basename as tauriBasename,
  dirname as tauriDirname,
} from '@tauri-apps/api/path';
import { open as tauriOpenDialog } from '@tauri-apps/plugin-dialog';
import type { FolderThumbnailResult } from '@/features/folder-navigation/types/folderTypes';
import type { FileSystemService } from '../../features/folder-navigation';
import { isStringArray } from '../utils/isStringArray';

export const tauriFileSystemService: FileSystemService = {
  openDirectoryDialog: async (): Promise<string | null> => {
    try {
      const selected = await tauriOpenDialog({ directory: true });
      if (selected && typeof selected === 'string') {
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
      if (!isStringArray(images)) {
        throw new Error(
          `Invalid response from listImagesInFolder: expected string array, got ${typeof images}`,
        );
      }
      return images;
    } catch (error) {
      throw new Error(
        `Failed to list images in folder "${folderPath}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  getSiblingContainers: async (containerPath: string): Promise<string[]> => {
    try {
      const containers = await invoke<string[]>('get_sibling_containers', {
        containerPath,
      });
      if (!isStringArray(containers)) {
        throw new Error(
          `Invalid response from getSiblingContainers: expected string array, got ${typeof containers}`,
        );
      }
      return containers;
    } catch (error) {
      throw new Error(
        `Failed to get sibling containers for "${containerPath}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  // 016-thumbnail-backend-responsibility

  getFolderThumbnail: async (
    folderPath: string,
  ): Promise<FolderThumbnailResult | null> => {
    try {
      const result = await invoke<FolderThumbnailResult | null>(
        'get_folder_thumbnail',
        { folderPath },
      );
      return result;
    } catch (error) {
      throw new Error(
        `Failed to get folder thumbnail for "${folderPath}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  prefetchFolderThumbnails: async (folderPaths: string[]): Promise<void> => {
    try {
      await invoke('prefetch_folder_thumbnails', { folderPaths });
    } catch (error) {
      throw new Error(
        `Failed to prefetch folder thumbnails: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
