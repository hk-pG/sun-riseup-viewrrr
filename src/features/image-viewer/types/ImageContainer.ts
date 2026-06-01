import type { ImageHandle, ImageSource } from './ImageSource';

/**
 * 画像コンテナ取得のための抽象インターフェース。
 * 互換移行中のため旧 listImages は残しつつ、viewer 内部では
 * listHandles/resolveRange の 2 フェーズ契約へ寄せていく。
 */
export interface ImageContainer {
  listHandles(): Promise<ImageHandle[]>;
  resolveRange(offset: number, count: number): Promise<ImageSource[]>;
  listImages?(): Promise<ImageSource[]>;
  getCacheKey?(): string;
}
