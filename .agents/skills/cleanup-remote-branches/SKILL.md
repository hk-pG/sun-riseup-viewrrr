---
name: cleanup-remote-branches
description: >-
  Delete obsolete remote Git branches after classifying them by GitHub PR
  state. Use when the user asks to clean up remote branches, delete stale
  branches, prune merged/closed PR heads, 不要になった remote ブランチ削除,
  or リモートブランチ整理.
---

# Cleanup Remote Branches

このリポジトリの **不要になった `origin/*` remote ブランチ** を安全に削除する。

## 保護ブランチ（絶対に削除しない）

- `main`
- `feature/core`
- `origin/HEAD` が指すブランチ

## 判定（squash merge 前提）

このリポは squash / 統合コミットが多い。**`git merge-base --is-ancestor` だけで「マージ済み」と決めない。**

各 `origin/<name>`（保護ブランチ以外）について:

1. `git fetch --prune origin`
2. `gh pr list --state all --head "<name>" --json number,state,mergedAt,title,baseRefName`
3. 次の表で分類する

| 条件 | 判定 | 操作 |
|------|------|------|
| PR が `MERGED` | 不要 | 削除してよい |
| PR が `CLOSED`（未マージ） | 不要 | 削除してよい |
| PR が `OPEN` | 稼働中 | **残す** |
| PR なし、かつ `origin/feature/core`（なければ `origin/main`）に無い独自コミットがある | 要確認 | **削除せず報告**し、ユーザー指示を待つ |
| PR なし、かつ独自コミットが無い（追跡ブランチの残骸） | 不要 | 削除してよい |

独自コミットの確認:

```bash
git log --oneline "origin/feature/core..origin/<name>"
```

（`feature/core` が無い場合は `origin/main` を使う）

## 削除手順

1. 削除候補を表でユーザー向けに要約する（ブランチ名・PR 番号・状態・理由）。
2. ユーザーが「削除して」と明示している、またはこの Skill 起動時に削除が依頼内容に含まれる場合は、候補を削除する。曖昧な候補は残す。
3. 削除は `gh` の書き込みではなく **git** で行う（この環境の `gh` は参照専用のことがある）:

```bash
git push origin --delete <branch> [<branch> ...]
git fetch --prune origin
```

4. 結果を報告する:
   - 削除したもの
   - 残したものと理由（OPEN / 保護 / 要確認）

## やってはいけないこと

- 保護ブランチの削除
- OPEN PR の head ブランチの削除
- PR 無し＋独自コミットありのブランチを、確認なしで削除すること
- ancestry だけで MERGED と断定すること
- ローカルブランチ削除だけして remote を残すこと（依頼が remote 削除のとき）

## 完了報告テンプレ

```text
削除: <list or なし>
残留: <branch>（理由）
要確認: <branch>（独自コミット / PRなし）— 指示待ち
```
