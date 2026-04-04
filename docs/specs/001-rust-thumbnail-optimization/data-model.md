# Data Model: Rust Backend Thumbnail Optimization

**Feature**: 001-rust-thumbnail-optimization  
**Date**: 2026-01-05  
**Status**: Draft

このドキュメントは、サムネイル最適化機能のデータモデル、エンティティ、状態遷移を定義します。

---

## エンティティ概要

```
┌─────────────────┐
│  ImageFile      │
│  (元画像)       │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Thumbnail      │◄─────┤ ThumbnailCache  │
│  (サムネイル)   │ 管理 │  (キャッシュ)   │
└─────────────────┘      └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ GenerationTask  │
│ (生成タスク)    │
└─────────────────┘
```

---

## 1. ImageFile (元画像)

### 説明
ユーザーがフォルダ内に保存している元画像ファイル。サムネイル生成のソースとなる。

### フィールド

| フィールド名 | 型 | 必須 | 説明 | バリデーション |
|------------|-------|------|------|---------------|
| `path` | `PathBuf` | ✅ | 画像ファイルの絶対パス | 存在チェック、読み取り権限 |
| `file_size` | `u64` | ✅ | ファイルサイズ（バイト） | > 0 |
| `modified_time` | `SystemTime` | ✅ | 最終更新日時 | キャッシュ無効化判定に使用 |
| `format` | `ImageFormat` | ✅ | 画像フォーマット | JPEG/PNG/WebP のみ |

### バリデーションルール

- **FR-005対応**: ファイルが存在しない、または読み取り不可の場合はエラーハンドリング
- **フォーマット判定**: 拡張子ではなく、`image`クレートの自動判定を使用
- **サイズ制限**: 極端に大きなファイル（>100MB）は警告ログを出力（処理は継続）

### Rust実装例

```rust
use std::path::PathBuf;
use std::time::SystemTime;
use image::ImageFormat;

#[derive(Debug, Clone)]
pub struct ImageFile {
    pub path: PathBuf,
    pub file_size: u64,
    pub modified_time: SystemTime,
    pub format: Option<ImageFormat>,
}

impl ImageFile {
    /// ファイルシステムから ImageFile を構築
    pub fn from_path(path: PathBuf) -> Result<Self, ThumbnailError> {
        let metadata = std::fs::metadata(&path)?;
        
        Ok(Self {
            path,
            file_size: metadata.len(),
            modified_time: metadata.modified()?,
            format: None, // 遅延判定（必要時にデコードして判定）
        })
    }
    
    /// サポートされているフォーマットかチェック
    pub fn is_supported(&self) -> bool {
        matches!(
            self.path.extension().and_then(|s| s.to_str()),
            Some("jpg" | "jpeg" | "png" | "webp")
        )
    }
}
```

---

## 2. Thumbnail (サムネイル)

### 説明
元画像から生成された200×200pxのリサイズ画像。ディスクキャッシュに永続化され、フロントエンドに提供される。

### フィールド

| フィールド名 | 型 | 必須 | 説明 | 制約 |
|------------|-------|------|------|------|
| `id` | `String` | ✅ | BLAKE3ハッシュ（元画像パスから生成） | 64文字の16進数 |
| `source_path` | `PathBuf` | ✅ | 元画像の絶対パス | ImageFile.path と一致 |
| `cache_path` | `PathBuf` | ✅ | キャッシュファイルの絶対パス | `{cache_dir}/{id}.jpg` |
| `width` | `u32` | ✅ | サムネイル幅 | 固定: 200 |
| `height` | `u32` | ✅ | サムネイル高さ | 固定: 200 |
| `file_size` | `u64` | ✅ | サムネイルのファイルサイズ | 5-15KB想定 |
| `created_at` | `SystemTime` | ✅ | サムネイル生成日時 | キャッシュ管理に使用 |
| `source_modified_at` | `SystemTime` | ✅ | 元画像の最終更新日時（スナップショット） | キャッシュ有効性判定 |

### バリデーションルール

- **FR-003対応**: `source_modified_at`が元画像の現在の更新日時と異なる場合、キャッシュ無効
- **FR-006対応**: `id`はBLAKE3ハッシュで一意性保証
- **サイズ検証**: 生成されたサムネイルが200×200pxであることを確認

### Rust実装例

```rust
use std::path::PathBuf;
use std::time::SystemTime;
use blake3;

#[derive(Debug, Clone)]
pub struct Thumbnail {
    pub id: String,
    pub source_path: PathBuf,
    pub cache_path: PathBuf,
    pub width: u32,
    pub height: u32,
    pub file_size: u64,
    pub created_at: SystemTime,
    pub source_modified_at: SystemTime,
}

impl Thumbnail {
    /// 元画像パスからサムネイルIDを生成
    pub fn generate_id(source_path: &PathBuf) -> String {
        let path_str = source_path.to_string_lossy();
        let hash = blake3::hash(path_str.as_bytes());
        hash.to_hex().to_string()
    }
    
    /// キャッシュパスを構築
    pub fn build_cache_path(cache_dir: &PathBuf, id: &str) -> PathBuf {
        cache_dir.join(format!("{}.jpg", id))
    }
    
    /// キャッシュが有効か（元画像が変更されていないか）チェック
    pub fn is_valid(&self, current_modified_time: SystemTime) -> bool {
        self.source_modified_at == current_modified_time
    }
}
```

---

## 3. ThumbnailCache (キャッシュ管理)

### 説明
サムネイルファイルをディスク上で管理するキャッシュ機構。キャッシュの有効性チェック、容量管理、古いキャッシュの削除を担当。

### フィールド

| フィールド名 | 型 | 必須 | 説明 | デフォルト値 |
|------------|-------|------|------|-------------|
| `cache_dir` | `PathBuf` | ✅ | キャッシュディレクトリのパス | `$APPCACHE/sun-riseup-viewrrr/thumbnails/` |
| `max_size_bytes` | `u64` | ✅ | キャッシュの最大容量 | 1GB (1_073_741_824) |
| `current_size_bytes` | `u64` | ✅ | 現在のキャッシュ使用量 | 起動時に計算 |
| `entries` | `HashMap<String, Thumbnail>` | ✅ | キャッシュエントリのマップ | キー: サムネイルID |

### 主要メソッド

| メソッド名 | 引数 | 戻り値 | 説明 |
|-----------|------|--------|------|
| `get` | `source_path: &PathBuf` | `Option<Thumbnail>` | キャッシュからサムネイルを取得（有効性チェック含む） |
| `put` | `thumbnail: Thumbnail` | `Result<(), Error>` | サムネイルをキャッシュに追加 |
| `evict_lru` | `required_space: u64` | `Result<(), Error>` | LRU方式で古いキャッシュを削除 |
| `clear` | - | `Result<(), Error>` | 全キャッシュを削除 |
| `calculate_size` | - | `u64` | 現在のキャッシュサイズを再計算 |

### バリデーションルール

- **FR-003対応**: `get`メソッドで元画像の更新日時をチェックし、変更があればキャッシュ無効
- **容量管理**: `max_size_bytes`を超える場合、LRU（Least Recently Used）方式で削除
- **ディレクトリ作成**: `cache_dir`が存在しない場合、自動的に作成

### Rust実装例

```rust
use std::collections::HashMap;
use std::path::PathBuf;

pub struct ThumbnailCache {
    pub cache_dir: PathBuf,
    pub max_size_bytes: u64,
    pub current_size_bytes: u64,
    entries: HashMap<String, Thumbnail>,
}

impl ThumbnailCache {
    /// キャッシュを初期化
    pub fn new(cache_dir: PathBuf, max_size_bytes: u64) -> Result<Self, ThumbnailError> {
        // ディレクトリが存在しない場合は作成
        std::fs::create_dir_all(&cache_dir)?;
        
        let mut cache = Self {
            cache_dir,
            max_size_bytes,
            current_size_bytes: 0,
            entries: HashMap::new(),
        };
        
        // 既存のキャッシュファイルを読み込み
        cache.load_existing_entries()?;
        Ok(cache)
    }
    
    /// 既存のキャッシュファイルを読み込み（起動時）
    fn load_existing_entries(&mut self) -> Result<(), ThumbnailError> {
        for entry in std::fs::read_dir(&self.cache_dir)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            
            if metadata.is_file() {
                self.current_size_bytes += metadata.len();
            }
        }
        Ok(())
    }
    
    /// キャッシュからサムネイルを取得（有効性チェック含む）
    pub fn get(&self, source_path: &PathBuf) -> Option<Thumbnail> {
        let id = Thumbnail::generate_id(source_path);
        let cache_path = Thumbnail::build_cache_path(&self.cache_dir, &id);
        
        // キャッシュファイルが存在するかチェック
        if !cache_path.exists() {
            return None;
        }
        
        // 元画像の更新日時をチェック
        let source_metadata = std::fs::metadata(source_path).ok()?;
        let source_modified = source_metadata.modified().ok()?;
        
        // キャッシュファイルのメタデータを取得
        let cache_metadata = std::fs::metadata(&cache_path).ok()?;
        let cache_created = cache_metadata.created().ok()?;
        
        // サムネイルオブジェクトを構築
        Some(Thumbnail {
            id,
            source_path: source_path.clone(),
            cache_path,
            width: 200,
            height: 200,
            file_size: cache_metadata.len(),
            created_at: cache_created,
            source_modified_at: source_modified,
        })
    }
    
    /// サムネイルをキャッシュに追加
    pub fn put(&mut self, thumbnail: Thumbnail) -> Result<(), ThumbnailError> {
        // 容量チェック（必要に応じてLRU削除）
        let required_space = thumbnail.file_size;
        if self.current_size_bytes + required_space > self.max_size_bytes {
            self.evict_lru(required_space)?;
        }
        
        // キャッシュに追加
        self.current_size_bytes += thumbnail.file_size;
        self.entries.insert(thumbnail.id.clone(), thumbnail);
        
        Ok(())
    }
    
    /// LRU方式で古いキャッシュを削除
    fn evict_lru(&mut self, required_space: u64) -> Result<(), ThumbnailError> {
        // エントリを created_at でソート（古い順）
        let mut sorted_entries: Vec<_> = self.entries.iter().collect();
        sorted_entries.sort_by_key(|(_, t)| t.created_at);
        
        let mut freed_space = 0u64;
        for (id, thumbnail) in sorted_entries {
            if freed_space >= required_space {
                break;
            }
            
            // ファイルを削除
            std::fs::remove_file(&thumbnail.cache_path)?;
            freed_space += thumbnail.file_size;
            
            // エントリから削除
            self.entries.remove(id);
        }
        
        self.current_size_bytes -= freed_space;
        Ok(())
    }
}
```

---

## 4. GenerationTask (生成タスク)

### 説明
サムネイル生成リクエストを表すタスクエンティティ。並列処理のキューに追加され、優先度に応じて処理される。

### フィールド

| フィールド名 | 型 | 必須 | 説明 | デフォルト値 |
|------------|-------|------|------|-------------|
| `id` | `Uuid` | ✅ | タスクの一意なID | 自動生成 |
| `source_path` | `PathBuf` | ✅ | 元画像のパス | - |
| `target_width` | `u32` | ✅ | ターゲット幅 | 200 |
| `target_height` | `u32` | ✅ | ターゲット高さ | 200 |
| `quality` | `u8` | ✅ | JPEG品質 | 60 |
| `priority` | `TaskPriority` | ✅ | タスクの優先度 | `Normal` |
| `status` | `TaskStatus` | ✅ | タスクの状態 | `Pending` |
| `created_at` | `Instant` | ✅ | タスク作成日時 | 生成時 |
| `completed_at` | `Option<Instant>` | ❌ | タスク完了日時 | `None` |

### 列挙型: TaskPriority

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum TaskPriority {
    Low = 0,       // バックグラウンド生成
    Normal = 1,    // 通常の生成（デフォルト）
    High = 2,      // 可視領域の優先生成
}
```

### 列挙型: TaskStatus

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskStatus {
    Pending,      // キューに追加済み、処理待ち
    Processing,   // 現在処理中
    Completed,    // 正常完了
    Failed,       // エラーで失敗
    Cancelled,    // キャンセルされた（ユーザーがディレクトリ移動した場合など）
}
```

### バリデーションルール

- **FR-004対応**: 優先度に応じてタスクをスケジュール
- **FR-008対応**: 状態遷移をフロントエンドに通知
- **タイムアウト**: 処理中のタスクが30秒以上かかる場合、`Failed`に遷移

### Rust実装例

```rust
use uuid::Uuid;
use std::time::Instant;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct GenerationTask {
    pub id: Uuid,
    pub source_path: PathBuf,
    pub target_width: u32,
    pub target_height: u32,
    pub quality: u8,
    pub priority: TaskPriority,
    pub status: TaskStatus,
    pub created_at: Instant,
    pub completed_at: Option<Instant>,
}

impl GenerationTask {
    /// 新しいタスクを作成
    pub fn new(
        source_path: PathBuf,
        priority: TaskPriority,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            source_path,
            target_width: 200,
            target_height: 200,
            quality: 60,
            priority,
            status: TaskStatus::Pending,
            created_at: Instant::now(),
            completed_at: None,
        }
    }
    
    /// タスクを完了状態に遷移
    pub fn complete(&mut self) {
        self.status = TaskStatus::Completed;
        self.completed_at = Some(Instant::now());
    }
    
    /// タスクを失敗状態に遷移
    pub fn fail(&mut self) {
        self.status = TaskStatus::Failed;
        self.completed_at = Some(Instant::now());
    }
    
    /// 処理時間を取得（デバッグ用）
    pub fn elapsed_time(&self) -> Option<std::time::Duration> {
        self.completed_at.map(|end| end - self.created_at)
    }
}
```

---

## 状態遷移図

### GenerationTask のライフサイクル

```
┌─────────┐
│ Pending │ (キュー追加)
└────┬────┘
     │
     ▼
┌─────────────┐
│ Processing  │ (rayon で処理開始)
└────┬────────┘
     │
     ├──► ┌───────────┐
     │    │ Completed │ (成功)
     │    └───────────┘
     │
     ├──► ┌─────────┐
     │    │ Failed  │ (エラー)
     │    └─────────┘
     │
     └──► ┌───────────┐
          │ Cancelled │ (キャンセル)
          └───────────┘
```

### Thumbnail のライフサイクル

```
┌──────────────┐
│ Not Exists   │ (キャッシュ未生成)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Generating   │ (GenerationTask.Processing)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Cached       │ (ThumbnailCache.entries に存在)
└──────┬───────┘
       │
       ├──► ┌──────────────┐
       │    │ Valid        │ (source_modified_at が一致)
       │    └──────────────┘
       │
       └──► ┌──────────────┐
            │ Stale        │ (source_modified_at が不一致)
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ Regenerating │ (新しいGenerationTask作成)
            └──────────────┘
```

---

## データフロー

### フロントエンドからのリクエスト

```
1. Frontend (useThumbnail hook)
   └──► invoke('get_or_create_thumbnail', { imagePath })
        │
        ▼
2. Tauri Command (get_or_create_thumbnail)
   └──► ThumbnailCache.get(imagePath)
        │
        ├──► Cache Hit (有効)
        │    └──► return cache_path
        │
        └──► Cache Miss or Stale
             └──► GenerationTask.new(imagePath, High)
                  └──► TaskQueue.push(task)
                       └──► rayon: parallel processing
                            └──► Thumbnail.generate()
                                 └──► ThumbnailCache.put(thumbnail)
                                      └──► return cache_path
```

### キャッシュ容量管理

```
1. ThumbnailCache.put(thumbnail)
   └──► Check: current_size + thumbnail.file_size > max_size?
        │
        ├──► No: 追加
        │
        └──► Yes: Eviction required
             └──► Sort entries by created_at (ascending)
                  └──► Delete oldest entries until space available
                       └──► Update current_size
                            └──► 追加
```

---

## 永続化戦略

### ディスクキャッシュ

- **場所**: `$APPCACHE/sun-riseup-viewrrr/thumbnails/`
- **ファイル名**: `{BLAKE3_HASH}.jpg`
- **構造**:
  ```
  thumbnails/
  ├── a7f5c9d2e8b4f3a1c6e9d8b7a5f4c3d2e1b9a8c7f6e5d4c3b2a1f9e8d7c6b5a4.jpg
  ├── b8e6d3c4f5a2b9e7c8d6f5a4b3c2d1e0f9a8b7c6d5e4c3b2a1f0e9d8c7b6a5.jpg
  └── ...
  ```

### メタデータ永続化（将来的な拡張）

現在のバージョンでは、メタデータはファイルシステムのメタデータ（更新日時、ファイルサイズ）から推測。将来的には以下のオプションを検討：

- **SQLite**: キャッシュエントリのメタデータを構造化して保存
- **JSON/TOML**: 軽量なメタデータファイル（`thumbnails/metadata.json`）
- **利点**: キャッシュヒット率の統計、最終アクセス日時の記録

---

## パフォーマンス最適化

### メモリ使用量の最適化

| 項目 | サイズ | 備考 |
|------|--------|------|
| 元画像デコード | 48MB | 4000×3000px × 4バイト (RGBA) |
| サムネイル | 160KB | 200×200px × 4バイト (RGBA) |
| JPEG エンコード後 | 5-10KB | 品質60、ディスク保存 |

**戦略**: デコード→リサイズ→エンコードを一連の処理で実行し、中間バッファを早期解放。

### 並列処理の効率化

- **スレッド数**: `min(max(2, num_cpus), 8)`
- **バッチサイズ**: 10-20枚を1バッチとして処理
- **メモリ制限**: 同時に処理する画像数を制限し、メモリ枯渇を防ぐ

---

## まとめ

### エンティティ一覧

| エンティティ | 責務 | 永続化 |
|------------|------|--------|
| **ImageFile** | 元画像の情報を保持 | なし（ファイルシステム） |
| **Thumbnail** | サムネイル画像のメタデータ | キャッシュファイル（JPEG） |
| **ThumbnailCache** | キャッシュの管理・LRU削除 | ディスクキャッシュ |
| **GenerationTask** | サムネイル生成タスクの管理 | なし（メモリ内） |

### 次のステップ

- Phase 1: contracts/ でTauriコマンドとTypeScriptインターフェースを定義
- Phase 1: quickstart.md で開発者向けセットアップ手順を記述
- Phase 1: エージェントコンテキスト更新スクリプトを実行

---

**作成日**: 2026-01-05  
**レビュー者**: GitHub Copilot  
**承認状態**: 承認済み
