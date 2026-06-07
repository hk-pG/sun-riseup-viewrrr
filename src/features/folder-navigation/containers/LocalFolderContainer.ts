import { isStringArray } from '../../../shared/utils/isStringArray';
import type { ImageContainer } from '../../image-viewer/types/ImageContainer';
import type {
  ImageHandle,
  ImageSource,
} from '../../image-viewer/types/ImageSource';
import type { FileSystemService } from '../services/FileSystemService';

export type ContainerConfig = {
  chunkSize: number;
  prefetchThreshold?: number;
};

const DEFAULT_CONTAINER_CONFIG: ContainerConfig = {
  chunkSize: 100,
};

export const isImageHandle = (value: unknown): value is ImageHandle => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.index === 'number' && typeof candidate.name === 'string'
  );
};

export const isImageHandleArray = (value: unknown): value is ImageHandle[] => {
  return Array.isArray(value) && value.every(isImageHandle);
};

const normalizeChunkSize = (chunkSize: number): number => {
  return Number.isInteger(chunkSize) && chunkSize > 0 ? chunkSize : 1;
};

export class LocalFolderContainer implements ImageContainer {
  private config: ContainerConfig;

  constructor(
    private folderPath: string,
    private fs: FileSystemService,
    config: ContainerConfig = DEFAULT_CONTAINER_CONFIG,
  ) {
    this.config = {
      ...DEFAULT_CONTAINER_CONFIG,
      ...config,
      chunkSize: normalizeChunkSize(config.chunkSize),
    };
  }

  async listHandles(): Promise<ImageHandle[]> {
    const handles = await this.fs.listImageHandles(this.folderPath);

    if (!isImageHandleArray(handles)) {
      throw new Error(
        `Invalid response from FileSystemService. Expected an array of image handles. Received: ${handles} of type ${typeof handles}`,
      );
    }

    return [...handles].sort((left, right) => left.index - right.index);
  }

  getCacheKey(): string {
    return this.folderPath;
  }

  async resolveRange(offset: number, count: number): Promise<ImageSource[]> {
    const handles = await this.listHandles();
    return this.resolveRangeFromHandles(handles, offset, count);
  }

  async listImages(): Promise<ImageSource[]> {
    const handles = await this.listHandles();

    if (handles.length === 0) {
      return [];
    }

    const imageSources: ImageSource[] = [];

    for (
      let offset = 0;
      offset < handles.length;
      offset += this.config.chunkSize
    ) {
      const chunk = await this.resolveRangeFromHandles(
        handles,
        offset,
        this.config.chunkSize,
      );
      imageSources.push(...chunk);
    }

    return imageSources;
  }

  private async resolveRangeFromHandles(
    handles: ImageHandle[],
    offset: number,
    count: number,
  ): Promise<ImageSource[]> {
    if (count <= 0) {
      return [];
    }

    const requestedHandles = handles.slice(offset, offset + count);

    if (requestedHandles.length === 0) {
      return [];
    }

    const files = await this.fs.resolveImagesInRange(
      this.folderPath,
      offset,
      requestedHandles.length,
    );

    if (!isStringArray(files)) {
      throw new Error(
        `Invalid response from FileSystemService. Expected an array of strings. Received: ${files} of type ${typeof files}`,
      );
    }

    if (files.length !== requestedHandles.length) {
      throw new Error(
        `Resolved image count mismatch. Expected ${requestedHandles.length}, received ${files.length}`,
      );
    }

    return requestedHandles.map((handle, index) => {
      const filePath = files[index];

      return {
        id: filePath,
        name: handle.name,
        assetUrl: this.fs.convertFileSrc(filePath),
      };
    });
  }
}
