# テスト戦略分析レポート

> 作成日: 2026年1月29日

## 概要

本ドキュメントは、sun-riseup-viewrrrプロジェクトのテスト戦略について分析した結果と改善提案をまとめたものです。

---

## 1. 現在のモック戦略の問題点

### 1.1 モック定義の重複

> ✅ **Issue #35 で解消済み**

現在の構成:

| ファイル | 役割 |
|---------|------|
| `src/test/mocks.ts` | Tauri APIモックの**シングルソースオブトゥルース** |
| `src/test/setup.ts` | `mocks.ts` の `setupTauriMocks()` を呼び出す形に統合済み |

- `invoke` のデフォルト値は `mockResolvedValue(null)` に統一
- モック設定は `mocks.ts` に一元化され、一貫性が確保されている

### 1.2 FileSystemServiceの型とモックの乖離リスク

各テストファイルが独自にモックを定義しており、インターフェースの変更時に更新漏れが発生しやすい。

| 箇所 | ファイルパス |
|------|-------------|
| インターフェース定義 | `src/features/folder-navigation/services/FileSystemService.ts` |
| 実装 | `src/shared/adapters/tauriAdapters.ts` |
| 各テストファイル | 個別にモック定義（重複多数） |

### 1.3 現在のFileSystemServiceインターフェース

```typescript
export interface FileSystemService {
  // 必須メソッド
  openDirectoryDialog: () => Promise<string | null>;
  getBaseName(filePath: string): Promise<string>;
  getDirName(filePath: string): Promise<string>;
  listImagesInFolder(folderPath: string): Promise<string[]>;
  getSiblingFolders(currentFolderPath: string): Promise<string[]>;
  convertFileSrc(filePath: string): string;

  // オプショナルメソッド
  openImageFileDialog?(extensions?: string[]): Promise<string | null>;
  getOrCreateThumbnail?(imagePath: string): Promise<string>;
  batchCreateThumbnails?(imagePaths: string[], visibleCount?: number): Promise<Record<...>>;
  clearThumbnailCache?(): Promise<void>;
}
```

### 1.4 機能ごとのAPI依存関係

| メソッド | folder-navigation | image-viewer | app-shell | shared/useImages |
|----------|:-----------------:|:------------:|:---------:|:----------------:|
| `openDirectoryDialog` | - | - | ✅ | - |
| `openImageFileDialog` | ✅ | - | - | - |
| `getBaseName` | ✅ | - | - | ✅ |
| `getDirName` | ✅ | - | - | - |
| `listImagesInFolder` | ✅ | - | - | ✅ |
| `getSiblingFolders` | ✅ | - | - | - |
| `convertFileSrc` | ✅ | - | - | ✅ |
| `getOrCreateThumbnail` | ✅ | - | - | - |
| `batchCreateThumbnails` | ✅ | - | - | - |

**注目点**: folder-navigationに依存が集中（8メソッド中8メソッドを使用）

---

## 2. 推奨するモック戦略

### 2.1 懸念への回答

| 懸念 | 回答 |
|------|------|
| 単体テストで使わないAPIの型が影響する | `ServicesProvider`は既に`Partial<FileSystemService>`対応済み。テストは必要なメソッドだけ定義すれば良い |
| 一箇所に集めると肥大化 | 「全部入り」ではなく、**最小限のデフォルト + 機能別プリセット**に分割 |

### 2.2 推奨アプローチ: 最小モック + プリセット

現在の `src/test/mocks.ts` は以下の構成で実装済み:

| エクスポート | 役割 |
|------------|------|
| `setupTauriMocks()` | 全 Tauri API モックのセットアップ（`setup.ts` から自動呼び出し） |
| `resetAllMocks()` | モックリセットユーティリティ |
| `createMockFileSystemServiceWithThumbnails()` | サムネイル用プリセット（将来用） |
| `mockStoreInstance` | Store モックインスタンス（export済み、テストから直接参照可能） |

今後、機能別プリセットが必要になった場合は以下のパターンで拡張可能:

```typescript
// 機能別プリセットの拡張例
export const mockPresets = {
  thumbnail: { 
    getOrCreateThumbnail: vi.fn().mockResolvedValue('/cache/thumb.jpg') 
  },
  dialog: { 
    openDirectoryDialog: vi.fn().mockResolvedValue('/selected') 
  },
  folder: {
    listImagesInFolder: vi.fn().mockResolvedValue(['/img1.jpg', '/img2.jpg']),
    getSiblingFolders: vi.fn().mockResolvedValue(['/folder1', '/folder2']),
  },
};
```

### 2.3 実装ステップ

1. **最小モックファクトリの追加**: `src/test/mocks.ts`に`createMinimalMock()`を追加
2. **機能別プリセットの分離**: `mockPresets.thumbnail`、`mockPresets.dialog`等に分割
3. **既存テストの段階的置換**: 新規テストから適用、既存は変更時に移行
4. **`satisfies`による型チェック**: ファクトリ内部のみで適用し、各テストでは柔軟性を維持

---

## 3. テスト品質の評価

### 3.1 統計サマリー

| 指標 | 値 |
|------|-----|
| 総テストファイル数 | 21 |
| 総テストケース数 | 約160+ |
| 🟢 良いテスト | 約150+ (94%) |
| 🟡 要注意テスト | 約10 (6%) |
| 🔴 問題のあるテスト | 0（Issue #33 で削除済み） |

### 3.2 評価基準

#### 🟢 良いテスト（振る舞いベース）
- ユーザーの視点でテスト（クリック、入力、表示確認）
- 公開APIの入出力をテスト
- 「何が起きるか」をテスト

#### 🟡 要注意テスト（グレーゾーン）
- 内部状態を直接確認しているが、振る舞いの検証も含む
- モックの呼び出し回数を検証（必要な場合もある）

#### 🔴 問題のあるテスト（実装詳細依存）
- 内部の関数名・変数名に依存
- 特定のDOM構造に強く依存
- リファクタリングで壊れるが機能は正常なケース

### 3.3 問題のあるテスト（🔴）

Issue #33 で以下の問題テストを削除済み:

- `src/test/__tests__/mocks.test.ts` — `expect(setupTauriMocks).toBeDefined()` のみで実質検証ゼロ。モック自体の動作は利用側テストで間接的に検証されている
- `src/__tests__/ViewerLayout.test.tsx` — jsdom にレイアウトエンジンがなく `scrollHeight`/`clientHeight` が常に 0 を返すため、テスト価値ゼロ。レイアウト検証が必要な場合は E2E テストに委譲すべき

### 3.4 要注意テスト（🟡）の例

| ファイル | 行 | 問題 |
|----------|-----|------|
| `src/__tests__/App.test.tsx` | L303-320 | `key` propの内部比較 |
| `src/components/ui/__tests__/theme-toggle.test.tsx` | L128 | `bg-primary` CSSクラス依存 |
| `src/features/image-viewer/components/__tests__/ImageViewer.test.tsx` | - | テストケース数が少ない、`useImages`呼び出し検証が実装詳細寄り |

### 3.5 高品質なテストの例（参考パターン）

| ファイル | 良い点 |
|----------|--------|
| `src/features/folder-navigation/components/FolderView.test.tsx` | 日本語で振る舞いを記述、ユーザー視点 |
| `src/shared/adapters/__tests__/tauriAdapters.test.ts` | 外部APIの入出力を網羅 |
| `src/features/image-viewer/hooks/__tests__/useControlsVisibility.test.ts` | フックの公開APIのみテスト |
| `src/shared/utils/__tests__/*.test.ts` | 純粋関数の入出力ベーステスト |

---

## 4. 改善アクションプラン

### 4.1 優先度: 高

| アクション | 詳細 |
|------------|------|
| ~~`mocks.test.ts`の修正~~ | ~~モックが実際に動作することを検証するか、削除を検討~~ → Issue #33 で削除済み |
| ~~モック定義の一元化~~ | ~~`setup.ts`と`mocks.ts`の重複を解消~~ → ✅ 完了（Issue #35） |

### 4.2 優先度: 中

| アクション | 詳細 |
|------------|------|
| 最小モックファクトリの実装 | `createMinimalMock()` + プリセットパターンの導入 |
| `ImageViewer.test.tsx`の拡充 | 画像表示、ナビゲーション、エラー状態の振る舞いテストを追加 |

### 4.3 優先度: 低

| アクション | 詳細 |
|------------|------|
| CSSクラス依存の解消 | `aria-*`属性や`data-state`属性での検証に置き換え |
| Rust型の自動生成導入 | `tauri-specta`または`ts-rs`でTypeScript型を自動生成 |

---

## 5. 検討事項

### 5.1 Rust型自動生成ツールの選定

| ツール | 特徴 |
|--------|------|
| `tauri-specta` | Tauri公式推奨、invokeの型安全性向上 |
| `ts-rs` | シンプル、汎用的 |

**推奨**: API変更頻度が高まったタイミングで導入を検討

### 5.2 インターフェース分割の是非

現状`FileSystemService`は10メソッド。将来15+に増えた場合：
- `PathService`
- `DialogService`
- `FolderService`
- `ThumbnailService`

への分割を検討。現時点ではプリセット方式で十分。

### 5.3 E2Eテストの導入

`ImageViewer`などの視覚的コンポーネントは、Playwright等でのE2Eテストが効果的な可能性がある。

---

## 6. 結論

**現在のテストは全体的に高品質**（94%が振る舞いベース）。`copilot-instructions.md`の「実装の詳細をテストしない；ユーザーインタラクションをテスト」という原則がよく守られています。

偽陽性リスクは低く、以下の軽微な改善でテストの信頼性と保守性がさらに向上します：

1. モック戦略の整理（最小モック + プリセット）
2. 問題のある2件のテストの修正
3. `ImageViewer`のテストカバレッジ向上
