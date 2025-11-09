# sun-riseup-viewrrr - Copilot 指示書

## 前提条件・基本方針

- **回答は必ず日本語でしてください。**
- チャットの初めに、このファイルの内容を確認していることを必ず伝えてください。
- MCP が利用できる状態であれば、使えるツールについて教えてください（多い場合は代表して 3 つの名前と概要のみで可）。
- ソースを変更した際には、**必ずビルド・lint・テストを実行し**、品質低下やデグレーションを検知してください。
- 問題が発生した場合には、すぐに対応しようとせず**現状報告を詳細にした後**、指示を待つようにしてください。
- 大きな変更をする際にはコミットはこまめにし、いつでも前の作業時点に戻れるようにしてください。
- **コミットメッセージは必ず日本語で記述**してください。個人プロジェクトのため、変更内容の理解と振り返りを容易にします。

## プロジェクト概要

漫画やイラストコレクションを楽しむための Tauri ベースの画像ビューアアプリケーション。フロントエンドは React 19 + TypeScript、バックエンドは Rust、機能ベースアーキテクチャを採用。

## アーキテクチャ

### 機能構成

- **app-shell**: メニューバー、グローバルアクション、アプリケーションクローム
- **folder-navigation**: サイドバー、フォルダ一覧、同階層フォルダ管理
- **image-viewer**: 画像表示、ビューアコントロール、キーボードナビゲーション
- **shared**: サービス抽象化、フック、ユーティリティ、UI コンポーネント

各機能は`index.ts`を通じてエクスポートされます。機能のルートからインポートしてください：`@/features/folder-navigation`

### 状態管理

- **ローカル状態**: コンポーネントレベルの状態は`useState`を使用
- **SWR**: キャッシュ付きデータフェッチング（`useImages`フック）
- **Context API**: 依存性注入（`ServiceContext`）、テーマ管理
- **useTransition**: フォルダ/画像切り替え時の非ブロッキング更新（画像ナビゲーションには使用しない）

状態管理を Zustand でスケールする必要がある場合は`docs/state-management-analysis.md`を参照。

### 依存性注入パターン

Tauri API は`FileSystemService`インターフェースを通じて抽象化されています：

```typescript
// src/shared/context/ServiceContext.tsx
const fs = useServices(); // FileSystemService実装を返す
```

テストではモックサービスを`<ServicesProvider services={mockService}>`経由で注入します。

### バックエンド統合

フロントエンドは Tauri の invoke を通じて Rust コマンドを呼び出します：

```typescript
const images = await invoke<string[]>("list_images_in_folder", { folderPath });
```

`src-tauri/src/commands/fs.rs`の Rust ラッパーが`core_logic`クレートに処理を委譲します。

## 開発ワークフロー

### ビルド & 実行

```bash
pnpm install              # 依存関係のインストール
pnpm tauri dev            # ホットリロード付き開発モード
pnpm tauri build          # 本番ビルド
pnpm dev                  # フロントエンドのみの開発（Vite）
```

### コード品質

```bash
pnpm lint                 # Biomeによるチェック（lint）
pnpm lint:apply           # 安全な問題を自動修正
pnpm format               # コードフォーマット
pnpm type-check           # TypeScript検証
```

### テスト

```bash
pnpm test                 # Vitestテストを実行
pnpm test:watch           # ウォッチモード
pnpm storybook            # コンポーネントプレイグラウンド
```

テストは Vitest + `@testing-library/react`を使用。Tauri のモックは`src/test/mocks.ts`の`setupTauriMocks()`を使用。DI パターンの例は`src/__tests__/App.test.tsx`を参照。

### コミットメッセージ

```bash
git commit -m "feat: 機能追加の説明

## 変更内容
- 追加した機能の詳細説明
- 修正した問題の説明

## 技術的変更
- ファイル変更の具体的内容
- 破壊的変更がある場合はその詳細

## 検証結果
- テスト結果
- 品質ゲートの確認結果"
```

**コミットメッセージは必ず日本語で記述**してください。個人プロジェクトのため日本語での記録が望ましく、変更内容の理解と振り返りが容易になります。

## プロジェクト規約

### インポート

- エイリアス`@/`は`src/`にマッピング
- パス解決は`tsconfig.json`と`vite.config.ts`で設定
- 型インポートを使用：`import type { Foo } from 'bar'`（Biome で強制）

### コンポーネントパターン

- React 19 機能：`useTransition`、並行レンダリング
- Props インターフェースはコンポーネントと同じ場所に配置
- フックは`hooks/`サブディレクトリに（`useFolderNavigator`、`useImages`）
- コンポーネントのストーリーは`stories/`サブディレクトリに

### スタイリング

- Tailwind CSS 4 と`@tailwindcss/vite`
- shadcn/ui コンポーネントは`src/shared/components/ui/`に
- `ThemeProvider`によるテーマシステム（light/dark/system）
- Biome が`useSortedClasses`でクラスのソートを強制

### 型安全性

- 厳密な TypeScript（`strict: true`、`noUnusedLocals`、`noImplicitReturns`）
- Props、状態、サービスのインターフェース定義
- 機能の型は`types/`サブディレクトリに（`folderTypes.ts`、`viewerTypes.ts`）

### メニューアクション

`App.tsx`のメニューアクションはインラインハンドラーを使用。アクションが 5 つ以上になった場合、`docs/menu-action-architecture.md`の Command Registry パターンへの移行を検討：

```typescript
// TODO: useAppActionsフック + ActionRegistryの検討
const { executeAction } = useAppActions(appState, setAppState);
handleMenuAction = (actionId) => executeAction(actionId);
```

## 主要ファイルとパターン

### エントリーポイント

- `src/main.tsx`: React アプリのマウント
- `src/App.tsx`: ルートコンポーネント、状態のオーケストレーション
- `src-tauri/src/main.rs`: Tauri の初期化

### サービスアダプター

- `src/shared/adapters/tauriAdapters.ts`: FileSystemService の実装
- Tauri プラグイン使用：`@tauri-apps/plugin-dialog`、`@tauri-apps/plugin-fs`

### データフロー

1. ユーザーアクション → `App.tsx`ハンドラー
2. ハンドラーが`useServices()`を呼び出し → Tauri バックエンド
3. `startTransition`でラップされた`setState`による状態更新
4. SWR がキー変更時に再取得 → コンポーネント再レンダリング

### テスト戦略

- フックとユーティリティの単体テスト
- 機能の統合テスト（モックサービス使用）
- `@testing-library/react`によるコンポーネントテスト
- 実装の詳細をテストしない；ユーザーインタラクションをテスト

## 主要タスク

### ソース変更時の手順

1. **変更前の確認**

   - ライブラリ・API の使い方をインターネット上から情報収集
   - `package.json`を参考に利用中のバージョンで使えること・推奨される用法であることを確認
   - そうでない場合は、変更方法について一度確認を取る

2. **変更の実施**

   - 変更後に自らコードレビューを行う
   - 編集したコードのメリット・デメリットを把握して報告
   - その後への影響を解析して報告

3. **品質確認（必須）**
   ```bash
   pnpm type-check    # TypeScript検証
   pnpm lint          # Biomeによるlint
   pnpm test          # テスト実行
   pnpm build         # ビルド確認（必要に応じて）
   ```
   - `package.json`の`scripts`を参照してコマンドを選定
   - 既存のもので不十分な場合は、変更・追加・修正を提案

### メニューアクションの追加

1. `features/app-shell/types/menuTypes.ts`の`AppMenuBarEvent`型にイベントを追加
2. `App.tsx`の`handleMenuAction`にハンドラーを追加（現時点ではインライン）
3. `AppMenuBar`コンポーネントを更新して新しいイベントを発行

### 機能の追加

1. `src/features/new-feature/`を作成し、構造は：`components/`、`hooks/`、`types/`、`index.ts`
2. `types/`サブディレクトリに型を定義
3. `index.ts`を通じて公開 API をエクスポート
4. `__tests__/`サブディレクトリにテストを追加

### FileSystemService の拡張

1. `FileSystemService`インターフェースにメソッドを追加
2. `tauriAdapters.ts`で Tauri API を使用して実装
3. `src-tauri/src/commands/fs.rs`に対応する Rust コマンドを追加
4. `src/test/mocks.ts`のテストモックを更新

## 注意すべき落とし穴

- 画像ナビゲーションを`useTransition`でラップしない（体感パフォーマンスが低下）
- Tauri API を直接呼び出さない；テスト容易性のため`useServices()`を使用
- 機能間の循環依存を作成しない
- `any`型を使用しない（Biome で warn レベルだが、避けるべき）
- フォルダ変更時に`ImageViewer`の`key` prop をスキップしない（クリーンな再マウントを強制）

## 参考資料

- `docs/library-separation-analysis.md`: ImageViewer 分離戦略
- `docs/menu-action-architecture.md`: アクション用の Command パターン
- `docs/state-management-analysis.md`: Zustand 移行パス
- React 19 ドキュメント: https://react.dev/blog/2024/12/05/react-19
- Tauri v2 ドキュメント: https://v2.tauri.app/

## Active Technologies

- TypeScript 5.6+, React 19 + React 19 (React Compiler 有効), Vite 6, Tailwind CSS 4, SWR, Tauri v2 (001-remove-manual-memoization)
- N/A（ローカルファイルシステム経由の画像アクセス） (001-remove-manual-memoization)
- TypeScript 5.6+, React 19 + shadcn/ui theme-provider, Tailwind CSS 4, Vite 6 (001-replace-theme-provider)
- localStorage for theme persistence (001-replace-theme-provider)

## Recent Changes

- 001-remove-manual-memoization: Added TypeScript 5.6+, React 19 + React 19 (React Compiler 有効), Vite 6, Tailwind CSS 4, SWR, Tauri v2
