# Data Model: React 19セキュリティパッチ適用

**Feature**: 002-react-security-patch  
**Date**: 2025-12-30  
**Status**: Complete

## Overview

本機能は依存関係の更新のみを行い、アプリケーションの既存データモデルに変更を加えない。したがって、新しいエンティティの定義やデータスキーマの変更は不要である。

---

## Existing Data Model (No Changes)

### FileSystemService Interface
既存の`FileSystemService`インターフェース（`src/shared/context/ServiceContext.tsx`）は変更なし。

### Image and Folder Types
既存の画像およびフォルダ型定義（`src/features/folder-navigation/types/`、`src/features/image-viewer/types/`）は変更なし。

### Theme Management
既存のテーマ管理（`src/components/theme-provider.tsx`）は変更なし。

---

## Package Management Entities

本機能で管理する唯一の「データ」は依存関係のバージョン情報である。

### package.json
**説明**: プロジェクトの依存関係を定義するNPMパッケージマニフェスト

**管理対象フィールド**:
- `dependencies.react`: Reactライブラリのバージョン
- `dependencies.react-dom`: React DOMのバージョン
- `devDependencies.@types/react`: React型定義のバージョン
- `devDependencies.@types/react-dom`: React DOM型定義のバージョン
- `devDependencies.babel-plugin-react-compiler`: React Compilerのバージョン
- `devDependencies.@testing-library/react`: Testing Libraryのバージョン

**バージョン形式**: セマンティックバージョニング（SemVer）
- 例: `^19.1.4`（19.1.4以上19.2.0未満）

**更新ルール**:
- reactとreact-domは常に同じバージョンを維持
- 型定義（@types/*）は対応するライブラリバージョンと互換性を持つ最新版を使用

### pnpm-lock.yaml
**説明**: pnpmパッケージマネージャーの依存関係ロックファイル

**役割**:
- 依存関係の正確なバージョンとハッシュを記録
- チーム全体で依存関係の再現性を保証
- ロールバック時の依存関係復元を可能にする

**更新タイミング**:
- `pnpm install`または`pnpm update`実行時に自動更新
- Gitにコミットし、バージョン管理下に置く

---

## Version Transition States

### Phase 1: Security Patch
**開始状態**:
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "@types/react": "^19.1.13",
  "@types/react-dom": "^19.1.9"
}
```

**終了状態**:
```json
{
  "react": "^19.1.4",
  "react-dom": "^19.1.4",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.1.19"
}
```

### Phase 2: React Compiler Stable
**開始状態**:
```json
{
  "babel-plugin-react-compiler": "19.1.0-rc.3"
}
```

**終了状態**:
```json
{
  "babel-plugin-react-compiler": "1.0.0"
}
```

### Phase 3: Testing Library Update
**開始状態**:
```json
{
  "@testing-library/react": "16"
}
```

**終了状態**:
```json
{
  "@testing-library/react": "16.3.1"
}
```

### Phase 4 (Optional): Latest Stable
**開始状態**:
```json
{
  "react": "^19.1.4",
  "react-dom": "^19.1.4"
}
```

**終了状態**:
```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3"
}
```

---

## Validation Rules

### Version Consistency
- `react`と`react-dom`のバージョンは一致しなければならない
- `@types/react`のバージョンは`react`のバージョンと互換性を持たなければならない

### Security Requirements
- Phase 1完了後、reactとreact-domは19.1.4以上でなければならない（セキュリティ脆弱性修正版）

### Rollback Safety
- 各フェーズ完了後、`package.json`と`pnpm-lock.yaml`の両方をGitにコミット
- ロールバック時は`git revert`でコミットを取り消し、`pnpm install`で依存関係を復元

---

## State Transitions

```
[Phase 0: Initial] 
    React 19.1.1 (vulnerable)
    ↓
[Phase 1: Security Patch]
    React 19.1.4 (secure)
    ↓
[Phase 2: Compiler Stable]
    React Compiler 1.0.0 (stable)
    ↓
[Phase 3: Testing Update]
    @testing-library/react 16.3.1 (latest)
    ↓
[Phase 4: Optional Latest]
    React 19.2.3 (optional)
```

各状態遷移はGitコミットで記録され、前の状態へのロールバックが可能。

---

## No Application Data Changes

**重要**: 本機能はパッケージ依存関係のバージョン更新のみを行い、以下には影響しない：

- アプリケーションの状態管理（React state、SWR cache）
- ファイルシステムのデータ（画像ファイル、フォルダ構造）
- ユーザー設定（Tauri Store、localStorage）
- UIコンポーネントのプロパティやインターフェース
- データフロー（ServiceContext、依存性注入パターン）

既存のデータモデルとアーキテクチャは完全に維持される。
