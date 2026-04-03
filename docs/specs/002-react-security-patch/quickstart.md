# Quickstart: React 19セキュリティパッチ適用

**Feature**: 002-react-security-patch  
**Estimated Time**: 2-4 hours  
**Prerequisites**: pnpm installed, Git configured

---

## Overview

このガイドは、React 19のセキュリティ脆弱性（CVE-2025-55182他）を修正するために、4段階に分けて依存関係を更新する手順を示す。各段階は独立してテスト可能で、問題が発生した場合はGitのコミット単位でロールバックできる。

---

## Pre-Flight Checklist

実行前に以下を確認：

- [ ] 作業ブランチ: `002-react-security-patch`をチェックアウト済み
- [ ] 依存関係: 現在のバージョンを確認（`pnpm list react react-dom`）
- [ ] 変更のバックアップ: 未コミットの変更がないか確認（`git status`）
- [ ] テスト環境: テストが正常に実行できるか確認（`pnpm test`）

---

## Phase 1: Security Patch（必須）

**目的**: React 19.1.4へ更新し、セキュリティ脆弱性を修正する

### Step 1.1: 依存関係の更新

```bash
# package.jsonを更新
pnpm add react@19.1.4 react-dom@19.1.4

# 型定義を更新
pnpm add -D @types/react@19.2.7 @types/react-dom@19.1.19
```

### Step 1.2: ロックファイルの確認

```bash
# pnpm-lock.yamlが更新されたことを確認
git diff pnpm-lock.yaml

# 期待される変更: react@19.1.4, react-dom@19.1.4が含まれている
```

### Step 1.3: 型チェック

```bash
pnpm type-check
```

**Expected**: エラーなし  
**If Errors**: 型定義のバージョン不整合が原因の場合、@types/reactのバージョンを調整

### Step 1.4: Lint実行

```bash
pnpm lint
```

**Expected**: エラーなし  
**If Warnings**: 重大でなければ続行可（後で修正）

### Step 1.5: テスト実行

```bash
pnpm test
```

**Expected**: すべてのテストが成功  
**If Failures**: テストのモック設定を確認（`src/test/mocks.ts`）

### Step 1.6: ビルド確認

```bash
pnpm build
```

**Expected**: ビルド成功  
**If Errors**: Vite設定またはReact Compilerの問題を確認

### Step 1.7: 動作確認

```bash
pnpm tauri dev
```

**手動テスト**:
1. アプリケーションが起動する
2. フォルダを選択できる
3. 画像を表示できる
4. キーボードナビゲーション（矢印キー）が動作する
5. テーマ切り替えが動作する

### Step 1.8: コミット

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: React 19.1.4へ更新（セキュリティパッチ）

## 変更内容
- react/react-domを19.1.1から19.1.4に更新
- @types/reactを19.1.13から19.2.7に更新
- CVE-2025-55182（CVSS 10.0）の脆弱性を修正

## 検証結果
- 型チェック: ✅
- Lint: ✅
- テスト: ✅
- ビルド: ✅
- 手動テスト: ✅"
```

**Rollback**: `git revert HEAD && pnpm install`

---

## Phase 2: React Compiler Stable（推奨）

**目的**: React CompilerをRCから安定版（1.0.0）へ移行する

### Step 2.1: Compiler更新

```bash
pnpm add -D babel-plugin-react-compiler@1.0.0
```

### Step 2.2: 型チェック

```bash
pnpm type-check
```

**Expected**: エラーなし

### Step 2.3: テスト実行

```bash
pnpm test
```

**Expected**: すべてのテストが成功

### Step 2.4: ビルド確認

```bash
pnpm build
```

**Expected**: ビルド成功、最適化の警告がないか確認

### Step 2.5: パフォーマンス確認

```bash
pnpm tauri dev
```

**手動テスト**:
1. 画像切り替えのパフォーマンスが低下していないか
2. フォルダナビゲーションがスムーズか
3. React DevTools Profilerで再レンダリング頻度を確認

**Performance Baseline**: Phase 1と比較して±5%以内

### Step 2.6: コミット

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: React Compilerを1.0.0安定版へ更新

## 変更内容
- babel-plugin-react-compilerを19.1.0-rc.3から1.0.0に更新
- RC版からstable版へ移行

## 検証結果
- 型チェック: ✅
- テスト: ✅
- ビルド: ✅
- パフォーマンス: ±5%以内"
```

**Rollback**: `git revert HEAD && pnpm install`

---

## Phase 3: Testing Library Update（推奨）

**目的**: @testing-library/reactを最新版（16.3.1）へ更新する

### Step 3.1: Testing Library更新

```bash
pnpm add -D @testing-library/react@16.3.1
```

### Step 3.2: テスト実行

```bash
pnpm test
```

**Expected**: すべてのテストが成功  
**If Failures**: Testing Libraryの変更によるAPI差異を確認

### Step 3.3: Lint実行

```bash
pnpm lint
```

**Expected**: エラーなし

### Step 3.4: コミット

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: @testing-library/reactを16.3.1に更新

## 変更内容
- @testing-library/reactを16から16.3.1に更新
- React 19互換性を向上

## 検証結果
- テスト: ✅
- Lint: ✅"
```

**Rollback**: `git revert HEAD && pnpm install`

---

## Phase 4: Latest Stable（オプション）

**目的**: React 19.2.3（最新安定版）へ更新する（オプション）

### Step 4.1: React更新

```bash
pnpm add react@19.2.3 react-dom@19.2.3
```

### Step 4.2: 型定義更新

```bash
# 必要に応じて型定義も更新
pnpm add -D @types/react@latest @types/react-dom@latest
```

### Step 4.3: 全品質ゲート実行

```bash
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

**Expected**: すべて成功

### Step 4.4: 動作確認

```bash
pnpm tauri dev
```

**手動テスト**: Phase 1と同じ項目を確認

### Step 4.5: コミット

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: React 19.2.3（最新安定版）へ更新

## 変更内容
- react/react-domを19.1.4から19.2.3に更新
- 最新の安定版機能を取得

## 検証結果
- 型チェック: ✅
- Lint: ✅
- テスト: ✅
- ビルド: ✅
- 手動テスト: ✅"
```

**Rollback**: `git revert HEAD && pnpm install`

---

## Post-Execution Verification

すべてのフェーズ完了後、以下を確認：

### 最終バージョンチェック

```bash
pnpm list react react-dom babel-plugin-react-compiler @testing-library/react
```

**Expected Output** (Phase 1-3完了時):
```
react@19.1.4
react-dom@19.1.4
babel-plugin-react-compiler@1.0.0
@testing-library/react@16.3.1
```

### 全品質ゲート実行

```bash
pnpm type-check && pnpm lint && pnpm test && pnpm build
```

**Expected**: すべて成功

### CVE確認

```bash
pnpm audit
```

**Expected**: React関連のCVE-2025-55182、CVE-2025-55184、CVE-2025-55183が報告されない

---

## Rollback Scenarios

### 単一フェーズのロールバック

最後のコミットを取り消す：

```bash
git revert HEAD
pnpm install
pnpm test
```

### 全フェーズのロールバック

すべての変更を取り消す：

```bash
git reset --hard origin/main
pnpm install
pnpm test
```

### 特定フェーズへのロールバック

例: Phase 2を取り消し、Phase 1の状態に戻る：

```bash
git log --oneline  # Phase 2のコミットハッシュを確認
git revert <phase-2-commit-hash>
pnpm install
pnpm test
```

---

## Troubleshooting

### 型エラーが発生した場合

```bash
# 型定義のキャッシュをクリア
rm -rf node_modules/.cache
pnpm install
pnpm type-check
```

### テストが失敗した場合

```bash
# モックの更新が必要か確認
pnpm test --reporter=verbose

# 特定のテストファイルを実行
pnpm test src/__tests__/App.test.tsx
```

### ビルドが失敗した場合

```bash
# Viteキャッシュをクリア
rm -rf dist
pnpm build
```

### React Compilerの警告が出る場合

```bash
# vite.config.tsのreactCompilerオプションを確認
# 必要に応じてruntimeModuleオプションを調整
```

---

## Success Criteria

以下の条件をすべて満たした場合、実行完了と判断：

- [ ] Phase 1完了: React 19.1.4でセキュリティ脆弱性が修正された
- [ ] Phase 2完了（推奨）: React Compiler 1.0.0が動作している
- [ ] Phase 3完了（推奨）: Testing Libraryがテストで正常に動作している
- [ ] すべての品質ゲートが成功（type-check, lint, test, build）
- [ ] 手動テストですべての主要機能が動作確認済み
- [ ] 各フェーズがGitコミットで記録されている
- [ ] pnpm auditでReact関連のCVEが報告されない

---

## Next Steps

実行完了後：

1. **マージリクエスト作成**: mainブランチへのPR作成
2. **レビュー**: 変更内容の確認（package.jsonとpnpm-lock.yamlのみ）
3. **CI/CD確認**: GitHub Actionsなどでビルドが成功するか確認
4. **デプロイ**: 本番環境へのデプロイ前に、ステージング環境で最終確認
5. **ドキュメント更新**: README.mdやCHANGELOG.mdに変更履歴を追加

---

## Contact & Support

問題が発生した場合：

1. **Git History**: `git log --oneline --graph`で変更履歴を確認
2. **Rollback**: 問題のあるフェーズを`git revert`で取り消し
3. **Issue Report**: プロジェクトのIssue Trackerに報告
4. **Documentation**: `docs/`ディレクトリの関連ドキュメントを参照
