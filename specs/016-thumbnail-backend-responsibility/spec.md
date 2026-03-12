# Issue #16: サムネイル最適化制御のバックエンド責務移動 — 技術設計仕様

**作成日**: 2026-03-10
**ステータス**: Draft
**TDD方針**: test-first (RED → GREEN → BLUE)

---

## 概要

フロントエンドがバックエンドの最適化戦略（バッチサイズ、優先度制御、画像パス収集）の詳細を知りすぎている問題（情報隠蔽違反）を解消する。フォルダパスを渡すだけでサムネイルが返る新APIをRust側に実装し、フロント側の最適化ロジックを撤廃する。

---

## 1. 現状の問題分析

### 1.1 データフロー（現在）

```
フロントエンド                              Rust バックエンド
──────────────────────────────────────────────────────────────
useThumbnail (FolderView.tsx)
  ① listImagesInFolder(folderPath)    →   list_images_in_folder
  ② getBaseName(files[0])            →   tauri path::basename
  ③ getOrCreateThumbnail(files[0])   →   get_or_create_thumbnail
  ④ convertFileSrc(cachePath)             (ローカル変換)
  = 3回のIPC + 1回のローカル処理

useThumbnailPrefetch (Sidebar.tsx)
  ⑤ folders.slice(0, visibleCount)        (フロントが件数決定)
  ⑥ N回 listImagesInFolder(folder)   →   N回 list_images_in_folder
  ⑦ batchCreateThumbnails(paths, N)  →   batch_create_thumbnails
  = N+1回のIPC（フロントがバッチ戦略を制御）
```

**問題点**:
- `useThumbnail`: 1つのサムネイルに3回のIPC呼び出し
- `useThumbnailPrefetch`: フロントがフォルダ→画像変換・バッチサイズ・優先度ヒント(`visibleCount`)を管理
- `batchCreateThumbnails` の `visibleCount` パラメータがバックエンド内部の優先度戦略を漏洩

### 1.2 影響ファイル一覧

| ファイル | 役割 | 変更要否 |
|---------|------|---------|
| [FileSystemService.ts](../../src/features/folder-navigation/services/FileSystemService.ts) | インターフェース定義 | ✅ メソッド追加・既存非推奨化 |
| [tauriAdapters.ts](../../src/shared/adapters/tauriAdapters.ts) | Tauri アダプター | ✅ 新メソッド実装 |
| [useThumbnail.ts](../../src/features/folder-navigation/hooks/useThumbnail.ts) | 個別サムネイル取得 | ✅ 新API利用に変更 |
| [useThumbnailPrefetch.ts](../../src/features/folder-navigation/hooks/useThumbnailPrefetch.ts) | プリフェッチ | ✅ 大幅簡略化 |
| [mocks.ts](../../src/test/mocks.ts) | テストモック | ✅ 新メソッド追加 |
| [thumbnail.rs](../../src-tauri/src/commands/thumbnail.rs) | Rust コマンド | ✅ 新コマンド追加 |
| [lib.rs](../../src-tauri/src/lib.rs) | コマンド登録 | ✅ 新コマンド登録 |
| [Sidebar.tsx](../../src/features/folder-navigation/components/Sidebar/Sidebar.tsx) | サイドバー | ⬜ 変更不要（hookが内部変更を吸収） |
| [FolderView.tsx](../../src/features/folder-navigation/components/FolderView.tsx) | フォルダ表示 | ⬜ 変更不要（hookが内部変更を吸収） |
| [index.ts](../../src/features/folder-navigation/index.ts) | エクスポート | ⬜ 変更不要（hook名は同一） |

---

## 2. 新APIインターフェース設計

### 2.1 データフロー（新設計）

```
フロントエンド                              Rust バックエンド
──────────────────────────────────────────────────────────────
useThumbnail (FolderView.tsx)
  ① getFolderThumbnail(folderPath)   →   get_folder_thumbnail
                                           ├─ list_images_in_folder (内部)
                                           ├─ get_or_create_thumbnail (内部)
                                           └─ basename (内部)
  ② convertFileSrc(result.thumbnailPath)  (ローカル変換)
  = 1回のIPC + 1回のローカル処理 ✅

useThumbnailPrefetch (Sidebar.tsx)
  ③ prefetchFolderThumbnails(paths)  →   prefetch_folder_thumbnails
                                           ├─ フォルダ→画像変換 (内部)
                                           ├─ 優先度決定 (内部)
                                           └─ バッチ生成 (内部)
  = 1回のIPC（バックエンドが全戦略を隠蔽） ✅
```

### 2.2 Rust コマンド — `get_folder_thumbnail`

```rust
/// フォルダのサムネイル結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct FolderThumbnailResult {
    /// ソース画像のフルパス
    pub image_path: String,
    /// サムネイルのキャッシュパス
    pub thumbnail_path: String,
    /// ソース画像のファイル名（basename）
    pub image_name: String,
}

/// フォルダの代表サムネイルを取得または生成する
///
/// フォルダ内の最初の画像を自動選択し、サムネイルを生成してキャッシュパスを返す。
/// 画像選択・サムネイル生成・キャッシュ管理は全てバックエンドが隠蔽する。
///
/// # Arguments
/// * `folder_path` - フォルダのフルパス
/// * `app_handle` - Tauriアプリケーションハンドル
///
/// # Returns
/// - `Ok(Some(FolderThumbnailResult))`: サムネイル生成成功
/// - `Ok(None)`: フォルダに画像がない
/// - `Err(String)`: エラー
#[command]
pub async fn get_folder_thumbnail(
    folder_path: String,
    app_handle: AppHandle,
) -> Result<Option<FolderThumbnailResult>, String>;
```

**内部処理フロー**:
1. `core_logic::list_images_in_folder(folder_path)` で画像一覧取得
2. 画像がなければ `Ok(None)` を返却
3. 最初の画像を選択し `ThumbnailGenerator::get_or_create_thumbnail` でサムネイル生成
4. `std::path::Path::file_name()` でbasename取得
5. `FolderThumbnailResult` を返却

### 2.3 Rust コマンド — `prefetch_folder_thumbnails`

```rust
/// 複数フォルダのサムネイルをバックグラウンドでプリフェッチする
///
/// フォルダパスの配列を受け取り、各フォルダの代表画像を自動選択して
/// バッチ生成する。優先度・バッチ戦略はバックエンドが内部で決定する。
///
/// # Arguments
/// * `folder_paths` - フォルダパスの配列
/// * `app_handle` - Tauriアプリケーションハンドル
///
/// # Returns
/// - `Ok(())`: プリフェッチ完了（個別エラーは無視）
/// - `Err(String)`: 致命的エラー（初期化失敗等）
#[command]
pub async fn prefetch_folder_thumbnails(
    folder_paths: Vec<String>,
    app_handle: AppHandle,
) -> Result<(), String>;
```

**内部処理フロー**:
1. `tokio::task::spawn_blocking` で非同期実行
2. 各フォルダから `core_logic::list_images_in_folder` で最初の画像を収集
3. `BatchThumbnailGenerator` でバッチ生成（優先度はバックエンド内部で決定）
4. 個別画像のエラーは無視（プリフェッチは best-effort）
5. `Ok(())` を返却

**優先度の内部決定ロジック**（フロントに非公開）:
```rust
// バックエンドが自律的に優先度を決定
let priority = match index {
    0..=9   => TaskPriority::High,    // 先頭10件: 高優先度
    10..=29 => TaskPriority::Normal,  // 次の20件: 通常
    _       => TaskPriority::Low,     // それ以降: 低優先度
};
```

### 2.4 TypeScript `FileSystemService` — 新メソッド

```typescript
// --- 新しい型定義（folderTypes.ts または新規ファイル） ---

/** バックエンドから返されるフォルダサムネイル結果 */
export interface FolderThumbnailResult {
  /** ソース画像のフルパス */
  imagePath: string;
  /** サムネイルのキャッシュパス */
  thumbnailPath: string;
  /** ソース画像のファイル名 */
  imageName: string;
}

// --- FileSystemService 追加メソッド ---

export interface FileSystemService {
  // ... 既存メソッド（変更なし）...

  // === 新しいサムネイルAPI ===

  /**
   * フォルダの代表サムネイルを取得する
   * バックエンドが画像選択・生成・キャッシュを全て隠蔽する
   *
   * @param folderPath フォルダのフルパス
   * @returns サムネイル結果。フォルダに画像がなければ null
   */
  getFolderThumbnail?(folderPath: string): Promise<FolderThumbnailResult | null>;

  /**
   * 複数フォルダのサムネイルをバックグラウンドでプリフェッチする
   * バッチ戦略・優先度はバックエンドが内部で決定する
   *
   * @param folderPaths フォルダパスの配列
   */
  prefetchFolderThumbnails?(folderPaths: string[]): Promise<void>;

  // === 非推奨（BLUE フェーズで削除予定） ===

  /** @deprecated getFolderThumbnail を使用してください */
  getOrCreateThumbnail?(imagePath: string): Promise<string>;

  /** @deprecated prefetchFolderThumbnails を使用してください */
  batchCreateThumbnails?(
    imagePaths: string[],
    visibleCount?: number,
  ): Promise<Record<string, { success: boolean; path?: string; error?: string }>>;

  /** キャッシュクリア（デバッグ用、変更なし） */
  clearThumbnailCache?(): Promise<void>;
}
```

### 2.5 既存APIの扱い

| API | 判定 | 理由 |
|-----|------|------|
| `getOrCreateThumbnail` | **BLUE フェーズで削除** | `getFolderThumbnail` が完全に代替。Rust内部の `ThumbnailGenerator::get_or_create_thumbnail` は引き続き内部利用 |
| `batchCreateThumbnails` | **BLUE フェーズで削除** | `prefetchFolderThumbnails` が代替。`visibleCount` パラメータが情報漏洩の根本原因 |
| `clearThumbnailCache` | **維持** | デバッグ用途。現時点で未実装だが、削除理由なし |
| Rust `get_or_create_thumbnail` コマンド | **BLUE フェーズでコマンド登録解除**（内部利用は継続） | フロントからの直接呼び出し不要に |
| Rust `batch_create_thumbnails` コマンド | **BLUE フェーズでコマンド登録解除** | `prefetch_folder_thumbnails` が代替 |

### 2.6 `useThumbnailPrefetch` の置き換え方針

**現状**: 87行、フォルダ→画像変換・可視件数制御・バッチ呼び出しを実装
**新設計**: 約20行に簡略化

```typescript
// 新しい useThumbnailPrefetch（設計イメージ）
export function useThumbnailPrefetch(folders: FolderInfo[]) {
  const fs = useServices();

  useEffect(() => {
    if (folders.length === 0 || !fs.prefetchFolderThumbnails) return;

    const timeoutId = setTimeout(() => {
      const folderPaths = folders.map((f) => f.path);
      void fs.prefetchFolderThumbnails(folderPaths)
        .catch((err) => console.warn('Prefetch failed:', err));
    }, SIDEBAR_CONFIG.PREFETCH_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [folders, fs]);
}
```

**変更点**:
- `visibleCount` パラメータ削除（バックエンドが内部で優先度決定）
- `getFirstImagePath` ヘルパー関数削除（バックエンドが画像検索を担当）
- `disabled` / `delay` / `visibleCount` の options パラメータ簡略化
- バッチAPIの直接呼び出し削除

**注意**: `SIDEBAR_CONFIG.PREFETCH_DELAY_MS` は維持する。これはUI応答性の最適化であり、バックエンド最適化とは別の関心事。フォルダ数の制限（`INITIAL_VISIBLE_COUNT` でのスライス）もUI側の判断として残すか検討するが、バックエンドが全フォルダを受け取って内部で優先度付けする設計の方がシンプル。

---

## 3. TDD サイクル設計

### Phase 1: RED（失敗するテストを先に書く）

#### 3.1 Rust 単体テスト

| # | テストケース名 | 入力 | 期待出力 | 優先度 | ファイル |
|---|--------------|------|---------|--------|---------|
| R1 | `test_get_folder_thumbnail_returns_result_for_folder_with_images` | 画像を含むフォルダパス | `Some(FolderThumbnailResult)` で `image_name` がファイル名 | high | `src-tauri/src/commands/thumbnail.rs` (または新ファイル `folder.rs`) |
| R2 | `test_get_folder_thumbnail_returns_none_for_empty_folder` | 空フォルダパス | `Ok(None)` | high | 同上 |
| R3 | `test_get_folder_thumbnail_returns_error_for_invalid_path` | 存在しないパス | `Err(...)` | medium | 同上 |
| R4 | `test_folder_thumbnail_result_serialization` | `FolderThumbnailResult` 構造体 | JSON に `image_path`, `thumbnail_path`, `image_name` が含まれる | high | 同上 |
| R5 | `test_prefetch_folder_thumbnails_processes_multiple_folders` | 複数フォルダパス | `Ok(())` + 各フォルダの最初の画像にサムネイルが生成されている | medium | 同上 |
| R6 | `test_prefetch_folder_thumbnails_handles_empty_input` | 空の Vec | `Ok(())` | medium | 同上 |
| R7 | `test_prefetch_priority_assignment` | 50件のフォルダ | 先頭10件がHigh、次20件がNormal、残りがLow | medium | `batch.rs` |

**テスタビリティの注意**: R1, R2, R5 は `AppHandle` と実ファイルシステムが必要なため、統合テストレベル。R4, R6, R7 は単体テスト可能。R3 はパスの存在確認がOS依存だが単体テストで可能。

#### 3.2 フロントエンド テスト

| # | テストケース名 | テスト対象 | モック | 期待動作 | 優先度 | ファイル |
|---|--------------|----------|--------|---------|--------|---------|
| F1 | `getFolderThumbnail が有効な場合、1回のAPIコールでサムネイルを返す` | `useThumbnail` | `getFolderThumbnail` → `{ imagePath, thumbnailPath, imageName }` | `thumbnail` に `ImageSource` が返る、`listImagesInFolder` が呼ばれない | high | `src/features/folder-navigation/hooks/__tests__/useThumbnail.test.ts` (新規) |
| F2 | `getFolderThumbnail が null を返す場合、thumbnail が null` | `useThumbnail` | `getFolderThumbnail` → `null` | `thumbnail === null` | high | 同上 |
| F3 | `getFolderThumbnail が未定義の場合、旧APIにフォールバック` | `useThumbnail` | `getFolderThumbnail` 未定義、`getOrCreateThumbnail` あり | 旧ロジックで動作 | medium | 同上 |
| F4 | `getFolderThumbnail がエラーの場合、元画像にフォールバック` | `useThumbnail` | `getFolderThumbnail` → throw | `isError: true` またはフォールバック表示 | medium | 同上 |
| F5 | `prefetchFolderThumbnails でフォルダパスのみ渡してプリフェッチ` | `useThumbnailPrefetch` | `prefetchFolderThumbnails` → void | `prefetchFolderThumbnails` が `folders.map(f => f.path)` で呼ばれる | high | `src/features/folder-navigation/hooks/__tests__/useThumbnailPrefetch.test.ts` (新規) |
| F6 | `prefetchFolderThumbnails 未定義の場合、何もしない` | `useThumbnailPrefetch` | `prefetchFolderThumbnails` 未定義 | エラーなし、旧 `batchCreateThumbnails` も呼ばれない | medium | 同上 |
| F7 | `空配列の場合、プリフェッチしない` | `useThumbnailPrefetch` | mock あり | `prefetchFolderThumbnails` が呼ばれない | low | 同上 |

**テスト配置方針**:
- `useThumbnail` / `useThumbnailPrefetch` のテストは `hooks/__tests__/` に新規作成
- `renderHook` + `ServicesProvider` による DI テスト
- モックは `createMockFileSystemServiceWithThumbnails()` を拡張

### Phase 2: GREEN（最小実装でテストを通す）

#### ステップ 2.1: Rust 新コマンド実装
1. `src-tauri/src/commands/thumbnail/folder.rs` を新規作成
   - `FolderThumbnailResult` 構造体定義
   - `get_folder_thumbnail` コマンド実装
   - `prefetch_folder_thumbnails` コマンド実装
2. `src-tauri/src/commands/thumbnail.rs` (mod.rs相当) で `mod folder;` 追加・re-export
3. `src-tauri/src/lib.rs` の `invoke_handler` に新コマンド登録

#### ステップ 2.2: TypeScript 型・アダプター追加
1. `FileSystemService.ts` に `FolderThumbnailResult` 型と新メソッドシグネチャ追加
2. `tauriAdapters.ts` に `getFolderThumbnail` / `prefetchFolderThumbnails` 実装追加
3. `mocks.ts` の `createMockFileSystemServiceWithThumbnails()` に新メソッド追加

#### ステップ 2.3: フック更新
1. `useThumbnail.ts` — `getFolderThumbnail` を優先使用するよう `fetchThumbnail` を更新（旧APIフォールバック維持）
2. `useThumbnailPrefetch.ts` — `prefetchFolderThumbnails` を優先使用するよう更新（旧APIフォールバック維持）

### Phase 3: BLUE（リファクタリング・旧API削除）

#### ステップ 3.1: 旧APIコード削除（フロントエンド）
1. `FileSystemService.ts` から `getOrCreateThumbnail` / `batchCreateThumbnails` を削除
2. `tauriAdapters.ts` から対応する実装を削除
3. `useThumbnail.ts` から旧APIフォールバックコードを削除
4. `useThumbnailPrefetch.ts` から旧APIフォールバックコードと `getFirstImagePath` ヘルパー削除
5. `mocks.ts` から `getOrCreateThumbnail` / `batchCreateThumbnails` モックを削除
6. `sidebarConfig.ts` の `INITIAL_VISIBLE_COUNT` の用途見直し（プリフェッチ件数制御が不要になった場合は削除検討）

#### ステップ 3.2: 旧コマンド登録解除（Rust）
1. `src-tauri/src/lib.rs` の `invoke_handler` から `get_or_create_thumbnail` / `batch_create_thumbnails` を外す
2. `src-tauri/src/commands/thumbnail.rs` の旧コマンド関数に `#[allow(dead_code)]` を付与（内部利用のため関数自体は残す）
   - `ThumbnailGenerator::get_or_create_thumbnail` は `get_folder_thumbnail` 内部で使用
   - `BatchThumbnailGenerator::batch_create_thumbnails` は `prefetch_folder_thumbnails` 内部で使用

#### ステップ 3.3: テスト整理
1. 旧APIを参照するテストの更新・削除
2. 既存の `FolderView.test.tsx` / `FolderList.test.tsx`（`useThumbnail` モック使用）が引き続きパスすることを確認
3. `SidebarScroll.test.tsx` のモック更新

---

## 4. 移行戦略

### 段階的移行（推奨）

**コミット単位**で安全に進められるよう、以下の順序で実施する:

```
コミット1: RED — テスト作成
  ├─ Rust: 新コマンドのテスト（コンパイルエラーOK）
  └─ TS: 新フックテスト（型エラーOK）

コミット2: GREEN — 新API実装（旧API併存）
  ├─ Rust: folder.rs 新コマンド実装 + コマンド登録
  ├─ TS: 型定義 + アダプター + モック追加
  └─ TS: フック更新（新API優先、旧APIフォールバック）
  → 全テスト PASS（新旧両方が動く状態）

コミット3: BLUE — 旧API削除
  ├─ TS: FileSystemService から旧メソッド削除
  ├─ TS: アダプター・モック・フックから旧コード削除
  ├─ Rust: コマンド登録解除
  └─ テスト整理
  → 全テスト PASS
```

### GREEN フェーズでの後方互換性保証

```typescript
// useThumbnail.ts — GREEN フェーズ（両API共存）
async function fetchThumbnail(folderPath: string, fs: FileSystemService) {
  // 新API優先
  if (fs.getFolderThumbnail) {
    const result = await fs.getFolderThumbnail(folderPath);
    if (!result) return null;
    return {
      id: result.imagePath,
      name: result.imageName,
      assetUrl: fs.convertFileSrc(result.thumbnailPath),
    };
  }

  // 旧APIフォールバック（GREEN フェーズのみ）
  // ... 既存の fetchThumbnail ロジック ...
}
```

この設計により:
- GREEN フェーズ完了時点で新旧テストが全てパス
- BLUE フェーズで旧コードを安全に削除できる
- 各コミット時点でテスト全パスが保証される

---

## 5. 設計判断サマリー

### 決定事項
- **案1「フォルダパスのみの新API」を採用**: `getFolderThumbnail(folderPath)` + `prefetchFolderThumbnails(folderPaths)`
- **`FolderThumbnailResult` に `imageName` を含める**: フロント側の `getBaseName` IPC呼び出しも削減（3 IPC → 1 IPC）
- **`prefetchFolderThumbnails` は void を返す**: プリフェッチは best-effort でありフロントは結果を使わない
- **段階的移行**: GREEN フェーズで旧API併存、BLUE フェーズで削除

### 却下した選択肢

| 選択肢 | 却下理由 |
|--------|---------|
| イベント駆動方式（Tauri event listener） | 実装コスト高。SWRキャッシュとの統合が複雑。現行のリクエスト/レスポンスで十分 |
| `ThumbnailService` を `FileSystemService` から完全分離 | スコープが大きい。ServiceContext の変更、全テストの更新が必要。将来の別Issueで検討 |
| `getFolderThumbnail` に `ImageSource` を直接返す | `convertFileSrc` はフロントローカルの変換。Rustが `asset://` URLを生成するのは責務外 |
| `prefetchFolderThumbnails` で結果を返す | プリフェッチの結果をフロントが使わない。voidの方がシンプル |

### 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Rust テストで `AppHandle` が必要 | 中 | `FolderThumbnailResult` のシリアライズテストは単体で可能。`get_folder_thumbnail` は統合テストで検証 |
| `core_logic::list_images_in_folder` の結果順序に依存 | 低 | ファイルシステムの `read_dir` 順序に依存するが、現行と同じ挙動。必要なら Rust 側でソート追加 |
| `prefetch_folder_thumbnails` の大量フォルダ入力 | 低 | バックエンドの `TaskPriority` で自動制御。rayon スレッドプールが飽和を防止 |
| Tauri v2 の `#[command]` で `Option<T>` の返却 | 低 | Tauri v2 は `Result<Option<T>, String>` を正しくシリアライズ。JSONで `null` として返る |

### 前提条件
- `core_logic::list_images_in_folder` が Rust コマンド内部から直接呼び出せること（確認済み — `core_logic` クレートとして分離されている）
- `ThumbnailGenerator` と `BatchThumbnailGenerator` の既存内部APIは変更不要
- テストで使用する `test_images/` フォルダが利用可能

---

## 6. 実装上の注意点

### Rust
- `folder.rs` を新規作成するか、既存の `thumbnail.rs` に追記するか → モジュール肥大化を避けるため **新ファイル `folder.rs` を推奨**
- `FolderThumbnailResult` は Tauri の自動シリアライズ(`serde::Serialize`)が必要。フィールド名は `snake_case` → フロントで `camelCase` に変換される（Tauri v2 のデフォルト挙動を確認すること）
  - **注意**: Tauri v2 は `serde` のデフォルト命名（`snake_case`）をフロントにそのまま渡す。フロント側で `image_path` として受け取るか、`#[serde(rename_all = "camelCase")]` を付与して `imagePath` にするか統一が必要 → **`rename_all = "camelCase"` を推奨**（フロント側のインターフェースと一致させるため）
- `get_folder_thumbnail` は `tokio::task::spawn_blocking` 内で実行すること（画像I/OでTokioランタイムをブロックしない）
- `prefetch_folder_thumbnails` のフォルダ→画像変換は I/O バウンドなため `spawn_blocking` 内で一括処理

### TypeScript
- `FolderThumbnailResult` 型は `src/features/folder-navigation/types/` ディレクトリに配置
- `useThumbnail` の SWR キーは現在 `folderPath` そのもの — 変更不要
- `useThumbnailPrefetch` の `options` パラメータは BLUE フェーズで `{ delay?, disabled? }` のみに簡略化
- `convertFileSrc` はフロント側の責務として維持（Tauri の asset protocol 変換）

### テスト
- Rust 統合テストには `test_images/` の実画像ファイルを使用
- フロントエンドテストは `renderHook` + `ServicesProvider` パターン（既存の `FolderView.test.tsx` を参考）
- `useThumbnailPrefetch` テストでは `vi.useFakeTimers()` で delay 制御

---

## 7. 成果物チェックリスト（Definition of Done）

- [ ] フロント側にバッチサイズ・優先度の計算ロジックが存在しない
- [ ] `getFolderThumbnail` コマンドが Rust 側で実装されている
- [ ] `prefetchFolderThumbnails` コマンドが Rust 側で実装されている
- [ ] バックエンド側の単体テスト / 統合テストが追加されている
- [ ] フロントエンド側のフックテストが追加されている
- [ ] 既存の動作が維持されている（回帰テスト全パス: `pnpm test` + `cargo test`）
- [ ] `visibleCount` パラメータが `FileSystemService` インターフェースから削除されている
- [ ] `batchCreateThumbnails` / `getOrCreateThumbnail` がフロントから削除されている
