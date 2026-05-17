# テスト戦略再分析レポート

> 作成日: 2026年5月17日
> 対象ブランチ: `feature/issue-1-support-archive-file`
> 位置づけ: `docs/testing-strategy.md` (削除済み)に残る未対応項目と、現行コードベースの再分析結果をまとめた現況レポート

## 1. 要約

- 高優先度で挙がっていた「モック定義の一元化」は対応済み。
- `ServicesProvider` の `Partial<FileSystemService>` 対応も実装済み。
- 旧レポートが前提にしていた `getSiblingFolders` / `getOrCreateThumbnail` 系 API は、現行では `getSiblingContainers` / `getFolderThumbnail` / `prefetchFolderThumbnails` に置き換わっている。
- 中優先度以下の課題は一部残存しており、とくに `ImageViewer` の振る舞いテスト不足と `ThemeSelector` の CSS クラス依存は継続課題。
- 圧縮ファイル対応の観点では、「folder」前提より「container」前提へ抽象が進んでおり、テスト戦略もその前提で整理し直す必要がある。

## 2. 旧レポートの未対応項目の現在地

| 項目 | 2026-01 時点の整理 | 2026-05 時点の状況 | 根拠 |
|------|-------------------|-------------------|------|
| モック定義の一元化 | 高優先度、Issue #35 で解消済み | 対応済み | `src/test/mocks.ts` と `src/test/setup.ts` に集約 |
| `Partial<FileSystemService>` 対応 | 懸念への回答として記載 | 対応済み | `src/shared/context/ServiceContext.tsx` の `services?: Partial<FileSystemService>` |
| `createMinimalMock()` 導入 | 中優先度 | 未対応 | 現行は `createMockFileSystemService()` のみ |
| `mockPresets` 分離 | 中優先度 | 未対応 | `src/test/mocks.ts` に `mockPresets` は未定義 |
| `satisfies` による型チェック整理 | 中優先度 | 未対応 | モックファクトリに `satisfies` 適用なし |
| `ImageViewer.test.tsx` の拡充 | 中優先度 | 未対応 | 画像表示・ナビゲーション・エラーの振る舞い検証が不足 |
| CSS クラス依存の解消 | 低優先度 | 未対応 | `theme-toggle.test.tsx` が `bg-primary` に依存 |
| Rust 型自動生成 | 低優先度 | 未着手 | `package.json` / `Cargo.toml` に `tauri-specta` / `ts-rs` 導入なし |
| インターフェース分割 | 検討事項 | 未着手 | `PathService` 等への分割は未実施 |

## 3. 現行コードベースの再分析

### 3.1 テスト基盤

現行のテスト基盤は、旧レポート時点より整理が進んでいる。

- `src/test/mocks.ts`
  - Tauri API モックのセットアップを `setupTauriMocks()` に集約
  - `resetAllMocks()` を提供
  - 共通の `createMockFileSystemService()` を提供
  - サムネイル向けの `createMockFileSystemServiceWithThumbnails()` を提供
- `src/test/setup.ts`
  - `setupTauriMocks()` を呼び出し、グローバルなテスト初期化を一本化
- `src/shared/context/ServiceContext.tsx`
  - `ServicesProvider` が `Partial<FileSystemService>` を受け取るため、テスト側は必要な API だけ差し替えられる

このため、「各テストが毎回フルモックを自前定義する」状態からはかなり改善している。一方で、最小モックと機能別プリセットへの分離までは進んでいない。

### 3.2 `FileSystemService` の現況

旧レポートの API 記述は現状と一致していない。現行の `FileSystemService` は次の構成になっている。

```typescript
export interface FileSystemService {
  openDirectoryDialog(): Promise<string | null>;
  openImageFileDialog?(extensions?: string[]): Promise<string | null>;
  getBaseName(filePath: string): Promise<string>;
  getDirName(filePath: string): Promise<string>;
  listImagesInFolder(folderPath: string): Promise<string[]>;
  getSiblingContainers(currentContainerPath: string): Promise<string[]>;
  convertFileSrc(filePath: string): string;
  getFolderThumbnail(folderPath: string): Promise<FolderThumbnailResult | null>;
  prefetchFolderThumbnails(folderPaths: string[]): Promise<void>;
}
```

重要な差分は以下の通り。

- `getSiblingFolders` ではなく `getSiblingContainers`
  - フォルダに加えてアーカイブを含む抽象へ寄せている
- 旧サムネイル API 群ではなく `getFolderThumbnail` / `prefetchFolderThumbnails`
  - バックエンド主導のサムネイル取得に寄せている

この差分は、圧縮ファイル対応でテスト観点を「フォルダ専用」から「コンテナ共通」へ切り替える必要があることを示している。

### 3.3 テスト資産のスナップショット

2026年5月17日時点では、`src` 配下に 28 個のテストファイルを確認した。旧レポートの「21 ファイル」より増えており、主に以下の領域がカバーされている。

- app-shell のアクションとメニューバー
- folder-navigation の hooks / services / components
- image-viewer の hooks と一部 components
- shared/adapters の Tauri 境界
- shared/utils の純粋関数

高品質な例として、次のテストは現在も参考になる。

- `src/features/folder-navigation/components/FolderView.test.tsx`
  - 表示と画像有無をユーザー観測可能な結果で検証している
- `src/shared/adapters/__tests__/tauriAdapters.test.ts`
  - 外部 API 境界の入出力を明確に検証している
- `src/features/image-viewer/hooks/__tests__/useControlsVisibility.test.ts`
  - フックの公開 API とタイマー挙動を中心に検証している

### 3.4 要注意テストの現況

#### 1. `App.test.tsx`

旧レポートでは `key` prop の内部比較が要注意として挙がっていたが、現行の該当テストは表示内容の変化を確認する形になっており、問題は概ね解消している。

ただし、テスト名には `new key` という内部実装寄りの表現が残っているため、名称だけは振る舞いベースに寄せる余地がある。

#### 2. `theme-toggle.test.tsx`

現行でも `ThemeSelector` の選択状態検証は `bg-primary` クラスに依存している。これは見た目の実装詳細に結びついており、テーマ切り替え UI のマークアップ変更で壊れやすい。

将来的には、コンポーネント側で `aria-pressed` や `data-state` を露出して、テストを状態ベースに切り替えるのが望ましい。

#### 3. `ImageViewer.test.tsx`

現行のコンポーネントテストは 2 ケースのみで、以下の不足がある。

- 読み込み中の表示
- エラー時の表示
- 画像がある場合の表示切り替え
- 初期 index やナビゲーションに関わる振る舞い

また、`useImages('/test/folder')` の呼び出し検証はフック内部の接続確認としては意味があるが、コンポーネントの振る舞い検証としては弱い。

## 4. 圧縮ファイル対応への示唆

圧縮ファイル対応ブランチでは、既に API の語彙が `folder` から `container` へ拡張されつつある。このため、今後のテスト戦略では以下を明示した方がよい。

1. フォルダとアーカイブを同じ「コンテナ」として扱う回帰テスト範囲
2. 一時展開やキャッシュ無効化を含むバックエンド依存境界のテスト方針
3. ナビゲーション、サムネイル、エラー UX をまたぐ E2E 観点

旧レポートにあった「folder-navigation に依存が集中している」という観察は、現状でも大きくは変わらない。ただし、集中先の責務はフォルダ専用ではなく、コンテナ共通の基盤へ寄っている。

## 5. 推奨アクション

### 優先度: 高

1. 旧レポートを現況参照として使うのをやめ、この文書を現行レポートとして扱う
2. 圧縮ファイル対応の検討資料では `docs/testing-strategy.md` ではなく本書を参照する

### 優先度: 中

1. `ImageViewer.test.tsx` を振る舞いベースで拡充する
2. `createMockFileSystemService()` を土台に、必要なら最小モック + プリセットへ段階的に寄せる

### 優先度: 低

1. `ThemeSelector` の選択状態をアクセシブルな属性で露出し、CSS クラス依存テストを外す
2. Rust と TypeScript の型契約自動生成を再検討する

## 6. 参照方針

- `docs/testing-strategy.md`
  - 2026年1月時点の分析レポートとして保持する
- `docs/testing-strategy-2026-05.md`
  - 現行コードベースの再分析結果として参照する

将来さらに大きく状況が変わった場合は、このファイルを直接延命するよりも、日付つきの後続レポートを追加して履歴を積み上げる方が混乱を避けやすい。