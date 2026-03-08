---
description: "GitHub Issue の作業を完了する。品質チェック・コミット・PR作成・Issueクローズを行う"
argument-hint: "Issue番号（例: 13）"
agent: "agent"
---

# Issue 作業完了ワークフロー

## 入力

```text
$ARGUMENTS
```

Issue 番号を受け取り、以下のステップを順番に実行してください。
Issue 番号が指定されていない場合は、番号を尋ねてください。

---

## Step 1: Issue 情報の再確認

```bash
gh issue view $ARGUMENTS --repo hk-pG/sun-riseup-viewrrr
```

Issue の「Definition of Done」チェックリストを確認し、全項目が満たされているか確認する。
満たされていない項目がある場合は **作業完了せず**、ユーザーに報告して指示を待つ。

---

## Step 2: 品質チェック（必須・全項目パス必要）

以下を順番に実行し、全てパスすることを確認する：

```bash
pnpm type-check
```

```bash
pnpm lint
```

```bash
pnpm test
```

エラーが発生した場合は **その時点で停止**し、エラー内容を報告してユーザーの指示を待つ。

---

## Step 3: 変更内容の確認

```bash
git diff --stat
git status
```

変更ファイルの一覧を確認し、Issue の範囲外の変更が含まれていないかチェックする。
範囲外の変更がある場合はユーザーに確認を取る。

---

## Step 4: コミット

**Conventional Commits** 形式で日本語コミットメッセージを作成する。

**形式**:

```
{type}(scope): #{Issue番号} {変更の要約（日本語）}

## 変更内容
- {具体的な変更点1}
- {具体的な変更点2}

## 技術的変更
- {ファイルレベルの変更内容}

## 検証結果
- pnpm type-check: PASS
- pnpm lint: PASS
- pnpm test: PASS（{テスト数}件）
```

**type の選び方**:
| ラベル | type |
|--------|------|
| type: bug | fix |
| type: feature | feat |
| type: refactor | refactor |
| type: test | test |
| type: security | fix |
| type: chore | chore |

```bash
git add -A
git commit -m "{上記フォーマットのメッセージ}"
```

---

## Step 5: PR の作成

```bash
gh pr create \
  --repo hk-pG/sun-riseup-viewrrr \
  --title "{type}(scope): #{Issue番号} {変更の要約}" \
  --body "## 概要

{変更の概要を1〜3行で記述}

## 変更内容

{変更点の箇条書き}

## テスト

- [ ] \`pnpm type-check\` PASS
- [ ] \`pnpm lint\` PASS
- [ ] \`pnpm test\` PASS

## 関連 Issue

closes #{Issue番号}"
```

---

## Step 6: 完了報告

以下の形式で完了サマリーを出力する：

```
## 作業完了サマリー

- Issue: #{番号} {タイトル}
- PR: {PR URL}
- ブランチ: {ブランチ名}

### 変更ファイル
- {変更したファイル一覧}

### 検証結果
- type-check: ✅ PASS
- lint: ✅ PASS
- test: ✅ PASS（{件数}件）

### 次のアクション
- PR をレビュー・マージすると Issue #{番号} が自動クローズされます
```
