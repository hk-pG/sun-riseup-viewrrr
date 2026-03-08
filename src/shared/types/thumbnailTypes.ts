// サムネイル関連の型定義

/**
 * サムネイル情報
 */
export interface Thumbnail {
  /** サムネイルのID（BLAKE3ハッシュ） */
  id: string;
  /** サムネイル画像のキャッシュパス */
  cachePath: string;
  /** ソース画像のパス */
  sourcePath: string;
  /** ソース画像の最終更新日時（キャッシュ検証用） */
  sourceModifiedAt?: number;
}

/**
 * サムネイル生成の設定
 */
export interface ThumbnailConfig {
  /** サムネイルの幅（ピクセル） */
  width: number;
  /** サムネイルの高さ（ピクセル） */
  height: number;
  /** 画像品質（1-100） */
  quality: number;
  /** キャッシュの最大サイズ（バイト） */
  maxCacheSize: number;
}

/**
 * サムネイル生成タスク
 */
export interface ThumbnailGenerationTask {
  /** タスクID */
  id: string;
  /** ソース画像のパス */
  imagePath: string;
  /** 優先度（高いほど優先） */
  priority: number;
  /** タスクの状態 */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** エラーメッセージ（失敗時） */
  error?: string;
}

/**
 * サムネイルエラー
 */
export class ThumbnailError extends Error {
  constructor(
    message: string,
    public readonly code: ThumbnailErrorCode,
    public readonly sourcePath?: string,
  ) {
    super(message);
    this.name = 'ThumbnailError';
  }
}

/**
 * サムネイルエラーコード
 */
export enum ThumbnailErrorCode {
  ImageNotFound = 'IMAGE_NOT_FOUND',
  DecodeError = 'DECODE_ERROR',
  GenerationError = 'GENERATION_ERROR',
  CacheAccessError = 'CACHE_ACCESS_ERROR',
  IoError = 'IO_ERROR',
}
