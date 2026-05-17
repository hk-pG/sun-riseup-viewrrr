---
description: "修正内容に対してコードレビューを依頼する。Senior Reviewer によるレビューと GitHub Copilot レビューリクエストを行う"
argument-hint: "PR番号またはブランチ名（省略時は現在のブランチの最新コミットを対象）"
agent: "Orchestrator"
---

# コードレビュー依頼ワークフロー

## 入力

```text
$ARGUMENTS
```

PR 番号またはブランチ名を受け取り、以下のステップを順番に実行してください。
指定がない場合は、現在のブランチの最新コミットを対象にします。

---

## Step 1: レビュー対象の確認

### PR 番号が指定された場合

MCP ツール `github/pull_request_read` を使用して PR の詳細と差分を取得する。
または以下のコマンドで確認:

```bash
gh pr view {PR番号} --repo hk-pG/sun-riseup-viewrrr
gh pr diff {PR番号} --repo hk-pG/sun-riseup-viewrrr
```

### 指定なし（現在のブランチ）の場合

```bash
git log --oneline -5
git diff HEAD~1..HEAD --stat
git diff HEAD~1..HEAD
```

取得した差分・変更ファイル一覧・PR 情報をまとめて次のステップに渡す。

---

## Step 2: Senior Reviewer によるコードレビュー

変更内容を **Senior Reviewer** エージェントに渡してレビューを依頼する。

レビュー依頼時に渡す情報:

- 変更ファイル一覧 (`git diff --stat` の出力)
- 変更の差分全文 (`git diff HEAD~1..HEAD` の出力)
- PR の概要・目的（取得できている場合）
- プロジェクト規約: `.github/copilot-instructions.md` を参照

Senior Reviewer からのレビュー結果を受け取り、以下の形式で整理する:

```
### レビュー結果サマリー
- 🔴 Critical: {件数}件
- 🟡 Warning: {件数}件
- 🟢 Suggestion: {件数}件

### 指摘事項一覧
| 重大度 | 箇所 | 内容 | 改善案 |
|--------|------|------|--------|
| ...    | ...  | ...  | ...    |
```

---

## Step 3: フィードバックへの対応確認

レビュー結果をユーザーに報告し、対応方針を確認する:

| 重大度              | 推奨アクション                                                   |
| ------------------- | ---------------------------------------------------------------- |
| 🔴 Critical がある  | 修正後に再レビューを依頼することを強く推奨。ユーザーの判断を仰ぐ |
| 🟡 Warning 以下のみ | PR へのコメント投稿と Copilot レビュー依頼に進む                 |
| 指摘なし            | そのまま PR コメント投稿と Copilot レビュー依頼に進む            |

---

## Step 4: GitHub PR へのレビュー結果投稿

PR 番号が判明している場合、Senior Reviewer のレビュー結果を PR にコメントとして投稿する。

MCP ツール `github/add_issue_comment` を使用して以下の形式で投稿する:

```markdown
## 🤖 Senior Reviewer による自動レビュー

{Step 2 で整理したレビュー結果全文}

---

_このレビューは GitHub Copilot (Senior Reviewer エージェント) によって自動生成されました。_
```

PR が存在しない場合（ローカルブランチのみ）はこのステップをスキップし、レビュー結果をチャットに表示するだけにする。

---

## Step 5: Copilot レビュー依頼

PR が存在する場合、GitHub Copilot に正式なコードレビューを依頼する。

MCP ツール `github/request_copilot_review` を使用する。
利用できない場合は以下のコマンドで代替する:

```bash
gh pr edit {PR番号} --add-reviewer "Copilot" --repo hk-pG/sun-riseup-viewrrr
```

---

## 完了報告

以下の形式で完了サマリーを出力する:

```
## レビュー依頼完了

- 対象: {PR URL または ブランチ名/コミット}
- レビュー日時: {現在の日時}

### Senior Reviewer 評価
- 🔴 Critical: {件数}件
- 🟡 Warning: {件数}件
- 🟢 Suggestion: {件数}件

### アクション結果
- GitHub PR コメント投稿: {完了 ✅ / PR未作成のためスキップ ⚠️}
- Copilot レビュー依頼: {完了 ✅ / PR未作成のためスキップ ⚠️}

### 主な指摘事項（Critical / Warning）
{件数が 0 の場合は「指摘なし ✅」}
{指摘がある場合は箇条書きで列挙}

### 推奨する次のアクション
{Critical がある場合: 修正すべき項目の一覧}
{ない場合: PR のレビュー・マージを進めてください}
```
