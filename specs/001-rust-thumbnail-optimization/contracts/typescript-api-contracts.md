# API Contracts: Rust Backend Thumbnail Optimization

**Feature**: 001-rust-thumbnail-optimization  
**Date**: 2026-01-05  
**Status**: Draft

このドキュメントは、Tauri コマンド、TypeScript インターフェース、Rust型の契約を定義します。

---

## 目次

1. [Tauri コマンド](#tauri-コマンド)
2. [TypeScript インターフェース](#typescript-インターフェース)
3. [Rust 型定義](#rust-型定義)
4. [エラーハンドリング](#エラーハンドリング)
5. [FileSystemService 拡張](#filesystemservice-拡張)

---

## Tauri コマンド

### 1. `get_or_create_thumbnail`

**説明**: 指定された画像のサムネイルをキャッシュから取得、または新規生成してキャッシュパスを返す。

#### シグネチャ (Rust)

```rust
#[command]
async fn get_or_create_thumbnail(
    app_handle: AppHandle,
    image_path: String,
) -> Result<String, String>
```

#### 引数

| パラメータ | 型 | 必須 | 説明 | 例 |
|----------|-------|------|------|-----|
| `app_handle` | `AppHandle` | ✅ | Tauri アプリハンドル（自動注入） | - |
| `image_path` | `String` | ✅ | 元画像の絶対パス | `/home/user/photos/IMG_1234.jpg` |

#### 戻り値

- **Success**: サムネイルのキャッシュパス（絶対パス）を返す
  ```json
  "/home/user/.cache/sun-riseup-viewrrr/thumbnails/a7f5c9d2...b5a4.jpg"
  ```

- **Error**: エラーメッセージを返す
  ```json
  "Failed to read image file: Permission denied"
  ```

#### 振る舞い

1. キャッシュディレクトリを取得（`AppHandle::path().app_cache_dir()`）
2. 元画像パスからBLAKE3ハッシュを生成してキャッシュファイル名を構築
3. キャッシュファイルが存在する場合:
   - 元画像の更新日時をチェック
   - 変更なし → キャッシュパスを即座に返す
   - 変更あり → キャッシュ削除して再生成
4. キャッシュファイルが存在しない場合:
   - `tokio::spawn_blocking`でサムネイル生成タスクを実行
   - 画像をデコード → 200×200pxにリサイズ → JPEG品質60でエンコード
   - キャッシュディレクトリに保存
   - キャッシュパスを返す

#### TypeScript 呼び出し例

```typescript
import { invoke } from '@tauri-apps/api/core';

const thumbnailPath = await invoke<string>('get_or_create_thumbnail', {
  imagePath: '/home/user/photos/IMG_1234.jpg',
});

console.log(thumbnailPath); // "/home/user/.cache/sun-riseup-viewrrr/thumbnails/a7f5c9d2...b5a4.jpg"
```

#### エラーケース

| エラー | 条件 | メッセージ例 |
|-------|------|-------------|
| ファイル読み取りエラー | 画像ファイルが存在しない、または読み取り権限がない | `Failed to read image file: No such file or directory` |
| デコードエラー | サポート外のフォーマット、または破損した画像 | `Failed to decode image: Unsupported image format` |
| キャッシュ書き込みエラー | ディスク容量不足、または書き込み権限がない | `Failed to write thumbnail: No space left on device` |

---

### 2. `batch_create_thumbnails` (Optional - P2要件)

**説明**: 複数の画像のサムネイルを並列生成する（初回ロード時の最適化）。

#### シグネチャ (Rust)

```rust
#[command]
async fn batch_create_thumbnails(
    app_handle: AppHandle,
    image_paths: Vec<String>,
) -> Result<HashMap<String, String>, String>
```

#### 引数

| パラメータ | 型 | 必須 | 説明 | 例 |
|----------|-------|------|------|-----|
| `app_handle` | `AppHandle` | ✅ | Tauri アプリハンドル | - |
| `image_paths` | `Vec<String>` | ✅ | 元画像パスのリスト | `["/path/img1.jpg", "/path/img2.jpg"]` |

#### 戻り値

- **Success**: 元画像パス → サムネイルパスのマップ
  ```json
  {
    "/path/img1.jpg": "/cache/.../hash1.jpg",
    "/path/img2.jpg": "/cache/.../hash2.jpg"
  }
  ```

- **Error**: エラーメッセージ

#### TypeScript 呼び出し例

```typescript
const thumbnails = await invoke<Record<string, string>>('batch_create_thumbnails', {
  imagePaths: ['/path/img1.jpg', '/path/img2.jpg'],
});
```

---

### 3. `clear_thumbnail_cache`

**説明**: サムネイルキャッシュを全削除する（開発/デバッグ用）。

#### シグネチャ (Rust)

```rust
#[command]
async fn clear_thumbnail_cache(
    app_handle: AppHandle,
) -> Result<(), String>
```

#### 戻り値

- **Success**: `null`
- **Error**: エラーメッセージ

#### TypeScript 呼び出し例

```typescript
await invoke('clear_thumbnail_cache');
console.log('Cache cleared');
```

---

## TypeScript インターフェース

### 1. useThumbnail フック（既存を拡張）

**場所**: `src/features/folder-navigation/hooks/useThumbnail.ts`

#### 既存の実装

```typescript
import useSWR from 'swr';
import type { Thumbnail } from '../types/folderTypes';

export function useThumbnail(
  imagePath: string | null,
): {
  thumbnail: Thumbnail | null;
  isLoading: boolean;
  error: Error | null;
} {
  // 既存のロジック...
}
```

#### 拡張後の実装

```typescript
import { invoke } from '@tauri-apps/api/core';
import useSWR from 'swr';
import type { Thumbnail } from '../types/folderTypes';

// Tauri コマンドを呼び出してサムネイルパスを取得
async function fetchThumbnail(imagePath: string): Promise<Thumbnail> {
  const cachePath = await invoke<string>('get_or_create_thumbnail', {
    imagePath,
  });
  
  return {
    assetUrl: `asset://localhost/${cachePath}`,
    width: 200,
    height: 200,
  };
}

export function useThumbnail(
  imagePath: string | null,
): {
  thumbnail: Thumbnail | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, error, isLoading } = useSWR(
    imagePath ? ['thumbnail', imagePath] : null,
    () => fetchThumbnail(imagePath!),
    {
      revalidateOnFocus: false, // キャッシュは永続的
      dedupingInterval: 60000,  // 1分間は重複リクエストを防ぐ
    },
  );
  
  return {
    thumbnail: data ?? null,
    isLoading,
    error: error ?? null,
  };
}
```

#### 型定義の更新

**場所**: `src/features/folder-navigation/types/folderTypes.ts`

```typescript
export interface Thumbnail {
  assetUrl: string;   // asset:// プロトコルのURL
  width: number;      // 200
  height: number;     // 200
}
```

---

### 2. FileSystemService インターフェース拡張

**場所**: `src/shared/context/ServiceContext.tsx`

#### 既存のインターフェース

```typescript
export interface FileSystemService {
  selectFolder(): Promise<string | null>;
  listImages(folderPath: string): Promise<string[]>;
  // ... 他のメソッド
}
```

#### 拡張後のインターフェース

```typescript
export interface FileSystemService {
  selectFolder(): Promise<string | null>;
  listImages(folderPath: string): Promise<string[]>;
  
  // 新規追加
  getOrCreateThumbnail(imagePath: string): Promise<string>;
  batchCreateThumbnails(imagePaths: string[]): Promise<Record<string, string>>;
  clearThumbnailCache(): Promise<void>;
}
```

---

### 3. Tauri アダプター実装

**場所**: `src/shared/adapters/tauriAdapters.ts`

```typescript
import { invoke } from '@tauri-apps/api/core';
import type { FileSystemService } from '../context/ServiceContext';

export const createTauriFileSystemService = (): FileSystemService => ({
  // 既存のメソッド...
  selectFolder: async () => { /* ... */ },
  listImages: async (folderPath: string) => { /* ... */ },
  
  // 新規追加
  getOrCreateThumbnail: async (imagePath: string): Promise<string> => {
    return await invoke<string>('get_or_create_thumbnail', { imagePath });
  },
  
  batchCreateThumbnails: async (imagePaths: string[]): Promise<Record<string, string>> => {
    return await invoke<Record<string, string>>('batch_create_thumbnails', { imagePaths });
  },
  
  clearThumbnailCache: async (): Promise<void> => {
    await invoke('clear_thumbnail_cache');
  },
});
```

---

### 4. テストモック

**場所**: `src/test/mocks.ts`

```typescript
import type { FileSystemService } from '@/shared/context/ServiceContext';

export const createMockFileSystemService = (): FileSystemService => ({
  // 既存のモック...
  selectFolder: async () => '/mock/folder',
  listImages: async () => ['/mock/img1.jpg', '/mock/img2.jpg'],
  
  // 新規追加
  getOrCreateThumbnail: async (imagePath: string) => {
    // BLAKE3ハッシュのモック（実際は64文字）
    const mockHash = 'a7f5c9d2e8b4f3a1c6e9d8b7a5f4c3d2e1b9a8c7f6e5d4c3b2a1f9e8d7c6b5a4';
    return `/mock/cache/${mockHash}.jpg`;
  },
  
  batchCreateThumbnails: async (imagePaths: string[]) => {
    const result: Record<string, string> = {};
    for (const path of imagePaths) {
      result[path] = await createMockFileSystemService().getOrCreateThumbnail(path);
    }
    return result;
  },
  
  clearThumbnailCache: async () => {
    console.log('[MOCK] Thumbnail cache cleared');
  },
});
```

---

## Rust 型定義

### 1. ThumbnailError (カスタムエラー型)

**場所**: `src-tauri/core_logic/src/thumbnail.rs`

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ThumbnailError {
    #[error("Failed to read image file: {0}")]
    ImageReadError(#[from] std::io::Error),
    
    #[error("Failed to decode image: {0}")]
    ImageDecodeError(#[from] image::ImageError),
    
    #[error("Unsupported image format: {0}")]
    UnsupportedFormat(String),
    
    #[error("Failed to create cache directory: {0}")]
    CacheDirectoryError(String),
    
    #[error("Failed to write thumbnail: {0}")]
    CacheWriteError(String),
    
    #[error("Failed to get cache directory path")]
    PathError,
}
```

---

### 2. ThumbnailConfig (設定)

**場所**: `src-tauri/core_logic/src/thumbnail.rs`

```rust
#[derive(Debug, Clone)]
pub struct ThumbnailConfig {
    pub target_width: u32,
    pub target_height: u32,
    pub quality: u8,
    pub cache_max_size_bytes: u64,
    pub num_threads: usize,
}

impl Default for ThumbnailConfig {
    fn default() -> Self {
        Self {
            target_width: 200,
            target_height: 200,
            quality: 60,
            cache_max_size_bytes: 1_073_741_824, // 1GB
            num_threads: num_cpus::get().clamp(2, 8),
        }
    }
}
```

---

### 3. ThumbnailGenerator (サムネイル生成器)

**場所**: `src-tauri/core_logic/src/thumbnail.rs`

```rust
use image::{ImageFormat, ImageReader, imageops::FilterType};
use std::path::{Path, PathBuf};
use std::io::Cursor;

pub struct ThumbnailGenerator {
    config: ThumbnailConfig,
}

impl ThumbnailGenerator {
    pub fn new(config: ThumbnailConfig) -> Self {
        Self { config }
    }
    
    /// 画像をサムネイルに変換
    pub fn generate(
        &self,
        source_path: &Path,
    ) -> Result<Vec<u8>, ThumbnailError> {
        // 画像をデコード
        let img = ImageReader::open(source_path)?
            .decode()?;
        
        // リサイズ（Lanczos3フィルター）
        let thumbnail = img.resize(
            self.config.target_width,
            self.config.target_height,
            FilterType::Lanczos3,
        );
        
        // JPEGエンコード
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        thumbnail.write_to(&mut cursor, ImageFormat::Jpeg)?;
        
        Ok(buffer)
    }
}
```

---

## エラーハンドリング

### Rust 側のエラー処理

```rust
use tauri::command;

#[command]
async fn get_or_create_thumbnail(
    app_handle: AppHandle,
    image_path: String,
) -> Result<String, String> {
    // エラーを String に変換して返す
    match internal_get_or_create_thumbnail(&app_handle, &image_path).await {
        Ok(path) => Ok(path),
        Err(e) => Err(e.to_string()),
    }
}

async fn internal_get_or_create_thumbnail(
    app_handle: &AppHandle,
    image_path: &str,
) -> Result<String, ThumbnailError> {
    // 実際の処理...
    Ok(cache_path.to_string_lossy().to_string())
}
```

### TypeScript 側のエラー処理

```typescript
import { invoke } from '@tauri-apps/api/core';

export async function getThumbnail(imagePath: string): Promise<string> {
  try {
    return await invoke<string>('get_or_create_thumbnail', { imagePath });
  } catch (error) {
    console.error(`Failed to get thumbnail for ${imagePath}:`, error);
    
    // フォールバック: デフォルトアイコンを返す
    return '/assets/default-thumbnail.svg';
  }
}
```

---

## FileSystemService 拡張

### インターフェース定義

```typescript
// src/shared/context/ServiceContext.tsx
export interface FileSystemService {
  // 既存メソッド
  selectFolder(): Promise<string | null>;
  listImages(folderPath: string): Promise<string[]>;
  readFile(filePath: string): Promise<Uint8Array>;
  
  // サムネイル関連（新規追加）
  getOrCreateThumbnail(imagePath: string): Promise<string>;
  batchCreateThumbnails(imagePaths: string[]): Promise<Record<string, string>>;
  clearThumbnailCache(): Promise<void>;
}
```

### コンテキストプロバイダー

```typescript
// src/shared/context/ServiceContext.tsx
import { createContext, useContext, type ReactNode } from 'react';

const ServiceContext = createContext<FileSystemService | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: FileSystemService;
  children: ReactNode;
}) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): FileSystemService {
  const services = useContext(ServiceContext);
  if (!services) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return services;
}
```

---

## まとめ

### 新規追加されるTauriコマンド

| コマンド | 用途 | 優先度 |
|---------|------|--------|
| `get_or_create_thumbnail` | 単一サムネイル取得/生成 | P1 (必須) |
| `batch_create_thumbnails` | 複数サムネイル並列生成 | P2 (推奨) |
| `clear_thumbnail_cache` | キャッシュクリア | P3 (デバッグ用) |

### 型安全性の保証

- Rust側: `ThumbnailError`でカスタムエラー型を定義
- TypeScript側: `invoke<T>`でジェネリクスを使用した型安全な呼び出し
- インターフェース: `FileSystemService`で抽象化し、実装とテストモックを分離

### 次のステップ

- Phase 1: quickstart.md で開発環境のセットアップ手順を記述
- Phase 1: エージェントコンテキストを更新（`update-agent-context.sh`実行）
- Phase 2: tasks.md でタスク分解と実装順序を定義

---

**作成日**: 2026-01-05  
**レビュー者**: GitHub Copilot  
**承認状態**: 承認済み
