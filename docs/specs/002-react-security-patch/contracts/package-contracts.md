# Package Contracts: React 19セキュリティパッチ適用

**Feature**: 002-react-security-patch  
**Type**: Dependency Update Contracts  
**Status**: Complete

---

## Overview

本機能はアプリケーションコードに変更を加えず、依存関係のバージョン更新のみを行う。したがって、従来のTypeScript API契約（インターフェース、型定義の変更）は該当しない。

代わりに、本ドキュメントでは**パッケージバージョン契約**を定義する。これは、各フェーズで保証されるべき依存関係のバージョン範囲と、それらの互換性要件を明示するものである。

---

## Phase 1: Security Patch Contracts

### React Core Packages

#### react@19.1.4
**Purpose**: Reactコアライブラリのセキュリティ脆弱性修正版  
**Version Range**: `19.1.4`（正確なバージョンを指定）  
**Compatibility Requirements**:
- react-domと同じバージョンでなければならない
- @types/react@19.2.7以上と互換性がある
- React Compiler 19.1.0-rc.3以上と互換性がある
- Tauri v2と互換性がある（フロントエンド統合）

**Security Guarantee**:
- CVE-2025-55182（CVSS 10.0）が修正されている
- CVE-2025-55184（CVSS 7.5）が修正されている
- CVE-2025-55183（CVSS 5.3）が修正されている

**Breaking Changes**: なし（パッチバージョン更新）

---

#### react-dom@19.1.4
**Purpose**: React DOM rendererのセキュリティ脆弱性修正版  
**Version Range**: `19.1.4`（正確なバージョンを指定）  
**Compatibility Requirements**:
- reactと同じバージョンでなければならない
- @types/react-dom@19.1.19以上と互換性がある

**Security Guarantee**: reactパッケージと同等のCVE修正

**Breaking Changes**: なし（パッチバージョン更新）

---

### Type Definitions

#### @types/react@19.2.7
**Purpose**: React 19.1.4に対応する型定義  
**Version Range**: `^19.2.7`（19.2.7以上19.3.0未満）  
**Compatibility Requirements**:
- react@19.1.4と型互換性がある
- TypeScript 5.6+で動作する

**Type Safety Guarantee**:
- 既存のReactコンポーネントの型エラーが発生しない
- React 19の新機能（useTransition、並行レンダリング）の型が正しく定義されている

**Breaking Changes**: なし（型定義の改善のみ）

---

#### @types/react-dom@19.1.19
**Purpose**: React DOM 19.1.4に対応する型定義  
**Version Range**: `^19.1.19`（19.1.19以上19.2.0未満）  
**Compatibility Requirements**:
- react-dom@19.1.4と型互換性がある
- @types/react@19.2.7と互換性がある

**Type Safety Guarantee**:
- 既存のReactDOM APIの型エラーが発生しない

**Breaking Changes**: なし

---

## Phase 2: React Compiler Stable Contracts

### babel-plugin-react-compiler@1.0.0
**Purpose**: React CompilerのRC版から安定版への移行  
**Version Range**: `1.0.0`（正確なバージョンを指定）  
**Compatibility Requirements**:
- react@19.1.4以上と互換性がある
- Vite 6と互換性がある
- @vitejs/plugin-react@4.3.4と互換性がある

**Performance Guarantee**:
- Phase 1と比較してパフォーマンス低下がない（±5%以内）
- 不要な再レンダリングが増加しない

**Breaking Changes**: 
- RC版からの移行のため、一部のコンパイラ警告メッセージが変更される可能性がある
- ただし、ランタイム動作に影響はない

---

## Phase 3: Testing Library Contracts

### @testing-library/react@16.3.1
**Purpose**: React 19に対応した最新のTesting Library  
**Version Range**: `^16.3.1`（16.3.1以上17.0.0未満）  
**Compatibility Requirements**:
- react@19.1.4と互換性がある
- react-dom@19.1.4と互換性がある
- Vitest 3.2+と互換性がある

**Testing Guarantee**:
- 既存のテストがすべて成功する
- React 19の並行機能（useTransition）を正しくテストできる

**Breaking Changes**: なし（マイナーバージョン更新）

---

## Phase 4: Latest Stable Contracts (Optional)

### react@19.2.3 / react-dom@19.2.3
**Purpose**: React 19の最新安定版（オプション）  
**Version Range**: `19.2.3`（正確なバージョンを指定）  
**Compatibility Requirements**:
- Phase 1-3の全依存関係と互換性がある
- Tauri v2と互換性がある

**Feature Guarantee**:
- Phase 1の全機能が動作する
- 追加のバグ修正と最適化が含まれる

**Breaking Changes**: 
- 19.1.xからのマイナーバージョン更新のため、一部の内部APIに変更がある可能性
- ただし、公開APIには影響しない（SemVer保証）

---

## Cross-Phase Compatibility Matrix

| Package | Phase 1 | Phase 2 | Phase 3 | Phase 4 (Opt) |
|---------|---------|---------|---------|---------------|
| react | 19.1.4 | 19.1.4 | 19.1.4 | 19.2.3 |
| react-dom | 19.1.4 | 19.1.4 | 19.1.4 | 19.2.3 |
| @types/react | 19.2.7 | 19.2.7 | 19.2.7 | latest |
| @types/react-dom | 19.1.19 | 19.1.19 | 19.1.19 | latest |
| babel-plugin-react-compiler | 19.1.0-rc.3 | 1.0.0 | 1.0.0 | 1.0.0 |
| @testing-library/react | 16 | 16 | 16.3.1 | 16.3.1 |

**Key Principle**: 各フェーズは前フェーズの依存関係と互換性を維持する。

---

## Verification Contracts

### Type Safety Contract
**Condition**: すべてのフェーズで`pnpm type-check`がエラーなしで完了する  
**Coverage**: 全TypeScriptファイル（src/配下）  
**Failure Mode**: 型エラーが1つでも発生した場合、そのフェーズは失敗と判断

---

### Test Success Contract
**Condition**: すべてのフェーズで`pnpm test`がすべてのテストを成功させる  
**Coverage**: 全テストファイル（`**/__tests__/**/*.test.ts(x)`）  
**Failure Mode**: テストが1つでも失敗した場合、そのフェーズは失敗と判断

---

### Build Success Contract
**Condition**: すべてのフェーズで`pnpm build`がエラーなしで完了する  
**Coverage**: Viteビルド、Tauri bundling  
**Failure Mode**: ビルドエラーまたは警告が発生した場合、そのフェーズは失敗と判断

---

### Lint Contract
**Condition**: すべてのフェーズで`pnpm lint`がエラーなしで完了する  
**Coverage**: 全ソースファイル（Biome lint rules）  
**Failure Mode**: エラーが発生した場合は失敗（warningは許容）

---

## Rollback Contract

### Git Commit Guarantee
**Condition**: 各フェーズ完了後、`package.json`と`pnpm-lock.yaml`をGitにコミットする  
**Commit Message Format**: Conventional Commits（`feat:` または `chore:`）  
**Rollback Method**: `git revert <commit-hash> && pnpm install`

---

### Rollback Success Criteria
**Condition**: ロールバック後、すべての品質ゲート（type-check, lint, test, build）が成功する  
**Data Loss**: なし（依存関係バージョンのみの変更）  
**State Restoration**: ロールバック前の状態に完全に復元される

---

## Security Contract

### Vulnerability Resolution
**Condition**: Phase 1完了後、`pnpm audit`でReact関連のCVEが報告されない  
**CVE Coverage**: 
- CVE-2025-55182（CVSS 10.0）
- CVE-2025-55184（CVSS 7.5）
- CVE-2025-55183（CVSS 5.3）

**Verification Method**: 
```bash
pnpm audit --filter react --filter react-dom
```

**Failure Mode**: 上記CVEが報告された場合、Phase 1は失敗と判断

---

## Performance Contract

### Baseline Metrics (Phase 1)
測定項目（React DevTools Profiler使用）:
- **画像切り替え時間**: 100ms以下
- **フォルダ切り替え時間**: 200ms以下
- **再レンダリング回数**: 画像切り替え時に2回以下

---

### Phase 2 Performance Guarantee
**Condition**: Phase 2完了後、Phase 1のベースライン測定値から±5%以内  
**Measurement Method**: 同一環境で3回測定し、平均値を使用  
**Failure Mode**: ±5%を超える性能低下が発生した場合、Phase 2を再評価

---

## No Application Code Changes Contract

### Guarantee
本機能は以下のファイルを変更**しない**：
- `src/**/*.ts(x)` - すべてのアプリケーションコード
- `src-tauri/src/**/*.rs` - すべてのRustコード
- `vite.config.ts` - Vite設定（React Compilerオプションを除く）
- `tsconfig.json` - TypeScript設定
- `biome.json` - Linter設定
- `tailwind.config.ts` - Tailwind CSS設定

---

### Modified Files
変更されるファイル（2ファイルのみ）:
- `package.json` - 依存関係のバージョンのみ
- `pnpm-lock.yaml` - ロックファイルの更新

---

### Verification
```bash
# 変更されたファイルを確認
git diff --name-only origin/main

# Expected output:
# package.json
# pnpm-lock.yaml
```

**Failure Mode**: 上記以外のファイルが変更された場合、仕様違反と判断

---

## Final Acceptance Contract

すべてのフェーズが以下の条件を満たした場合、本機能の実装は完了と判断：

- [ ] Phase 1: Security Patch契約をすべて満たす
- [ ] Phase 2: React Compiler Stable契約をすべて満たす（推奨）
- [ ] Phase 3: Testing Library契約をすべて満たす（推奨）
- [ ] Phase 4: Latest Stable契約をすべて満たす（オプション）
- [ ] 全品質ゲート成功（type-check, lint, test, build）
- [ ] セキュリティ契約を満たす（CVE解決）
- [ ] パフォーマンス契約を満たす（±5%以内）
- [ ] ロールバック契約を満たす（各フェーズでGitコミット）
- [ ] No Application Code Changes契約を満たす（package.jsonとpnpm-lock.yamlのみ変更）

---

## Contract Violation Handling

契約違反が発生した場合の対応：

1. **即座にロールバック**: `git revert HEAD && pnpm install`
2. **原因調査**: どの契約条件が違反されたか特定
3. **修正または再計画**: 
   - 型エラー → @types/*のバージョン調整
   - テスト失敗 → モック更新または依存関係の再評価
   - ビルドエラー → Vite/React Compiler設定の見直し
   - パフォーマンス低下 → React Compilerオプションの調整またはPhase 2スキップ
4. **再実行**: 修正後、quickstart.mdに従って再実行

**エスカレーション**: 3回以上契約違反が発生した場合、機能の実装方針を再検討する。
