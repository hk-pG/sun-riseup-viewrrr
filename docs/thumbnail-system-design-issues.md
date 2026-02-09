# サムネイル生成システムの設計問題

**作成日**: 2026-02-09  
**対象**: サムネイル生成システム（フロントエンド・バックエンド連携）  
**ステータス**: 認識済み（対応未定）  

---

## エグゼクティブサマリー

現在のサムネイル生成システムは、**情報隠蔽（Encapsulation）の原則に違反**しており、フロントエンドがバックエンドの最適化戦略の詳細を知りすぎている状態です。これにより、関心事の混在、変更影響範囲の拡大、テスト困難性の増加といった技術的負債が蓄積しています。

| 問題の深刻度 | 項目 | 影響 |
|-------------|------|------|
| 🔴 高 | 情報隠蔽の破壊 | バックエンド実装変更がフロントに波及 |
| 🔴 高 | 責務の混在 | 表示ロジックと最適化戦略が分離されていない |
| 🟡 中 | テスト困難性 | バッチ・キャッシュ・優先度のモックが複雑 |
| 🟡 中 | 再利用性低下 | アプリ専用インターフェースになっている |

---

## 1. 現在の設計概要

### 1.1 インターフェース定義

```typescript
// FileSystemService.ts（抜粋）
export interface FileSystemService {
  // ... その他のメソッド ...
  
  /**
   * 画像のサムネイルを取得または生成する
   */
  getOrCreateThumbnail?(imagePath: string): Promise<string>;

  /**
   * 複数の画像のサムネイルをバッチ生成する
   * @param visibleCount 可視領域の画像数（優先度High）
   */
  batchCreateThumbnails?(
    imagePaths: string[],
    visibleCount?: number,  // ← 優先度制御をフロントが指定
  ): Promise<Record<string, { success: boolean; path?: string; error?: string }>>;

  /**
   * サムネイルキャッシュをクリアする（デバッグ用）
   */
  clearThumbnailCache?(): Promise<void>;
}
```

### 1.2 フロントエンドの実装詳細

```typescript
// useThumbnailPrefetch.ts（抜粋）
export function useThumbnailPrefetch(folders: FolderInfo[]) {
  const fs = useServices();

  useEffect(() => {
    // フォルダから画像パスを収集（フロントの責務では？）
    const visibleFolders = folders.slice(0, visibleCount).map((f) => f.path);
    const imagePathPromises = visibleFolders.map((folderPath) =>
      getFirstImagePath(folderPath, fs),  // ← フォルダ→画像パス変換
    );
    const imagePaths = (await Promise.all(imagePathPromises)).filter(...);

    // バッチ生成を実行（優先度付き）
    await fs.batchCreateThumbnails?.(imagePaths, imagePaths.length);
    // ↑ バックエンドに「バッチで」「これだけ優先度を上げて」指示
  }, [folders, fs, visibleCount, delay, disabled]);
}
```

### 1.3 データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│ フロントエンド                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Sidebar.tsx                                                     │
│   ↓ useThumbnailPrefetch(folders)                              │
│   ↓ ① フォルダリストから画像パスを収集                          │
│   ↓ ② 可視領域判定（visibleCount）                             │
│   ↓ ③ batchCreateThumbnails(imagePaths, visibleCount)          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ バックエンド（Rust）                                             │
├─────────────────────────────────────────────────────────────────┤
│ batch_create_thumbnails コマンド                                │
│   ↓ ④ visibleCountを受け取り、優先度Highを設定                  │
│   ↓ ⑤ バッチ処理でサムネイル生成                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 問題点の詳細分析

### 2.1 情報隠蔽の破壊（重大）

**問題**: フロントエンドがバックエンドの最適化戦略の詳細を知っている

| フロントが知っていること | あるべき状態 |
|------------------------|------------|
| 「バッチで生成した方が効率が良い」 | バックエンドが判断すべき |
| 「可視領域の件数をバックエンドに伝える必要がある」 | バックエンドが管理すべき |
| 「キャッシュをクリアできる」 | バックエンド内部の管理 |
| 「どの画像パスをサムネイル化すべきか」 | バックエンドが決定すべき |

**影響**: 
- バックエンドの最適化戦略を変更すると、フロントも修正が必要
- 例：「先読み戦略を変えたい」→ フロントの`useThumbnailPrefetch`を修正

### 2.2 責務の混在（重大）

**問題**: フロントが「表示ロジック」と「最適化戦略」の両方を担当している

```
【現在の責務分担】
フロント: 表示 + 最適化戦略（バッチ・優先度・キャッシュクリア）
バック: 画像処理

【あるべき責務分担】
フロント: 表示のみ（「このフォルダのサムネイルが欲しい」）
バック: 最適化戦略 + 画像処理
```

**具体的な問題コード**:
- `useThumbnailPrefetch.ts`: 67行にわたり、フォルダ→画像変換、バッチ呼び出し、エラーハンドリング
- `Sidebar.tsx`: プリフェッチのトリガー（`useThumbnailPrefetch(folders)`）

### 2.3 変更影響範囲の拡大（中）

**シナリオ**: 「バッチ処理ではなく個別処理に変更したい」場合

| 変更が必要なファイル | 行数 |
|-------------------|------|
| `FileSystemService.ts` | インターフェース変更 |
| `tauriAdapters.ts` | アダプター実装変更 |
| `useThumbnailPrefetch.ts` | フック全体の書き換え |
| `Sidebar.tsx` | プリフェッチ呼び出し変更 |
| テストファイル | 複数 |

**理想的な設計**なら、バックエンドのみの変更で済む

### 2.4 テスト困難性（中）

**問題**: インターフェースが複雑なため、モックが煩雑

```typescript
// テスト時の複雑なモック例
const mockFs: FileSystemService = {
  // ... 基本メソッド ...
  batchCreateThumbnails: vi.fn().mockResolvedValue({
    '/path/to/image1.jpg': { success: true, path: '/cache/abc.jpg' },
    '/path/to/image2.jpg': { success: false, error: 'Failed' },
  }),
  clearThumbnailCache: vi.fn().mockResolvedValue(undefined),
};

// バッチ結果のマッピングを検証する必要がある
```

**対比**: シンプルなインターフェースなら
```typescript
const mockFs: FileSystemService = {
  getThumbnail: vi.fn().mockResolvedValue({ id: '1', assetUrl: 'blob:...' }),
};
```

### 2.5 再利用性の低下（低）

**問題**: `batchCreateThumbnails`のような特化したインターフェースは、このアプリ専用

- `visibleCount`パラメータは「サイドバー表示」という特定のユースケースに依存
- 他のプロジェクトや異なるUI構成では使いにくい

---

## 3. 影響を受けるコンポーネント・フック

| ファイル | 行数 | 問題の内容 |
|---------|------|----------|
| `src/features/folder-navigation/services/FileSystemService.ts` | 32-60 | バッチ・キャッシュメソッドの定義 |
| `src/features/folder-navigation/hooks/useThumbnailPrefetch.ts` | 全87行 | バッチ処理呼び出し、画像パス収集 |
| `src/features/folder-navigation/hooks/useThumbnail.ts` | 20-40 | `getOrCreateThumbnail`の直接使用 |
| `src/shared/adapters/tauriAdapters.ts` | 85-125 | バッチAPIの実装 |
| `src/features/folder-navigation/components/Sidebar/Sidebar.tsx` | 31 | プリフェッチのトリガー |

---

## 4. 将来の改善案

### 案1: 「サムネイル要求」のみに絞る（推奨）

```typescript
// シンプルなインターフェース
interface ThumbnailService {
  /**
   * フォルダのサムネイルを取得
   * バックエンドが最適化戦略を隠蔽
   */
  getThumbnail(folderPath: string): Promise<ImageSource | null>;
}

// フロント側はシンプルに
function Sidebar({ folders }) {
  // 個別取得のみ、バッチ処理の知識不要
  const thumbnails = useSWR(
    folders.map(f => f.path),
    (paths) => Promise.all(paths.map(p => fs.getThumbnail(p)))
  );
}
```

**メリット**:
- フロントは「フォルダのサムネイルが欲しい」だけ
- バックエンドがバッチ/個別/キャッシュ戦略を自由に変更可能
- テストが容易（1つのメソッドのみモック）

**実装コスト**: 中（バックエンドにフォルダ→画像変換を移動）

### 案2: イベント駆動方式

```typescript
interface ThumbnailService {
  getThumbnail(imagePath: string): Promise<string>;
  
  /**
   * プリフェッチ依頼（「何を」だけ指定）
   * バックエンドが「どうやるか」を決定
   */
  prefetchThumbnails(folderPaths: string[]): void;
  
  /**
   * 結果はコールバック/イベントで通知
   */
  onThumbnailReady?: (folderPath: string, imageSource: ImageSource) => void;
}
```

**メリット**:
- 非同期処理の完了を通知できる
- フロントはフォルダパスのみ指定

**実装コスト**: 高（イベントシステムの導入が必要）

### 案3: 段階的リファクタリング

既存の`FileSystemService`は残しつつ、新しいインターフェースを追加：

```typescript
// 現状維持（後方互換）
interface FileSystemService {
  getOrCreateThumbnail?(imagePath: string): Promise<string>;
  batchCreateThumbnails?(...): Promise<...>;
  clearThumbnailCache?(): Promise<void>;
}

// 新しいシンプルインターフェース（段階的移行）
interface SimpleThumbnailService {
  getFolderThumbnail(folderPath: string): Promise<ImageSource | null>;
}
```

**実装コスト**: 低（段階的に移行可能）

---

## 5. 推奨アクション

### 短期（いますぐ）
1. 本ドキュメントをチームで共有し、問題認識を統一
2. 新機能追加時は、シンプルなインターフェースを検討

### 中期（次のリファクタリング時）
1. 案3「段階的リファクタリング」で新インターフェースを追加
2. 既存コードを新インターフェースに段階的に移行

### 長期（大幅リファクタリング時）
1. 案1「シンプルなインターフェース」への全面移行
2. `batchCreateThumbnails`などの詳細メソッドを非推奨化

---

## 6. 参考：理想的な責務分担

```
【あるべき設計】

フロントエンド                      バックエンド
─────────────────────────────────────────────────────────────
「このフォルダの                     最適化戦略を隠蔽：
 サムネイルが欲しい」               - バッチ/個別の判断
      ↓                            - 優先度キュー管理
  getThumbnail()                   - キャッシュ管理
      ↓                                  ↓
  画像を表示                      サムネイル生成

【メリット】
- フロントは表示に集中
- バックエンドの変更がフロントに波及しない
- テストが容易
- 再利用性が向上
```

---

## 関連ファイル

- `src/features/folder-navigation/services/FileSystemService.ts`
- `src/features/folder-navigation/hooks/useThumbnailPrefetch.ts`
- `src/features/folder-navigation/hooks/useThumbnail.ts`
- `src/shared/adapters/tauriAdapters.ts`
- `src/features/folder-navigation/components/Sidebar/Sidebar.tsx`
- `src-tauri/src/commands/thumbnail/` (Rust実装)

---

## 変更履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2026-02-09 | 初版作成 | - |
