# ADR-002: 圧縮ファイルの遅延展開と2フェーズコンテナAPIの導入

## ステータス

Accepted

## 日付

2026-06-01

## コンテキスト

### 現状の問題

ZIP等の圧縮ファイルを開く際、`list_images_in_container` コマンドが**全ファイルを一括展開**してからパス一覧を返す設計になっていた。

```rust
// 現在: list_images_in_container の内部処理
extract_archive(archive_path, hash)  // ← 全展開（ブロッキング）
→ FolderImageContainer::list_images() // → 全パスを返す
```

これにより以下の問題が発生していた：

1. **CPUスパイク**: コンテナを開くたびに全ファイルを展開するため、大容量ZIPでCPU使用率が急騰する
2. **不必要な展開コスト**: ユーザーが実際に閲覧しない末尾の画像まで展開される
3. **バックエンドの都合がフロントに漏れるリスク**: 「全件を一括取得してから表示する」という設計がフロント側のデータ取得戦略を縛っていた

### 設計上の前提

- **コンテナ抽象を維持する**: フロントエンドはZIPかフォルダかを知らない。`ImageContainer` というインターフェースのみを知る
- **総件数は初期に判明する**: インデックスベースのナビゲーション（「全50枚中3枚目」表示、末尾ジャンプ等）を維持するため
- **バックエンドはステートレス**: 「どのインデックスが必要か」はフロントが制御し、バックエンドは純粋な操作のみを担う
- **チャンクサイズは将来ユーザー設定から注入可能にする**

## 決定

### 1. Tauriコマンドを2フェーズに分割（T1）

```rust
// フェーズ①: 軽量（ZIPヘッダ読み取りのみ、展開しない）
list_image_handles(container_path) -> Vec<ImageHandle>
// ImageHandle = { index: u32, name: String }
// フォルダ: ディレクトリスキャン（既存と同等コスト）
// ZIP: 中央ディレクトリを読むだけ（展開しない）

// フェーズ②: 重量になりうる（範囲指定で展開 or 解決）
resolve_images_in_range(container_path, offset: u32, count: u32) -> Vec<String>
// フォルダ: 全パスをスライスして返すだけ（ほぼ無コスト）
// ZIP: 指定範囲のエントリのみを展開してdiskパスを返す
```

フロントはコンテナ種別を意識せず同じ2コマンドを呼ぶ。コンテナ内部でフォルダとZIPの差分を吸収する。

### 2. `ImageHandle` の型設計（β案）

`ImageHandle` は `diskPath` を含まない。diskパスはフェーズ②の責任。

```typescript
type ImageHandle = {
  index: number;  // ソート済み順序
  name: string;   // 表示用ファイル名
  // diskPath は含まない ← フェーズ②で初めて判明する
}
```

これにより「フェーズ①は展開不要」という制約がコンパイル時に強制される。

### 3. `ImageContainer` インターフェースを破壊的変更（R案）

```typescript
// 変更前
interface ImageContainer {
  listImages(): Promise<ImageSource[]>;
}

// 変更後
interface ImageContainer {
  listHandles(): Promise<ImageHandle[]>;          // フェーズ①
  resolveRange(offset: number, count: number): Promise<ImageSource[]>; // フェーズ②
}
```

旧 `listImages()` は削除する。新旧APIの混在による曖昧さを避けるため。

### 4. チャンク管理は `LocalFolderContainer`（Container層）が担う（C1案）

```typescript
class LocalFolderContainer implements ImageContainer {
  constructor(
    private folderPath: string,
    private fs: FileSystemService,
    private config: ContainerConfig,  // chunkSize等を保持
  ) {}

  async listHandles(): Promise<ImageHandle[]> { ... }
  async resolveRange(offset: number, count: number): Promise<ImageSource[]> { ... }
}

interface ContainerConfig {
  chunkSize: number;
  prefetchThreshold?: number;  // 将来の先読み拡張用
}
```

`ContainerConfig` のコンストラクタ注入により、将来ユーザー設定からチャンクサイズを注入できる。この設計はRust側の `ImageContainerReaderConfig` パターンと対称。

### 5. `ImageViewer` は `ImageContainer` を props で受け取る

```typescript
// 変更前
<ImageViewer folderPath="/path/to/container" />

// 変更後
<ImageViewer container={container} />
```

Containerの生成は `App.tsx` 等の上位コンポーネントが責任を持つ。これにより `ImageViewer` はTauri/SWR/ServiceContextに依存しなくなり、UIライブラリとして独立して切り出せる状態になる。

### 6. `FileSystemService` の `listImagesInContainer` を完全削除

新2メソッドに完全置換する：

```typescript
interface FileSystemService {
  // 削除
  // listImagesInContainer(containerPath: string): Promise<string[]>;

  // 追加
  listImageHandles(containerPath: string): Promise<ImageHandle[]>;
  resolveImagesInRange(containerPath: string, offset: number, count: number): Promise<string[]>;
}
```

`useOpenImageFile` の `listImagesInContainer` 呼び出しは `listImageHandles` + `getBaseName` による basename 照合に書き換える。

### 7. 先読みは今回スコープ外（P3）

現時点のゴールはCPUスパイクの解消であり、チャンク化のみで達成可能。先読みのタイミング最適化はパフォーマンス計測後に別Issueで判断する。

`ContainerConfig.prefetchThreshold` のフィールドは型として定義し、拡張点を明示的に残す。

## 影響を受けるファイル

### Rust (バックエンド)

| ファイル | 変更内容 |
|---|---|
| `core_logic/src/image_container.rs` | `ImageContainer` トレイトに `list_handles` / `resolve_range` を追加、`list_images` / `get_first_image` を削除 |
| `core_logic/src/image_container/archive.rs` | `list_image_handles`（ZIPヘッダ読み取りのみ）と `resolve_range`（チャンク展開）を実装 |
| `core_logic/src/image_container/folder.rs` | `list_image_handles`（ディレクトリスキャン）と `resolve_range`（スライス返却）を実装 |
| `core_logic/src/fs.rs` | `list_images_in_container` を削除、`list_image_handles` / `resolve_images_in_range` を追加 |
| `src/commands/fs.rs` | Tauriコマンドを2つに分割 |

### TypeScript (フロントエンド)

| ファイル | 変更内容 |
|---|---|
| `image-viewer/types/ImageContainer.ts` | `listHandles` / `resolveRange` に変更（破壊的） |
| `image-viewer/types/ImageSource.ts` | `ImageHandle` 型を追加 |
| `folder-navigation/services/FileSystemService.ts` | `listImagesInContainer` 削除、2メソッド追加 |
| `folder-navigation/containers/LocalFolderContainer.ts` | `ContainerConfig` 対応、2フェーズ実装 |
| `folder-navigation/hooks/useOpenImageFile.ts` | `listImageHandles` + basename照合に書き換え |
| `shared/adapters/tauriAdapters.ts` | 新2コマンドのinvoke実装 |
| `shared/hooks/data/useImages.ts` | `ImageContainer` を受け取る形に変更 |
| `features/image-viewer/components/ImageViewer.tsx` | `folderPath` → `container` props に変更 |
| `App.tsx` | `LocalFolderContainer` を生成して `ImageViewer` に渡す |
| `test/mocks.ts` / `dev/mockService.ts` | 新2メソッドのモックに更新 |

## 採用しなかった案とその理由

| 案 | 内容 | 不採用理由 |
|---|---|---|
| B単独（展開のみ遅延） | パスは全展開で取得し、表示だけ遅延 | ZIPのパス取得自体が展開を含むため根本解決にならない |
| ステートフルバックエンド（S） | RustがどのIndexが展開済みかを追跡 | UI都合の状態をバックエンドが持つことになり関心分離が崩れる |
| Hookがチャンク管理（C2/C3） | `useImages` や新フックがポリシーを持つ | ユーザー設定からの注入経路が不自然になる。ContainerConfigパターンと対称でない |
| T2（コマンドをフォルダ/ZIP別に分割） | フォルダ用・ZIP用のコマンドを別々に定義 | コンテナ抽象の目的（フロントが種別を知らない）に反する |
| E（インターフェース拡張・後方互換） | 旧 `listImages` を残しつつ新APIを追加 | 旧新API混在で「どちらを使うべきか」が曖昧になる |
| P1/P2（先読み実装） | 閾値ベースの先読みをViewerまたはHookに実装 | 今回のゴール（CPUスパイク解消）に対してスコープ過剰。計測後に判断する |

## 参考

- Linux VFS の `open()` / `read()` 分離（コンテナ抽象の参考モデル）
- Rust `Iterator` トレイトの遅延評価（チャンク取得のコスト隠蔽パターン）
- ORM の遅延ロードとN+1問題（チャンク単位取得が正しい対策である根拠）
- `ImageContainerReaderConfig`（`src-tauri/core_logic/src/image_container/reader_config.rs`）：ContainerConfigパターンの対称実装
