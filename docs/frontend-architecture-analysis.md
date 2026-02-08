# sun-riseup-viewrrr フロントエンド アーキテクチャ分析レポート

**作成日**: 2026-01-28  
**対象**: フロントエンド（React 19 + TypeScript）  
**スコープ**: 中規模スケールを見据えた健全性分析

---

## エグゼクティブサマリー

本プロジェクトは**機能ベースアーキテクチャ**を採用しており、基盤は堅実です。しかし、中規模へのスケール時に以下の主要課題が障壁となる可能性があります：

| 優先度 | 課題 | 影響度 |
|--------|------|--------|
| 🔴 高 | 状態管理の分散 | 機能追加・デバッグの複雑化 |
| 🔴 高 | インポートパスの混在 | 保守性低下・リファクタリング困難 |
| 🟡 中 | エラーハンドリングの一貫性欠如 | UX劣化・障害対応困難 |
| 🟡 中 | テストカバレッジの偏り | 品質保証の不安定さ |
| 🟢 低 | コードの重複（cn関数等） | 技術的負債の蓄積 |

---

## 1. 現状分析

### 1.1 アーキテクチャ構成

```
src/
├── features/                 # ✅ 機能ベース分割（良い設計）
│   ├── app-shell/           # メニュー、グローバルUI
│   ├── folder-navigation/   # サイドバー、フォルダ操作
│   └── image-viewer/        # 画像表示、コントロール
├── shared/                   # ✅ 共有リソース
│   ├── adapters/            # Tauri API抽象化
│   ├── context/             # DI用Context
│   ├── hooks/               # 共通フック
│   └── utils/               # ユーティリティ
├── components/               # ⚠️ ルートレベルのコンポーネント（整理余地）
├── lib/                      # ⚠️ 重複（shared/utilsと同内容）
└── test/                     # テストユーティリティ
```

### 1.2 技術スタック評価

| 技術 | 評価 | コメント |
|------|------|---------|
| React 19 + Compiler | ✅ 優秀 | 最新の並行機能を活用 |
| TypeScript strict | ✅ 優秀 | 厳密な型チェック有効 |
| SWR | ✅ 適切 | 現在の規模に最適 |
| Tauri DI パターン | ✅ 優秀 | テスタビリティ確保 |
| Biome | ✅ 優秀 | 高速なlint/format |

---

## 2. 識別された課題

### 2.1 🔴 状態管理の分散（高優先度）

**現状**:
- `App.tsx` に `useState` + `useTransition` でグローバル状態を管理
- 各機能コンポーネントが独自に `useState` を持つ
- SWR はデータフェッチのみ（キャッシュ以外の状態管理なし）

**問題点**:
```typescript
// App.tsx - 状態が一箇所に集中しすぎ
const [appState, setAppState] = useState<AppState>({
  currentFolderPath: '',
  initialImageIndex: 0,
});
```

- 機能追加時に `App.tsx` が肥大化
- 状態の依存関係が見えにくい
- コンポーネント間の状態共有が props drilling 必須

**スケール時の影響**:
- 新機能追加のたびに `App.tsx` を修正
- デバッグ時に状態の流れを追跡困難
- パフォーマンスチューニングの複雑化

---

### 2.2 🔴 インポートパスの混在（高優先度）

**現状**:
```typescript
// パターン1: エイリアス使用（推奨）
import { ServicesProvider } from '@/shared/context/ServiceContext';

// パターン2: 深い相対パス（非推奨）
import { useServices } from '../../../shared/context/ServiceContext';

// パターン3: 機能のindex.tsからの再エクスポート
import { FileSystemService } from '../../features/folder-navigation';
```

**検出された問題箇所** (21件):
- `src/shared/hooks/data/useImages.ts` → `../../../features/folder-navigation`
- `src/features/folder-navigation/containers/LocalFolderContainer.ts` → `../../../shared/utils/*`
- その他テストファイル多数

**問題点**:
- リファクタリング時のパス修正コストが高い
- どこから何をインポートすべきか不明確
- 循環依存のリスク

---

### 2.3 🟡 エラーハンドリングの一貫性欠如（中優先度）

**現状**:
```typescript
// パターン1: console.error + 空配列返却
listImagesInFolder: async (folderPath: string): Promise<string[]> => {
  try { ... }
  catch (error) {
    console.error(`Error listing images in folder ${folderPath}`, error);
    return [];  // 静かに失敗
  }
}

// パターン2: throw new Error
openDirectoryDialog: async (): Promise<string | null> => {
  try { ... }
  catch (error) {
    throw new Error(`error occurred during open folder ${error}`);
  }
}

// パターン3: カスタムエラークラス（未活用）
export class ThumbnailError extends Error { ... }
```

**問題点**:
- エラー発生時のUI表示が不統一
- サムネイル用の `ThumbnailError` が定義されているが活用されていない
- ユーザーへのフィードバック欠如

---

### 2.4 🟡 テストカバレッジの偏り（中優先度）

**現状**: 314テスト全パス（27ファイル）

| カテゴリ | テスト数 | 評価 |
|---------|---------|------|
| ユーティリティ | 多数 | ✅ 充実 |
| フック | 中程度 | ✅ 適切 |
| コンポーネント統合 | 少数 | ⚠️ 不足 |
| E2E/シナリオ | なし | 🔴 不足 |

**問題点**:
- `ImageViewer` のテストが2件のみ
- ユーザーシナリオテスト（フォルダ選択→画像表示→ナビゲーション）が不在
- `console.error` のモック漏れ（テスト出力に警告）

```
stderr | unknown test
Batch thumbnail prefetch failed: [Error: Failed to batch create thumbnails: ...]
```

---

### 2.5 🟢 コードの重複（低優先度）

**現状**:
```typescript
// src/lib/utils.ts と src/shared/utils/utils.ts が完全に同一
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**影響**:
- どちらを使うべきか混乱
- shadcn/ui のデフォルト構成との互換性維持

---

### 2.6 🟡 機能間の型依存（中優先度）

**現状**:
```typescript
// shared/context/ServiceContext.tsx
import type { FileSystemService } from '../../features/folder-navigation';

// shared/hooks/data/useImages.ts  
import { LocalFolderContainer } from '../../../features/folder-navigation';
```

**問題点**:
- `shared` が `features` に依存（逆方向の依存）
- `FileSystemService` インターフェースの配置が不適切

---

## 3. 改善提案

### 3.1 状態管理の改善

#### オプションA: Zustand導入（推奨）

**メリット**:
- 最小限のボイラープレート
- React 19 との親和性高
- DevTools でデバッグ容易
- 既存の `docs/state-management-analysis.md` に移行計画あり

**デメリット**:
- 新規依存追加
- 学習コスト（軽微）

**実装イメージ**:
```typescript
// stores/appStore.ts
export const useAppStore = create<AppState>((set) => ({
  currentFolderPath: '',
  initialImageIndex: 0,
  setFolder: (path) => set({ currentFolderPath: path, initialImageIndex: 0 }),
}));
```

#### オプションB: useReducer + Context

**メリット**:
- 追加依存なし
- React 標準パターン

**デメリット**:
- ボイラープレートが多い
- 複数 Store の管理が煩雑

#### オプションC: 現状維持 + App.tsx リファクタリング

**メリット**:
- 変更コスト最小

**デメリット**:
- スケール時に再度問題化

**推奨**: オプションA（Zustand）- 長期的な保守性を考慮

---

### 3.2 インポートパスの統一

#### 実施内容

1. **ルール策定**:
   ```
   - 機能内部: 相対パス（1-2階層まで）
   - 機能間/shared: エイリアス @/ 必須
   - テストファイル: エイリアス @/ 推奨
   ```

2. **Biome ルール追加**:
   ```json
   {
     "linter": {
       "rules": {
         "style": {
           "noRestrictedImports": {
             "level": "error",
             "options": {
               "paths": {
                 "../../..": "Use @/ alias for deep imports"
               }
             }
           }
         }
       }
     }
   }
   ```

3. **FileSystemService の移動**:
   ```
   移動前: src/features/folder-navigation/services/FileSystemService.ts
   移動後: src/shared/types/FileSystemService.ts
   ```

**メリット**: 保守性向上、リファクタリング容易化  
**デメリット**: 一時的な大量変更、既存ドキュメントの更新必要

---

### 3.3 エラーハンドリングの統一

#### 実施内容

1. **共通エラー型の定義**:
```typescript
// src/shared/types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
  }
}
```

2. **エラー境界の拡張**:
```typescript
// トースト通知との連携
// 回復可能なエラーの再試行UI
```

3. **アダプター層の統一**:
```typescript
// すべてのアダプターで AppError を throw
// console.error + 空配列返却パターンを廃止
```

**メリット**: UX向上、障害対応効率化  
**デメリット**: 既存コードの変更範囲が広い

---

### 3.4 テスト戦略の強化

#### 優先度付き実施項目

| 優先度 | 項目 | 工数 |
|--------|------|------|
| 1 | ImageViewer 統合テスト追加 | 小 |
| 2 | ユーザーシナリオテスト追加 | 中 |
| 3 | console.error モック整備 | 小 |
| 4 | E2E テスト基盤整備 | 大 |

**推奨ツール**: Playwright（既に devDependencies に存在）

---

### 3.5 コード重複の解消

#### 実施内容

```typescript
// src/lib/utils.ts を削除
// インポートを src/shared/utils/utils.ts に統一
// shadcn/ui 追加時の設定を components.json で調整
```

**メリット**: 混乱解消  
**デメリット**: shadcn/ui CLI との互換性確認必要

---

## 4. 優先順位付き実装ロードマップ

### フェーズ1: 基盤整備（1-2週間）

- [ ] インポートパスのルール策定・ドキュメント化
- [ ] `FileSystemService` の `shared/types` への移動
- [ ] `src/lib/utils.ts` の削除
- [ ] テストの console.error モック整備

### フェーズ2: エラーハンドリング（1週間）

- [ ] `AppError` クラスの実装
- [ ] アダプター層のエラー処理統一
- [ ] `ErrorBoundary` の拡張

### フェーズ3: 状態管理（2週間）

- [ ] Zustand 導入の検討・決定
- [ ] `useAppStore` の実装
- [ ] `App.tsx` のリファクタリング

### フェーズ4: テスト強化（継続）

- [ ] ImageViewer 統合テスト
- [ ] ユーザーシナリオテスト
- [ ] Playwright E2E テスト基盤

---

## 5. 結論

本プロジェクトは**健全な基盤**を持っていますが、中規模スケールに向けて以下の対応を推奨します：

1. **即座に対応**: インポートパスの統一、重複コードの解消
2. **計画的に対応**: 状態管理の改善（Zustand検討）、エラーハンドリング統一
3. **継続的に対応**: テストカバレッジの向上

これらの改善により、チーム開発への移行や機能追加時の開発効率が大幅に向上すると期待されます。

---

## 付録: 検出された技術的負債一覧

| ファイル | 問題 | 重要度 |
|---------|------|--------|
| `src/lib/utils.ts` | `src/shared/utils/utils.ts` と重複 | 低 |
| `src/shared/context/ServiceContext.tsx` | features への逆依存 | 中 |
| `src/shared/adapters/tauriAdapters.ts` | エラーハンドリング不統一 | 中 |
| `src/features/image-viewer/components/ImageViewer.tsx` | テストカバレッジ不足 | 中 |
| 21ファイル | 深い相対パスインポート | 中 |
