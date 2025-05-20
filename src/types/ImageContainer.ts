import type { ImageSource } from './ImageSource';

export interface ImageContainer {
  listImages(): Promise<ImageSource[]>;
}
