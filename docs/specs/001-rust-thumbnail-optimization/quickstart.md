# Quickstart: Rust Backend Thumbnail Optimization

**Feature**: 001-rust-thumbnail-optimization  
**Date**: 2026-01-05  
**Status**: Draft

このドキュメントは、開発者がRustバックエンドサムネイル最適化機能の開発を開始するための手順を提供します。

---

## 前提条件

### 必要な環境

- **Node.js**: 22.0.0以上
- **Rust**: 1.75以上
- **pnpm**: 最新版（`npm install -g pnpm`）
- **Tauri CLI**: 2.x（プロジェクトに含まれる）

### 推奨ツール

- **VS Code**: Rust Analyzer、Tauri拡張機能
- **Rust ツールチェーン**: rustfmt、clippy

---

## セットアップ手順

### 1. ブランチのチェックアウト

```bash
# メインブランチから最新を取得
git fetch origin

# 機能ブランチにチェックアウト
git checkout 001-rust-thumbnail-optimization

# 最新の変更を取得
git pull origin 001-rust-thumbnail-optimization
```

### 2. 依存関係のインストール

#### フロントエンド依存関係

```bash
# プロジェクトルートで実行
pnpm install
```

#### Rust依存関係（Cargo.toml に追加）

`src-tauri/core_logic/Cargo.toml` を編集:

```toml
[dependencies]
# 既存の依存関係...

# サムネイル生成用（新規追加）
image = "0.25"           # 画像処理
rayon = "1.11"           # 並列処理
num_cpus = "1.16"        # CPU数取得
blake3 = "1.8"           # ハッシュ生成
thiserror = "2.0"        # エラーハンドリング
```

依存関係をダウンロード:

```bash
cd src-tauri
cargo build
```

### 3. 開発サーバーの起動

```bash
# プロジェクトルートで実行
pnpm tauri dev
```

アプリケーションが起動し、ホットリロードが有効になります。

---

## プロジェクト構造

### 追加・変更されるファイル

```
src/                                    # フロントエンド
├── features/
│   └── folder-navigation/
│       ├── components/
│       │   ├── FolderView.tsx         # [MODIFY] サムネイル表示更新
│       │   └── Sidebar.tsx            # [MODIFY] 最適化切り替え
│       ├── hooks/
│       │   └── useThumbnail.ts        # [MODIFY] Tauriコマンド呼び出し
│       └── types/
│           └── folderTypes.ts         # [MODIFY] 型定義追加
├── shared/
│   ├── adapters/
│   │   └── tauriAdapters.ts           # [MODIFY] FileSystemService拡張
│   └── context/
│       └── ServiceContext.tsx         # [MODIFY] サービスIF拡張
└── test/
    └── mocks.ts                        # [MODIFY] モックサービス追加

src-tauri/                              # バックエンド
├── src/
│   ├── commands/
│   │   └── fs.rs                      # [MODIFY] 新コマンド追加
│   └── lib.rs                         # [MODIFY] コマンド登録
└── core_logic/
    ├── Cargo.toml                     # [MODIFY] 依存追加
    └── src/
        └── thumbnail.rs               # [NEW] サムネイル生成ロジック

specs/001-rust-thumbnail-optimization/  # 仕様書
├── spec.md                            # 機能仕様
├── plan.md                            # 実装計画
├── research.md                        # 技術調査
├── data-model.md                      # データモデル
├── contracts/
│   └── typescript-api-contracts.md    # API契約
└── quickstart.md                      # このファイル
```

---

## 開発ワークフロー

### ステップ1: Rustバックエンドの実装

#### 1.1. サムネイル生成ロジック

新規ファイル: `src-tauri/core_logic/src/thumbnail.rs`

```rust
use image::{ImageFormat, ImageReader, imageops::FilterType};
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ThumbnailError {
    #[error("Failed to read image: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("Failed to decode image: {0}")]
    ImageError(#[from] image::ImageError),
}

pub fn generate_thumbnail(
    source_path: &Path,
    target_width: u32,
    target_height: u32,
) -> Result<Vec<u8>, ThumbnailError> {
    // 画像をデコード
    let img = ImageReader::open(source_path)?.decode()?;
    
    // リサイズ（Lanczos3）
    let thumbnail = img.resize(target_width, target_height, FilterType::Lanczos3);
    
    // JPEGエンコード
    let mut buffer = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut buffer);
    thumbnail.write_to(&mut cursor, ImageFormat::Jpeg)?;
    
    Ok(buffer)
}

pub fn hash_path(path: &Path) -> String {
    let path_str = path.to_string_lossy();
    let hash = blake3::hash(path_str.as_bytes());
    hash.to_hex().to_string()
}
```

`src-tauri/core_logic/src/lib.rs` に追加:

```rust
pub mod thumbnail;
```

#### 1.2. Tauriコマンドの追加

`src-tauri/src/commands/fs.rs` に追加:

```rust
use tauri::{command, AppHandle, Manager};
use std::path::PathBuf;

#[command]
pub async fn get_or_create_thumbnail(
    app_handle: AppHandle,
    image_path: String,
) -> Result<String, String> {
    // キャッシュディレクトリを取得
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("sun-riseup-viewrrr")
        .join("thumbnails");
    
    // ディレクトリが存在しない場合は作成
    std::fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    
    // キャッシュファイルパスを構築
    let source_path = PathBuf::from(&image_path);
    let hash = core_logic::thumbnail::hash_path(&source_path);
    let cache_path = cache_dir.join(format!("{}.jpg", hash));
    
    // キャッシュが存在する場合はそのまま返す
    if cache_path.exists() {
        // 元画像の更新日時をチェック
        let source_metadata = std::fs::metadata(&source_path).map_err(|e| e.to_string())?;
        let cache_metadata = std::fs::metadata(&cache_path).map_err(|e| e.to_string())?;
        
        if source_metadata.modified().ok() == cache_metadata.created().ok() {
            return Ok(cache_path.to_string_lossy().to_string());
        }
    }
    
    // サムネイルを生成
    let thumbnail_data = tokio::task::spawn_blocking(move || {
        core_logic::thumbnail::generate_thumbnail(&source_path, 200, 200)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;
    
    // キャッシュに保存
    std::fs::write(&cache_path, thumbnail_data).map_err(|e| e.to_string())?;
    
    Ok(cache_path.to_string_lossy().to_string())
}
```

#### 1.3. コマンドの登録

`src-tauri/src/lib.rs` に追加:

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // 既存のコマンド...
            commands::fs::get_or_create_thumbnail,  // 新規追加
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### ステップ2: TypeScriptフロントエンドの実装

#### 2.1. FileSystemServiceの拡張

`src/shared/context/ServiceContext.tsx`:

```typescript
export interface FileSystemService {
  // 既存メソッド...
  selectFolder(): Promise<string | null>;
  listImages(folderPath: string): Promise<string[]>;
  
  // 新規追加
  getOrCreateThumbnail(imagePath: string): Promise<string>;
}
```

#### 2.2. Tauriアダプターの実装

`src/shared/adapters/tauriAdapters.ts`:

```typescript
import { invoke } from '@tauri-apps/api/core';

export const createTauriFileSystemService = (): FileSystemService => ({
  // 既存メソッド...
  
  getOrCreateThumbnail: async (imagePath: string): Promise<string> => {
    return await invoke<string>('get_or_create_thumbnail', { imagePath });
  },
});
```

#### 2.3. useThumbnailフックの更新

`src/features/folder-navigation/hooks/useThumbnail.ts`:

```typescript
import { invoke } from '@tauri-apps/api/core';
import useSWR from 'swr';
import type { Thumbnail } from '../types/folderTypes';

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

export function useThumbnail(imagePath: string | null) {
  const { data, error, isLoading } = useSWR(
    imagePath ? ['thumbnail', imagePath] : null,
    () => fetchThumbnail(imagePath!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );
  
  return {
    thumbnail: data ?? null,
    isLoading,
    error: error ?? null,
  };
}
```

---

## テストの実行

### Rustテスト

```bash
cd src-tauri
cargo test
```

### TypeScriptテスト

```bash
# プロジェクトルートで実行
pnpm test
```

### 統合テスト（Tauriアプリ起動）

```bash
pnpm tauri dev
```

---

## デバッグ方法

### Rustデバッグ

#### ログ出力

```rust
#[command]
pub async fn get_or_create_thumbnail(
    app_handle: AppHandle,
    image_path: String,
) -> Result<String, String> {
    println!("Generating thumbnail for: {}", image_path);
    // ...処理
}
```

ターミナルに出力されます。

#### デバッガー（VS Code）

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=./src-tauri/Cargo.toml",
          "--no-default-features"
        ]
      },
      "preLaunchTask": "tauri dev"
    }
  ]
}
```

### TypeScriptデバッグ

ブラウザの開発者ツールを使用（Tauri devモードで `Ctrl+Shift+I` / `Cmd+Option+I`）:

```typescript
console.log('Fetching thumbnail:', imagePath);
const thumbnailPath = await invoke('get_or_create_thumbnail', { imagePath });
console.log('Thumbnail path:', thumbnailPath);
```

---

## ビルド

### 開発ビルド

```bash
pnpm tauri build --debug
```

### 本番ビルド

```bash
# 型チェック
pnpm type-check

# Lint
pnpm lint

# テスト
pnpm test

# ビルド
pnpm tauri build
```

成果物: `src-tauri/target/release/bundle/`

---

## トラブルシューティング

### 問題1: Cargoビルドエラー

**症状**: `cargo build` が失敗する

**解決策**:
```bash
# キャッシュクリア
cd src-tauri
cargo clean

# 再ビルド
cargo build
```

### 問題2: サムネイルが生成されない

**症状**: `get_or_create_thumbnail` が失敗する

**デバッグ手順**:
1. 元画像ファイルが存在するか確認
2. キャッシュディレクトリに書き込み権限があるか確認
3. Rustログを確認（`println!` 出力）

```bash
# キャッシュディレクトリを手動確認
ls -la ~/.cache/sun-riseup-viewrrr/thumbnails/  # Linux
ls -la ~/Library/Caches/com.sun-riseup-viewrrr.app/thumbnails/  # macOS
```

### 問題3: TypeScriptの型エラー

**症状**: `FileSystemService` の型が不一致

**解決策**:
```bash
# 型チェックを実行
pnpm type-check

# VS Codeを再起動してTypeScriptサーバーをリセット
```

---

## パフォーマンス測定

### サムネイル生成時間の計測

Rust側:

```rust
use std::time::Instant;

#[command]
pub async fn get_or_create_thumbnail(
    app_handle: AppHandle,
    image_path: String,
) -> Result<String, String> {
    let start = Instant::now();
    
    // 処理...
    
    let duration = start.elapsed();
    println!("Thumbnail generation took: {:?}", duration);
    
    Ok(cache_path)
}
```

### スクロール性能の計測

TypeScript側:

```typescript
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(measureFPS);
}

measureFPS();
```

---

## 次のステップ

1. **実装**: [contracts/typescript-api-contracts.md](./contracts/typescript-api-contracts.md) に従ってコードを実装
2. **テスト**: 各コンポーネントの単体テスト・統合テストを追加
3. **ベンチマーク**: 既存のフロントエンド最適化と性能比較
4. **ドキュメント**: 実装中に気づいた点を `tasks.md` に記録

---

## 参考資料

- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Rust `image` Crate](https://docs.rs/image/)
- [Rust `rayon` Crate](https://docs.rs/rayon/)
- [SWR Documentation](https://swr.vercel.app/)
- [プロジェクト憲章](/.specify/memory/constitution.md)

---

**作成日**: 2026-01-05  
**更新日**: 2026-01-05  
**著者**: GitHub Copilot  
**ステータス**: 承認済み
