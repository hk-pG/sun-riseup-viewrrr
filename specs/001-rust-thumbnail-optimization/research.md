# サムネイル生成機能 - 技術調査報告書

**作成日**: 2026年1月5日  
**調査対象**: Tauri 2.x + Rustプロジェクトにおけるサムネイル生成機能の実装

---

## 1. Rust `image` クレート

### Decision（決定事項）
- **バージョン**: `image = "0.25.9"` （最新安定版）
- **リサイズアルゴリズム**: `FilterType::Lanczos3` を推奨
- **JPEG品質**: 60-75の範囲で設定（品質60は妥当）
- **対応フォーマット**: JPEG、PNG、WebP（すべてデフォルトでサポート）

### Rationale（理由）
1. **バージョン選択**:
   - v0.25.9は2024年11月リリースで90M+ダウンロード実績
   - Rust 1.85.0に対応、安定したAPIを提供
   - デフォルト機能で主要フォーマットをサポート

2. **Lanczos3アルゴリズム**:
   - 高品質なダウンサンプリングに最適
   - 4000×3000px → 200×200pxのような大幅な縮小に適している
   - シャープネスと品質のバランスが良い
   - 計算コストは高いが、サムネイルは1回のみ生成されキャッシュされるため許容可能

3. **JPEG品質60**:
   - サムネイル用途では視覚的品質と圧縮率のバランスが良い
   - 200×200pxのサイズでは品質60でも十分な視認性
   - ファイルサイズを5-10KB程度に抑えられる

4. **対応フォーマット**:
   - JPEG: 最も一般的な画像フォーマット
   - PNG: 透過画像やスクリーンショットに対応
   - WebP: 現代的なフォーマット、JPEG/PNGより効率的

### Alternatives Considered（検討した代替案）

| アルゴリズム | 品質 | 速度 | 推奨用途 |
|------------|------|------|---------|
| **Lanczos3** ✅ | 最高 | 遅い | サムネイル生成（高品質重視） |
| CatmullRom | 高 | 中 | 一般的なリサイズ |
| Triangle | 中 | 速い | リアルタイムリサイズ |
| Nearest | 低 | 最速 | ピクセルアート |

- **CatmullRom**: Lanczos3より高速だが、品質がやや劣る
- **Triangle**: さらに高速だが、サムネイル品質が不十分
- **品質設定**: 品質80-90は視覚的改善が限定的でファイルサイズが2-3倍に増加

### Implementation Notes（実装上の注意点）

#### 基本的な実装パターン

```rust
use image::{imageops::FilterType, DynamicImage, ImageFormat};
use std::path::Path;

fn generate_thumbnail(
    input_path: &Path,
    output_path: &Path,
    size: u32,
    quality: u8,
) -> Result<(), Box<dyn std::error::Error>> {
    // 画像の読み込み（フォーマット自動判定）
    let img = image::open(input_path)?;
    
    // アスペクト比を維持してリサイズ
    let thumbnail = img.resize(size, size, FilterType::Lanczos3);
    
    // JPEG形式で保存（品質指定）
    let mut output_file = std::fs::File::create(output_path)?;
    thumbnail.write_to(
        &mut output_file,
        image::ImageFormat::Jpeg
    )?;
    
    // 品質指定が必要な場合は以下を使用
    // use image::codecs::jpeg::JpegEncoder;
    // let mut encoder = JpegEncoder::new_with_quality(&mut output_file, quality);
    // thumbnail.write_with_encoder(encoder)?;
    
    Ok(())
}
```

#### メモリ効率の良い実装

```rust
use image::{DynamicImage, ImageReader};
use std::io::Cursor;

fn generate_thumbnail_memory_efficient(
    input_path: &Path,
    size: u32,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // ImageReaderを使用して遅延読み込み
    let img = ImageReader::open(input_path)?
        .with_guessed_format()?
        .decode()?;
    
    // リサイズ
    let thumbnail = img.resize(size, size, FilterType::Lanczos3);
    
    // メモリバッファに書き込み
    let mut buffer = Vec::new();
    thumbnail.write_to(
        &mut Cursor::new(&mut buffer),
        ImageFormat::Jpeg
    )?;
    
    Ok(buffer)
}
```

#### エラーハンドリングのベストプラクティス

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ThumbnailError {
    #[error("画像ファイルの読み込みに失敗: {0}")]
    ImageLoadError(#[from] image::ImageError),
    
    #[error("サポートされていない画像フォーマット: {0}")]
    UnsupportedFormat(String),
    
    #[error("ファイルI/Oエラー: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("無効なパス: {0}")]
    InvalidPath(String),
}

fn generate_thumbnail_with_error_handling(
    input_path: &Path,
    output_path: &Path,
    size: u32,
) -> Result<(), ThumbnailError> {
    // 入力パスの検証
    if !input_path.exists() {
        return Err(ThumbnailError::InvalidPath(
            format!("ファイルが見つかりません: {:?}", input_path)
        ));
    }
    
    // 画像形式の確認
    let format = image::ImageFormat::from_path(input_path)
        .map_err(|_| ThumbnailError::UnsupportedFormat(
            input_path.extension()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string()
        ))?;
    
    // サムネイル生成
    let img = image::open(input_path)?;
    let thumbnail = img.resize(size, size, FilterType::Lanczos3);
    thumbnail.save(output_path)?;
    
    Ok(())
}
```

#### パフォーマンス最適化のヒント

1. **リリースビルドで実行**: デバッグビルドでは画像処理が非常に遅い
2. **一度にすべての画像を開かない**: メモリ使用量を抑えるため、1つずつ処理
3. **フォーマット検証**: 処理前にサポートされているフォーマットか確認
4. **出力ディレクトリの事前作成**: `std::fs::create_dir_all`を使用

---

## 2. `rayon` クレート（並列処理）

### Decision（決定事項）
- **バージョン**: `rayon = "1.11.0"` （最新安定版）
- **並列化手法**: `par_iter()` を使用した並列イテレータ
- **スレッドプール設定**: `ThreadPoolBuilder` でカスタム設定
- **推奨スレッド数**: `min(max(2, num_cpus), 8)` 

### Rationale（理由）
1. **バージョン選択**:
   - v1.11.0は2024年8月リリース、288M+ダウンロード
   - Rust 1.80+に対応、安定したAPI
   - データレース保証（コンパイル時に検証）

2. **並列イテレータ**:
   - 既存のイテレータコードを`.iter()`から`.par_iter()`に変更するだけ
   - ワークスチーリングにより自動的に負荷分散
   - CPUコア数に応じて自動スケーリング

3. **スレッドプール設定**:
   - デフォルト（グローバルプール）: 論理CPUコア数に等しいスレッド数
   - カスタムプール: 最小2、最大8スレッドで安定性とパフォーマンスのバランス
   - サムネイル生成は I/O バウンドと CPU バウンドが混在するため、適度な制限が有効

4. **UIスレッドへの影響**:
   - Tauriのメインスレッドとは独立して動作
   - バックグラウンド処理により UI がブロックされない
   - 進捗通知は別途イベントシステムで実装可能

### Alternatives Considered（検討した代替案）

| 手法 | メリット | デメリット | 推奨度 |
|------|---------|-----------|--------|
| **rayon par_iter** ✅ | 実装が簡単、自動負荷分散 | カスタマイズ性が低い | 高 |
| tokio async/await | 非同期I/O最適化 | 複雑な実装、CPU集約的タスクには不向き | 中 |
| std::thread | 完全な制御 | 手動でのスレッド管理が必要 | 低 |
| threadpool クレート | 軽量 | 低レベル、手動実装が必要 | 低 |

- **tokio**: 非同期I/Oには最適だが、サムネイル生成のようなCPU集約的タスクには不向き
- **std::thread**: 完全な制御が可能だが、ワークスチーリングやエラーハンドリングを自前実装する必要がある

### Implementation Notes（実装上の注意点）

#### 基本的な並列処理パターン

```rust
use rayon::prelude::*;
use std::path::{Path, PathBuf};

fn generate_thumbnails_parallel(
    image_paths: Vec<PathBuf>,
    output_dir: &Path,
    size: u32,
) -> Vec<Result<PathBuf, ThumbnailError>> {
    // 並列イテレータで各画像を処理
    image_paths
        .par_iter()
        .map(|input_path| {
            let output_path = output_dir.join(
                format!("thumb_{}", input_path.file_name().unwrap().to_string_lossy())
            );
            
            generate_thumbnail(input_path, &output_path, size, 60)?;
            Ok(output_path)
        })
        .collect()
}
```

#### カスタムスレッドプールの設定

```rust
use rayon::{ThreadPoolBuilder, ThreadPool};
use std::sync::Arc;

fn create_thumbnail_thread_pool() -> Result<ThreadPool, rayon::ThreadPoolBuildError> {
    let num_threads = calculate_optimal_thread_count();
    
    ThreadPoolBuilder::new()
        .num_threads(num_threads)
        .thread_name(|i| format!("thumbnail-worker-{}", i))
        .build()
}

fn calculate_optimal_thread_count() -> usize {
    let cpu_count = num_cpus::get();
    
    // 最小2、最大8スレッド
    cpu_count.max(2).min(8)
}

// カスタムプールを使用した処理
fn generate_with_custom_pool(
    image_paths: Vec<PathBuf>,
    output_dir: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let pool = create_thumbnail_thread_pool()?;
    
    pool.install(|| {
        image_paths
            .par_iter()
            .for_each(|input_path| {
                let output_path = output_dir.join(
                    format!("thumb_{}", input_path.file_name().unwrap().to_string_lossy())
                );
                
                if let Err(e) = generate_thumbnail(input_path, &output_path, 200, 60) {
                    eprintln!("サムネイル生成エラー: {:?}", e);
                }
            });
    });
    
    Ok(())
}
```

#### 進捗管理とキャンセル処理

```rust
use std::sync::atomic::{AtomicUsize, AtomicBool, Ordering};
use std::sync::Arc;

struct ThumbnailProgress {
    total: usize,
    completed: Arc<AtomicUsize>,
    cancelled: Arc<AtomicBool>,
}

impl ThumbnailProgress {
    fn new(total: usize) -> Self {
        Self {
            total,
            completed: Arc::new(AtomicUsize::new(0)),
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }
    
    fn increment(&self) -> usize {
        self.completed.fetch_add(1, Ordering::Relaxed)
    }
    
    fn cancel(&self) {
        self.cancelled.store(true, Ordering::Relaxed);
    }
    
    fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::Relaxed)
    }
    
    fn percentage(&self) -> f32 {
        let completed = self.completed.load(Ordering::Relaxed);
        (completed as f32 / self.total as f32) * 100.0
    }
}

fn generate_with_progress(
    image_paths: Vec<PathBuf>,
    output_dir: &Path,
    progress: Arc<ThumbnailProgress>,
) -> Vec<Result<PathBuf, ThumbnailError>> {
    image_paths
        .par_iter()
        .map(|input_path| {
            // キャンセルチェック
            if progress.is_cancelled() {
                return Err(ThumbnailError::Cancelled);
            }
            
            let output_path = output_dir.join(
                format!("thumb_{}", input_path.file_name().unwrap().to_string_lossy())
            );
            
            let result = generate_thumbnail(input_path, &output_path, 200, 60);
            
            // 進捗更新
            let completed = progress.increment();
            println!("進捗: {}/{} ({:.1}%)", 
                completed, 
                progress.total, 
                progress.percentage()
            );
            
            result?;
            Ok(output_path)
        })
        .collect()
}
```

#### エラー収集とレポート

```rust
use std::sync::Mutex;

fn generate_with_error_collection(
    image_paths: Vec<PathBuf>,
    output_dir: &Path,
) -> (Vec<PathBuf>, Vec<(PathBuf, ThumbnailError)>) {
    let successes = Arc::new(Mutex::new(Vec::new()));
    let errors = Arc::new(Mutex::new(Vec::new()));
    
    image_paths.par_iter().for_each(|input_path| {
        let output_path = output_dir.join(
            format!("thumb_{}", input_path.file_name().unwrap().to_string_lossy())
        );
        
        match generate_thumbnail(input_path, &output_path, 200, 60) {
            Ok(_) => {
                successes.lock().unwrap().push(output_path);
            }
            Err(e) => {
                errors.lock().unwrap().push((input_path.clone(), e));
            }
        }
    });
    
    let successes = Arc::try_unwrap(successes).unwrap().into_inner().unwrap();
    let errors = Arc::try_unwrap(errors).unwrap().into_inner().unwrap();
    
    (successes, errors)
}
```

#### 依存関係の追加

```toml
[dependencies]
rayon = "1.11.0"
num_cpus = "1.16"  # CPU数の取得用
```

---

## 3. ハッシュ生成（キャッシュファイル名）

### Decision（決定事項）
- **推奨ハッシュアルゴリズム**: `blake3`
- **バージョン**: `blake3 = "1.8.2"`
- **用途**: ファイルパスからキャッシュファイル名を生成

### Rationale（理由）
1. **BLAKE3の優位性**:
   - **速度**: SHA-256の約10倍、BLAKE2の2-3倍高速
   - **セキュリティ**: SHA-2/SHA-3と同等の暗号学的安全性
   - **並列性**: SIMD最適化により複数コアで並列処理可能
   - **シンプルなAPI**: ワンライナーでハッシュ生成可能

2. **キャッシュ用途に最適**:
   - 高速なハッシュ計算により起動時のオーバーヘッドを最小化
   - 256ビット出力で衝突リスクが極めて低い
   - ファイルパス程度の小さなデータには過剰な性能

3. **エコシステム**:
   - Cargo、Bazel、LLVMなど大規模プロジェクトで採用
   - 89M+ダウンロード、活発なメンテナンス

### Alternatives Considered（検討した代替案）

| アルゴリズム | 速度 | 出力長 | 衝突リスク | 推奨度 |
|------------|------|--------|-----------|--------|
| **BLAKE3** ✅ | 最速 | 256-bit | 極めて低い | 高 |
| SHA-256 | 遅い | 256-bit | 極めて低い | 中 |
| xxHash | 最速級 | 64-bit | 低い（非暗号） | 中 |
| MD5 | 速い | 128-bit | 高い（非推奨） | 低 |

- **SHA-256**: 広く使われているが、BLAKE3より10倍遅い。キャッシュ用途では過剰
- **xxHash**: 非常に高速だが、非暗号学的ハッシュ。64-bit出力は衝突リスクがやや高い
- **MD5**: 非推奨。衝突脆弱性が知られている

### Implementation Notes（実装上の注意点）

#### 基本的なハッシュ生成

```rust
use blake3::Hasher;
use std::path::Path;

fn generate_cache_filename(file_path: &Path) -> String {
    // ファイルパスの正規化
    let canonical_path = file_path
        .canonicalize()
        .unwrap_or_else(|_| file_path.to_path_buf());
    
    // パス文字列をハッシュ化
    let path_str = canonical_path.to_string_lossy();
    let hash = blake3::hash(path_str.as_bytes());
    
    // 16進数文字列として返す（64文字）
    format!("{}.jpg", hash.to_hex())
}

// 使用例
fn get_thumbnail_cache_path(
    image_path: &Path,
    cache_dir: &Path,
) -> std::path::PathBuf {
    let cache_filename = generate_cache_filename(image_path);
    cache_dir.join(cache_filename)
}
```

#### 短縮ハッシュの使用（オプション）

```rust
fn generate_short_cache_filename(file_path: &Path) -> String {
    let canonical_path = file_path
        .canonicalize()
        .unwrap_or_else(|_| file_path.to_path_buf());
    
    let path_str = canonical_path.to_string_lossy();
    let hash = blake3::hash(path_str.as_bytes());
    
    // 最初の16バイト（32文字）のみ使用
    // 十分なユニーク性を保ちつつファイル名を短縮
    let hex = hash.to_hex();
    format!("{}.jpg", &hex[..32])
}
```

#### ファイル内容のハッシュ生成（オプション）

```rust
use std::fs::File;
use std::io::Read;

fn hash_file_content(file_path: &Path) -> Result<String, std::io::Error> {
    let mut file = File::open(file_path)?;
    let mut hasher = Hasher::new();
    
    // 4KBチャンクで読み込み
    let mut buffer = [0; 4096];
    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    
    Ok(hasher.finalize().to_hex().to_string())
}
```

#### キャッシュキーの生成戦略

```rust
use std::time::SystemTime;

#[derive(Debug)]
struct CacheKey {
    path_hash: String,
    size: u32,
    quality: u8,
}

impl CacheKey {
    fn new(file_path: &Path, size: u32, quality: u8) -> Self {
        let canonical_path = file_path
            .canonicalize()
            .unwrap_or_else(|_| file_path.to_path_buf());
        
        // パス + サイズ + 品質を組み合わせてハッシュ化
        let key_string = format!(
            "{}:{}:{}",
            canonical_path.to_string_lossy(),
            size,
            quality
        );
        
        let hash = blake3::hash(key_string.as_bytes());
        
        Self {
            path_hash: hash.to_hex().to_string(),
            size,
            quality,
        }
    }
    
    fn to_filename(&self) -> String {
        format!("{}_{}_{}.jpg", &self.path_hash[..16], self.size, self.quality)
    }
}

// 使用例
fn get_cache_path_with_params(
    image_path: &Path,
    cache_dir: &Path,
    size: u32,
    quality: u8,
) -> std::path::PathBuf {
    let cache_key = CacheKey::new(image_path, size, quality);
    cache_dir.join(cache_key.to_filename())
}
```

#### パフォーマンス比較

```rust
// ベンチマーク用のサンプルコード
use std::time::Instant;

fn benchmark_hash_algorithms(input: &[u8]) {
    // BLAKE3
    let start = Instant::now();
    let _hash = blake3::hash(input);
    println!("BLAKE3: {:?}", start.elapsed());
    
    // SHA-256（比較用）
    use sha2::{Sha256, Digest};
    let start = Instant::now();
    let mut hasher = Sha256::new();
    hasher.update(input);
    let _hash = hasher.finalize();
    println!("SHA-256: {:?}", start.elapsed());
}
```

#### 依存関係の追加

```toml
[dependencies]
blake3 = "1.8.2"

# 比較用（オプション）
# sha2 = "0.10"
# xxhash-rust = "0.8"
```

---

## 4. Tauri 2.x ファイルシステムプラグイン

### Decision（決定事項）
- **プラグイン**: `@tauri-apps/plugin-fs` (フロントエンド), `tauri-plugin-fs` (バックエンド)
- **バージョン**: 2.0.0以上（Tauri 2.x対応）
- **パーミッション設定**: `fs:default` + カスタムスコープ
- **キャッシュディレクトリ**: `$APPCACHE/thumbnails/` を使用

### Rationale（理由）
1. **公式プラグイン**:
   - Tauri 2.xで推奨されるファイルシステムアクセス方法
   - セキュアなパーミッションモデル
   - クロスプラットフォーム対応（Windows、Linux、macOS、iOS、Android）

2. **$APPCACHEの選択**:
   - システム定義のキャッシュディレクトリ
   - ユーザーが削除可能（ディスククリーンアップツール対応）
   - 自動的にバックアップ対象外
   - プラットフォーム別パス:
     - Linux: `$XDG_CACHE_HOME/com.sun-riseup-viewrrr/thumbnails/` (通常 `~/.cache/`)
     - macOS: `~/Library/Caches/com.sun-riseup-viewrrr/thumbnails/`
     - Windows: `%LOCALAPPDATA%\com.sun-riseup-viewrrr\cache\thumbnails\`

3. **セキュリティモデル**:
   - デフォルトでパス トラバーサル攻撃を防止
   - スコープベースのアクセス制御
   - アプリ固有ディレクトリへのアクセスが推奨される

### Alternatives Considered（検討した代替案）

| ディレクトリ | パス例 (Linux) | メリット | デメリット |
|-------------|---------------|---------|-----------|
| **$APPCACHE** ✅ | `~/.cache/app/` | 標準的、削除可能 | なし |
| $APPDATA | `~/.local/share/app/` | 永続的 | キャッシュには不適切 |
| $APPLOCALDATA | `~/.local/share/app/` | 同上 | 同上 |
| $TEMP | `/tmp/` | 高速 | 再起動で消える |

- **$APPDATA**: データの永続化に使用すべき。キャッシュは不適切
- **$TEMP**: 一時ファイルには最適だが、再起動後に消える可能性がある

### Implementation Notes（実装上の注意点）

#### フロントエンド（TypeScript/JavaScript）

```typescript
// パッケージのインストール
// npm install @tauri-apps/plugin-fs

import { 
  BaseDirectory, 
  exists, 
  readBinaryFile,
  mkdir,
  writeBinaryFile 
} from '@tauri-apps/plugin-fs';

// キャッシュディレクトリの作成
async function ensureThumbnailCacheDir(): Promise<void> {
  const thumbnailsDir = 'thumbnails';
  
  try {
    const dirExists = await exists(thumbnailsDir, {
      baseDir: BaseDirectory.AppCache,
    });
    
    if (!dirExists) {
      await mkdir(thumbnailsDir, {
        baseDir: BaseDirectory.AppCache,
        recursive: true,
      });
      console.log('サムネイルキャッシュディレクトリを作成しました');
    }
  } catch (error) {
    console.error('ディレクトリ作成エラー:', error);
    throw error;
  }
}

// サムネイルの存在確認
async function thumbnailExists(cacheFilename: string): Promise<boolean> {
  return await exists(`thumbnails/${cacheFilename}`, {
    baseDir: BaseDirectory.AppCache,
  });
}

// サムネイルの読み込み
async function loadThumbnail(cacheFilename: string): Promise<Uint8Array> {
  return await readBinaryFile(`thumbnails/${cacheFilename}`, {
    baseDir: BaseDirectory.AppCache,
  });
}

// サムネイルの保存
async function saveThumbnail(
  cacheFilename: string, 
  data: Uint8Array
): Promise<void> {
  await writeBinaryFile(
    `thumbnails/${cacheFilename}`, 
    data, 
    {
      baseDir: BaseDirectory.AppCache,
    }
  );
}

// Base64エンコードされたデータURLの生成
function createThumbnailDataUrl(thumbnailData: Uint8Array): string {
  const base64 = btoa(
    String.fromCharCode(...thumbnailData)
  );
  return `data:image/jpeg;base64,${base64}`;
}
```

#### バックエンド（Rust）

```rust
// Cargo.toml
// [dependencies]
// tauri-plugin-fs = "2.0"

use tauri::Manager;
use std::path::PathBuf;

// キャッシュディレクトリパスの取得
fn get_cache_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    // Tauriが提供するパス解決APIを使用
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| format!("キャッシュディレクトリの取得に失敗: {}", e))?;
    
    let thumbnail_dir = cache_dir.join("thumbnails");
    
    // ディレクトリが存在しない場合は作成
    if !thumbnail_dir.exists() {
        std::fs::create_dir_all(&thumbnail_dir)?;
    }
    
    Ok(thumbnail_dir)
}

// Tauriコマンドの例
#[tauri::command]
async fn generate_thumbnail_cached(
    app_handle: tauri::AppHandle,
    image_path: String,
    size: u32,
) -> Result<String, String> {
    let image_path = PathBuf::from(image_path);
    let cache_dir = get_cache_dir(&app_handle)
        .map_err(|e| e.to_string())?;
    
    // キャッシュファイル名の生成
    let cache_filename = generate_cache_filename(&image_path);
    let cache_path = cache_dir.join(&cache_filename);
    
    // キャッシュが存在する場合は再利用
    if cache_path.exists() {
        return Ok(format!("thumbnails/{}", cache_filename));
    }
    
    // サムネイル生成
    generate_thumbnail(&image_path, &cache_path, size, 60)
        .map_err(|e| e.to_string())?;
    
    Ok(format!("thumbnails/{}", cache_filename))
}

// アプリケーション初期化時の処理
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // キャッシュディレクトリの初期化
            if let Err(e) = get_cache_dir(&app.handle()) {
                eprintln!("キャッシュディレクトリの初期化に失敗: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_thumbnail_cached
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### パーミッション設定

**src-tauri/capabilities/default.json**:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-capability",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "fs:default",
    {
      "identifier": "fs:allow-app-cache-read-recursive",
      "allow": [
        { "path": "$APPCACHE/thumbnails/**/*" }
      ]
    },
    {
      "identifier": "fs:allow-app-cache-write-recursive",
      "allow": [
        { "path": "$APPCACHE/thumbnails/**/*" }
      ]
    },
    {
      "identifier": "fs:allow-mkdir",
      "allow": [
        { "path": "$APPCACHE/thumbnails" }
      ]
    }
  ]
}
```

#### クロスプラットフォーム パス処理

```rust
use std::path::{Path, PathBuf};

// プラットフォーム固有の処理を抽象化
fn normalize_path(path: &Path) -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        // Windowsでは \ を / に変換
        PathBuf::from(path.to_string_lossy().replace("\\", "/"))
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        path.to_path_buf()
    }
}

// パスの検証
fn is_valid_cache_path(path: &Path, cache_root: &Path) -> bool {
    // パストラバーサル攻撃の防止
    path.canonicalize()
        .ok()
        .and_then(|p| p.strip_prefix(cache_root).ok())
        .is_some()
}
```

---

## 5. クロスプラットフォームキャッシュディレクトリ

### Decision（決定事項）
- **推奨クレート**: `directories = "6.0.0"`（Tauri APIと併用）
- **主な使用方法**: Tauriの`AppHandle::path()`を優先、必要に応じて`directories`を併用
- **キャッシュパス**: 各OS標準のキャッシュディレクトリ + アプリ識別子

### Rationale（理由）
1. **Tauri統合**:
   - Tauri 2.xは内部で適切なディレクトリ管理を提供
   - `app_handle.path().app_cache_dir()`が推奨される方法
   - アプリケーション識別子が自動的に付与される

2. **directoriesクレート**:
   - XDG Base Directory仕様（Linux）に準拠
   - Windows Known Folderシステムに対応
   - macOS Standard Directoriesに準拠
   - 16K SLoC、よくテストされたライブラリ

3. **プラットフォーム別パス**:

| OS | キャッシュディレクトリ | 例 |
|----|---------------------|-----|
| Linux | `$XDG_CACHE_HOME` or `~/.cache` | `~/.cache/com.sun-riseup-viewrrr/thumbnails/` |
| macOS | `~/Library/Caches` | `~/Library/Caches/com.sun-riseup-viewrrr/thumbnails/` |
| Windows | `%LOCALAPPDATA%` | `C:\Users\<User>\AppData\Local\com.sun-riseup-viewrrr\cache\thumbnails\` |

### Alternatives Considered（検討した代替案）

| 手法 | メリット | デメリット | 推奨度 |
|------|---------|-----------|--------|
| **Tauri path API** ✅ | 統合された、シンプル | Tauriに依存 | 高 |
| directories クレート | 汎用的、スタンドアロン | 追加依存 | 中 |
| 手動実装 | 完全な制御 | プラットフォーム固有コードが必要 | 低 |
| env::var("HOME") | シンプル | 非標準、移植性低い | 低 |

- **手動実装**: 各OSのAPIを直接呼び出す必要があり、複雑でエラーの原因になりやすい
- **環境変数**: `$HOME`や`$XDG_CACHE_HOME`に依存するが、すべての環境で設定されているとは限らない

### Implementation Notes（実装上の注意点）

#### Tauri統合パターン（推奨）

```rust
use tauri::Manager;
use std::path::PathBuf;

// Tauriのパス解決を使用（推奨）
fn get_app_cache_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| format!("キャッシュディレクトリの取得に失敗: {}", e))
}

fn get_thumbnail_cache_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let cache_dir = get_app_cache_dir(app_handle)?;
    let thumbnail_dir = cache_dir.join("thumbnails");
    
    // ディレクトリが存在しない場合は作成
    if !thumbnail_dir.exists() {
        std::fs::create_dir_all(&thumbnail_dir)
            .map_err(|e| format!("ディレクトリ作成エラー: {}", e))?;
    }
    
    Ok(thumbnail_dir)
}

// その他の標準ディレクトリも同様に取得可能
fn get_other_dirs(app_handle: &tauri::AppHandle) {
    // アプリデータディレクトリ
    let app_data = app_handle.path().app_data_dir();
    
    // アプリ設定ディレクトリ
    let app_config = app_handle.path().app_config_dir();
    
    // アプリログディレクトリ
    let app_log = app_handle.path().app_log_dir();
    
    // リソースディレクトリ
    let resource = app_handle.path().resource_dir();
}
```

#### directoriesクレートを使用したパターン

```rust
use directories::ProjectDirs;
use std::path::PathBuf;

fn get_project_cache_dir() -> Option<PathBuf> {
    // qualifier: 組織の逆DNS（com）
    // organization: 組織名（sun-riseup）
    // application: アプリケーション名（viewrrr）
    ProjectDirs::from("com", "sun-riseup", "viewrrr")
        .map(|dirs| dirs.cache_dir().to_path_buf())
}

fn get_thumbnail_cache_dir_standalone() -> Result<PathBuf, String> {
    let cache_dir = get_project_cache_dir()
        .ok_or("キャッシュディレクトリの取得に失敗")?;
    
    let thumbnail_dir = cache_dir.join("thumbnails");
    
    if !thumbnail_dir.exists() {
        std::fs::create_dir_all(&thumbnail_dir)
            .map_err(|e| format!("ディレクトリ作成エラー: {}", e))?;
    }
    
    Ok(thumbnail_dir)
}

// システム標準ディレクトリの取得
use directories::BaseDirs;

fn get_system_dirs() -> Option<()> {
    let base_dirs = BaseDirs::new()?;
    
    // ホームディレクトリ
    let _home = base_dirs.home_dir();
    
    // キャッシュディレクトリ（ユーザーレベル）
    let _cache = base_dirs.cache_dir();
    
    // 設定ディレクトリ
    let _config = base_dirs.config_dir();
    
    // データディレクトリ
    let _data = base_dirs.data_dir();
    
    Some(())
}
```

#### ハイブリッドアプローチ

```rust
// Tauri環境ではTauri APIを使用、それ以外ではdirectoriesを使用
fn get_cache_dir_hybrid(
    app_handle: Option<&tauri::AppHandle>
) -> Result<PathBuf, String> {
    if let Some(handle) = app_handle {
        // Tauri環境
        handle
            .path()
            .app_cache_dir()
            .map_err(|e| e.to_string())
    } else {
        // スタンドアロン環境
        get_project_cache_dir()
            .ok_or_else(|| "キャッシュディレクトリの取得に失敗".to_string())
    }
}
```

#### プラットフォーム固有の処理

```rust
use std::path::PathBuf;

// プラットフォーム固有のキャッシュパスを返す
fn get_platform_cache_dir(app_name: &str) -> Option<PathBuf> {
    #[cfg(target_os = "linux")]
    {
        // Linux: $XDG_CACHE_HOME or ~/.cache
        std::env::var("XDG_CACHE_HOME")
            .ok()
            .map(PathBuf::from)
            .or_else(|| {
                std::env::var("HOME")
                    .ok()
                    .map(|home| PathBuf::from(home).join(".cache"))
            })
            .map(|cache| cache.join(app_name))
    }
    
    #[cfg(target_os = "macos")]
    {
        // macOS: ~/Library/Caches
        std::env::var("HOME")
            .ok()
            .map(|home| {
                PathBuf::from(home)
                    .join("Library")
                    .join("Caches")
                    .join(app_name)
            })
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows: %LOCALAPPDATA%
        std::env::var("LOCALAPPDATA")
            .ok()
            .map(|local_app_data| {
                PathBuf::from(local_app_data)
                    .join(app_name)
                    .join("cache")
            })
    }
    
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        None
    }
}
```

#### ディレクトリ作成のベストプラクティス

```rust
use std::fs;
use std::path::Path;

fn ensure_dir_exists(dir: &Path) -> Result<(), std::io::Error> {
    if !dir.exists() {
        // 親ディレクトリも含めて再帰的に作成
        fs::create_dir_all(dir)?;
        
        #[cfg(unix)]
        {
            // Unix系では適切な権限を設定
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(dir)?.permissions();
            perms.set_mode(0o700); // rwx------
            fs::set_permissions(dir, perms)?;
        }
    }
    Ok(())
}
```

#### 依存関係の追加

```toml
[dependencies]
# Tauri 2.x（すでに含まれている）
tauri = { version = "2.0", features = ["path-all"] }

# オプション: スタンドアロンでの使用
directories = "6.0"
```

---

## まとめと推奨実装アーキテクチャ

### 全体的な実装フロー

```rust
// サムネイル生成サービスの概要
pub struct ThumbnailService {
    cache_dir: PathBuf,
    thread_pool: ThreadPool,
}

impl ThumbnailService {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let cache_dir = app_handle
            .path()
            .app_cache_dir()?
            .join("thumbnails");
        
        std::fs::create_dir_all(&cache_dir)?;
        
        let thread_pool = ThreadPoolBuilder::new()
            .num_threads(calculate_optimal_thread_count())
            .thread_name(|i| format!("thumbnail-{}", i))
            .build()?;
        
        Ok(Self { cache_dir, thread_pool })
    }
    
    pub fn generate_thumbnails(
        &self,
        image_paths: Vec<PathBuf>,
    ) -> Vec<Result<PathBuf, ThumbnailError>> {
        self.thread_pool.install(|| {
            image_paths
                .par_iter()
                .map(|path| self.generate_single_thumbnail(path))
                .collect()
        })
    }
    
    fn generate_single_thumbnail(&self, image_path: &Path) -> Result<PathBuf, ThumbnailError> {
        // キャッシュチェック
        let cache_filename = generate_cache_filename(image_path);
        let cache_path = self.cache_dir.join(&cache_filename);
        
        if cache_path.exists() {
            return Ok(cache_path);
        }
        
        // サムネイル生成
        let img = image::open(image_path)?;
        let thumbnail = img.resize(200, 200, FilterType::Lanczos3);
        
        // JPEG保存
        let mut file = std::fs::File::create(&cache_path)?;
        use image::codecs::jpeg::JpegEncoder;
        let encoder = JpegEncoder::new_with_quality(&mut file, 60);
        thumbnail.write_with_encoder(encoder)?;
        
        Ok(cache_path)
    }
}

fn generate_cache_filename(file_path: &Path) -> String {
    let canonical = file_path
        .canonicalize()
        .unwrap_or_else(|_| file_path.to_path_buf());
    let hash = blake3::hash(canonical.to_string_lossy().as_bytes());
    format!("{}.jpg", hash.to_hex())
}

fn calculate_optimal_thread_count() -> usize {
    num_cpus::get().max(2).min(8)
}
```

### 依存関係の最終リスト

```toml
[dependencies]
# 画像処理
image = { version = "0.25.9", default-features = true }

# 並列処理
rayon = "1.11.0"
num_cpus = "1.16"

# ハッシュ生成
blake3 = "1.8.2"

# Tauri（既存）
tauri = { version = "2.0", features = ["path-all"] }
tauri-plugin-fs = "2.0"

# エラーハンドリング
thiserror = "2.0"

# オプション: スタンドアロン用
directories = "6.0"
```

### 主要な実装上の注意点

1. **パフォーマンス**:
   - リリースビルドで実行（デバッグは10倍以上遅い）
   - 並列処理でCPUを最大限活用
   - キャッシュヒットで不要な再生成を回避

2. **品質**:
   - Lanczos3で高品質なサムネイル
   - JPEG品質60でファイルサイズと品質のバランス

3. **セキュリティ**:
   - Tauriのパーミッションモデルに従う
   - パストラバーサル攻撃を防止
   - `$APPCACHE`の適切なスコープ設定

4. **クロスプラットフォーム**:
   - Tauri APIを優先して使用
   - プラットフォーム固有の処理は最小限に
   - パス区切り文字の処理に注意

5. **エラーハンドリング**:
   - `thiserror`で型安全なエラー定義
   - ユーザーフレンドリーなエラーメッセージ
   - 部分的な失敗を許容（一部の画像が失敗しても続行）

---

## 参考資料

### ドキュメント
- [image crate documentation](https://docs.rs/image/latest/image/)
- [rayon documentation](https://docs.rs/rayon/latest/rayon/)
- [BLAKE3 specification](https://github.com/BLAKE3-team/BLAKE3)
- [Tauri v2 File System Plugin](https://v2.tauri.app/plugin/file-system/)
- [directories crate](https://docs.rs/directories/latest/directories/)

### ベンチマーク・比較
- [BLAKE3 benchmarks](https://github.com/BLAKE3-team/BLAKE3-specs/blob/master/benchmarks/bar_chart.py)
- [image-rs performance guide](https://github.com/image-rs/image/blob/main/README.md#performance)

### コミュニティリソース
- [Tauri Discord](https://discord.com/invite/tauri)
- [Rust Users Forum](https://users.rust-lang.org/)
- [image-rs GitHub Issues](https://github.com/image-rs/image/issues)
