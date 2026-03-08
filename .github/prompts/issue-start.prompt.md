---
description: "GitHub Issue の作業を開始する。ブランチ作成・現状調査・TDDサイクル準備を行う"
argument-hint: "Issue番号（例: 13）"
agent: "agent"
---

# Issue 作業開始ワークフロー

## 入力

```text
$ARGUMENTS
```

Issue 番号を受け取り、以下のステップを順番に実行してください。
Issue 番号が指定されていない場合は、番号を尋ねてください。

---

## Step 1: Issue 情報の取得

```bash
gh issue view $ARGUMENTS --repo hk-pG/sun-riseup-viewrrr
```

取得した情報から以下を把握する：

- **タイトル・概要**: 何を解決するか
- **ラベル**: 種別（bug / refactor / test / feature）と優先度（P0〜P3）
- **マイルストーン**: どのスプリントに属するか
- **`tdd: test-first` ラベルの有無**: テストファーストで進めるべきか

---

## Step 2: ブランチ作成

Issue のタイトルとラベルから適切なブランチ名を決定して作成する。

**命名規則**: `{type}/issue-{番号}-{短い説明（英語・ケバブケース）}`

例：

- `fix/issue-13-react-security-patch`
- `fix/issue-14-sidebar-scroll`
- `refactor/issue-16-thumbnail-backend`
- `test/issue-18-e2e-playwright`

```bash
git checkout -b {ブランチ名}
```

---

## Step 3: 現状調査

Issue の影響ファイルを調査する（Issue 本文の「影響ファイル」セクションを参照）。

調査観点：

1. 現在のコードの実装を確認する
2. 関連するテストファイルの有無を確認する
3. Issue に記載された「現状の問題」が実際にコードに存在するか確認する
4. `pnpm test` を実行して現在の状態を確認する

```bash
pnpm test -- --reporter=verbose 2>&1 | tail -20
```

---

## Step 4: TDD 作業計画の策定

`tdd: test-first` ラベルがある場合は、以下の順序で計画を立てる：

```
RED   → 失敗するテストを先に書く
GREEN → テストをパスする最小限の実装をする
BLUE  → リファクタリングする（動作を変えずにコードを改善）
```

`tdd: test-first` ラベルがない場合は、通常の実装 → テスト追加の順で進める。

---

## Step 5: 作業開始の宣言

以下の形式でサマリーを出力する：

```
## 作業開始サマリー

- Issue: #{番号} {タイトル}
- ブランチ: {ブランチ名}
- 種別: {ラベル}
- TDD モード: {test-first / 通常}

### 作業計画
1. {最初のステップ}
2. {次のステップ}
...

### 確認済み現状
- {現状のコードの状態}
- {既存テストの状態}
```
