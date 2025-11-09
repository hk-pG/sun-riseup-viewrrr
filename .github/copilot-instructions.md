# sun-riseup-viewrrr - Copilot指示書

## 前提条件・基本方針

- **回答は必ず日本語でしてください。**
- チャットの初めに、このファイルの内容を確認していることを必ず伝えてください。
- MCPが利用できる状態であれば、使えるツールについて教えてください（多い場合は代表して3つの名前と概要のみで可）。
- ソースを変更した際には、**必ずビルド・lint・テストを実行し**、品質低下やデグレーションを検知してください。
- 問題が発生した場合には、すぐに対応しようとせず**現状報告を詳細にした後**、指示を待つようにしてください。
- 大きな変更をする際にはコミットはこまめにし、いつでも前の作業時点に戻れるようにしてください。

## プロジェクト概要
漫画やイラストコレクションを楽しむためのTauriベースの画像ビューアアプリケーション。フロントエンドはReact 19 + TypeScript、バックエンドはRust、機能ベースアーキテクチャを採用。

## アーキテクチャ

### 機能構成
- **app-shell**: メニューバー、グローバルアクション、アプリケーションクローム
- **folder-navigation**: サイドバー、フォルダ一覧、同階層フォルダ管理
- **image-viewer**: 画像表示、ビューアコントロール、キーボードナビゲーション
- **shared**: サービス抽象化、フック、ユーティリティ、UIコンポーネント

各機能は`index.ts`を通じてエクスポートされます。機能のルートからインポートしてください：`@/features/folder-navigation`

### 状態管理
- **ローカル状態**: コンポーネントレベルの状態は`useState`を使用
- **SWR**: キャッシュ付きデータフェッチング（`useImages`フック）
- **Context API**: 依存性注入（`ServiceContext`）、テーマ管理
- **useTransition**: フォルダ/画像切り替え時の非ブロッキング更新（画像ナビゲーションには使用しない）

状態管理をZustandでスケールする必要がある場合は`docs/state-management-analysis.md`を参照。

### 依存性注入パターン
Tauri APIは`FileSystemService`インターフェースを通じて抽象化されています：
```typescript
// src/shared/context/ServiceContext.tsx
const fs = useServices(); // FileSystemService実装を返す
```
テストではモックサービスを`<ServicesProvider services={mockService}>`経由で注入します。

### バックエンド統合
フロントエンドはTauriのinvokeを通じてRustコマンドを呼び出します：
```typescript
const images = await invoke<string[]>('list_images_in_folder', { folderPath });
```
`src-tauri/src/commands/fs.rs`のRustラッパーが`core_logic`クレートに処理を委譲します。

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

テストはVitest + `@testing-library/react`を使用。Tauriのモックは`src/test/mocks.ts`の`setupTauriMocks()`を使用。DIパターンの例は`src/__tests__/App.test.tsx`を参照。

## プロジェクト規約

### インポート
- エイリアス`@/`は`src/`にマッピング
- パス解決は`tsconfig.json`と`vite.config.ts`で設定
- 型インポートを使用：`import type { Foo } from 'bar'`（Biomeで強制）

### コンポーネントパターン
- React 19機能：`useTransition`、並行レンダリング
- Propsインターフェースはコンポーネントと同じ場所に配置
- フックは`hooks/`サブディレクトリに（`useFolderNavigator`、`useImages`）
- コンポーネントのストーリーは`stories/`サブディレクトリに

### スタイリング
- Tailwind CSS 4と`@tailwindcss/vite`
- shadcn/uiコンポーネントは`src/shared/components/ui/`に
- `ThemeProvider`によるテーマシステム（light/dark/system）
- Biomeが`useSortedClasses`でクラスのソートを強制

### 型安全性
- 厳密なTypeScript（`strict: true`、`noUnusedLocals`、`noImplicitReturns`）
- Props、状態、サービスのインターフェース定義
- 機能の型は`types/`サブディレクトリに（`folderTypes.ts`、`viewerTypes.ts`）

### メニューアクション
`App.tsx`のメニューアクションはインラインハンドラーを使用。アクションが5つ以上になった場合、`docs/menu-action-architecture.md`のCommand Registryパターンへの移行を検討：
```typescript
// TODO: useAppActionsフック + ActionRegistryの検討
const { executeAction } = useAppActions(appState, setAppState);
handleMenuAction = (actionId) => executeAction(actionId);
```

## 主要ファイルとパターン

### エントリーポイント
- `src/main.tsx`: Reactアプリのマウント
- `src/App.tsx`: ルートコンポーネント、状態のオーケストレーション
- `src-tauri/src/main.rs`: Tauriの初期化

### サービスアダプター
- `src/shared/adapters/tauriAdapters.ts`: FileSystemServiceの実装
- Tauriプラグイン使用：`@tauri-apps/plugin-dialog`、`@tauri-apps/plugin-fs`

### データフロー
1. ユーザーアクション → `App.tsx`ハンドラー
2. ハンドラーが`useServices()`を呼び出し → Tauriバックエンド
3. `startTransition`でラップされた`setState`による状態更新
4. SWRがキー変更時に再取得 → コンポーネント再レンダリング

### テスト戦略
- フックとユーティリティの単体テスト
- 機能の統合テスト（モックサービス使用）
- `@testing-library/react`によるコンポーネントテスト
- 実装の詳細をテストしない；ユーザーインタラクションをテスト

## 主要タスク

### ソース変更時の手順
1. **変更前の確認**
   - ライブラリ・APIの使い方をインターネット上から情報収集
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
3. `index.ts`を通じて公開APIをエクスポート
4. `__tests__/`サブディレクトリにテストを追加

### FileSystemServiceの拡張
1. `FileSystemService`インターフェースにメソッドを追加
2. `tauriAdapters.ts`でTauri APIを使用して実装
3. `src-tauri/src/commands/fs.rs`に対応するRustコマンドを追加
4. `src/test/mocks.ts`のテストモックを更新

## 注意すべき落とし穴
- 画像ナビゲーションを`useTransition`でラップしない（体感パフォーマンスが低下）
- Tauri APIを直接呼び出さない；テスト容易性のため`useServices()`を使用
- 機能間の循環依存を作成しない
- `any`型を使用しない（Biomeでwarnレベルだが、避けるべき）
- フォルダ変更時に`ImageViewer`の`key` propをスキップしない（クリーンな再マウントを強制）

## 参考資料
- `docs/library-separation-analysis.md`: ImageViewer分離戦略
- `docs/menu-action-architecture.md`: アクション用のCommandパターン
- `docs/state-management-analysis.md`: Zustand移行パス
- React 19ドキュメント: https://react.dev/blog/2024/12/05/react-19
- Tauri v2ドキュメント: https://v2.tauri.app/

## Active Technologies
- TypeScript 5.6+, React 19 + React 19 (React Compiler有効), Vite 6, Tailwind CSS 4, SWR, Tauri v2 (001-remove-manual-memoization)
- N/A（ローカルファイルシステム経由の画像アクセス） (001-remove-manual-memoization)
- TypeScript 5.6+, React 19 + shadcn/ui theme-provider, Tailwind CSS 4, Vite 6 (001-replace-theme-provider)
- localStorage for theme persistence (001-replace-theme-provider)

## Recent Changes
- 001-remove-manual-memoization: Added TypeScript 5.6+, React 19 + React 19 (React Compiler有効), Vite 6, Tailwind CSS 4, SWR, Tauri v2
