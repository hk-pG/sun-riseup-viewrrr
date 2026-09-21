---
name: review-unit-tests
description: >-
  Review unit tests for value using Khorikov's four pillars plus
  small-personal-project fit. Delete clearly low-value tests; keep ambiguous
  ones and report. Orchestrate multi-file reviews with parallel agents,
  parent cross-dupe pass, and a second-opinion restore loop before commit.
  Use when the user asks for test value review, low-value tests,
  テスト価値レビュー, 単体テストレビュー, four pillars / 4本柱, or
  pruning redundant unit tests.
---

# Review Unit Tests

このプロジェクトは**個人開発の小規模ソフトウェア**。テストの維持コストを重視する。

対象は**単体テスト**（`*.test.ts` / `*.test.tsx` のユニット層）。統合・browser テストは依頼が明示されたときだけ。

## 評価の4本柱（Khorikov）

1. **回帰保護** — 落ちたらユーザーに見えるバグ／契約破れか
2. **リファクタ耐性** — 意図的な整理や命名変更で無駄に壊れないか
3. **高速フィードバック** — 単体として速い・独立しているか（通常は問題にならない）
4. **保守性** — 読みやすさ・重複の少なさ・失敗時の原因の分かりやすさ

追加観点: **規模適合** — 小規模個人開発でこの保守コストに見合うか

価値の要約: **落ちたときに何が壊れたか分かり、かつ他テストでは拾えない契約を固定しているか**

## 低価値の典型パターン（削除候補）

- **弱い代理アサーション**: `length > 1`、`not.toThrow`、`toHaveProperty` / `toBeInstanceOf` だけの shape 確認
- **強いテストへの包含**: 隣の具体アサートが落ちれば必ず落ちる重複
- **カタログ／スナップショット過多**: 全キー・全アクション一覧。仕様追加のたびに壊れる
- **同一分岐の焼き直し**: Ctrl/Shift/Alt を1本ずつ、など同じルールの繰り返し
- **特別扱いのない入力の通し**: コードが汎用処理するだけの文字列・値
- **ファイル横断の二重メンテ**: 同じ振る舞いを別ファイルでも詳細テストしている

## 手順（単ファイル〜小規模）

1. 対象ファイルと実装を読む。関連テストファイルの重複も確認する。
2. 各 `it` を上記観点で分類する:
   - **残す** — 固有の契約・分岐を固定
   - **削除** — 明確に低価値（包含・弱い代理・焼き直し・無分岐通し・横断重複）
   - **曖昧** — 残し、報告して判断を仰ぐ
3. 明確に低価値なものだけ削除する（この Skill 起動時は削除してよい）。曖昧は残す。
4. 関連ユニットテストを実行し、結果を報告する。
5. コミットはユーザー依頼があるまでしない。

## 大規模時のオーケストレーション

次のいずれかを満たすときは並列分割する:

- 対象テストファイルがおおよそ **10 以上**
- 対象 `it` がおおよそ **100 以上**
- ユーザーが複数エージェント前提の計画を求めている

### Pass 1 — 機能別並列レビュー＋削除

1. 機能／ディレクトリ単位でサブエージェントを分割する（例: `image-viewer` / `shared` / `folder-navigation` / `app-shell` / root+UI）。
2. 各子は本 Skill に厳密準拠。担当内の明確低価値だけ削除。曖昧は残す。コミットしない。
3. 子プロンプトに graphify 必須ルールと報告フォーマットを含める。
4. browser テスト（`*.browser.test.tsx`）には触らない（依頼がない限り）。

### 親の横断重複パス

並列完了後、親が必ず次のペアを再点検する（子が見落としやすい）:

- keyboard 系（`keyboardConflicts` / `keyboardUtils` / `useKeyboardHandler`）
- `sort` ↔ `folderSort`
- sibling service ↔ hook（例: `getSiblingFolders` ↔ `useSiblingFolders`）
- theme 層（`theme-toggle` / `theme-integration` / `App`）

明確な横断二重メンテだけ追加削除。曖昧は残す。

### Pass 2 — 削除の第二意見ループ

削除をコミットする前に、削除判断のレビューを回す。

1. 担当別（Pass 1 と同分割が望ましい）でサブエージェントを起動する。
2. 各子は `git diff` / `git show HEAD:<path>` で削除された `it` を確認し、残存テスト＋実装と照合する。
3. 削除ごとに分類する:
   - **CONFIRM_DELETE** — 残存が契約をカバー。復元しない
   - **RESTORE** — 固有の有価値契約が消えている。該当 `it` だけ復元する
4. 追加削除はしない（第二意見の役割は復元判定）。
5. 親が統合し、RESTORE を適用したうえで関連テストを再実行する。
6. 全員 CONFIRM、またはユーザーが削除確定したあとでなければコミットしない（コミット自体はユーザー依頼時のみ）。

第二意見の報告フォーマット:

```markdown
## 削除確定（CONFIRM_DELETE）
| テスト | 理由（残存カバーの根拠） |

## 復元した（RESTORE）
| テスト | 理由（失われた固有契約） |

## まだ迷い（ユーザー判断）
| テスト | 迷い |
```

### 曖昧リストと判断待ち

Pass 1（＋横断）の曖昧はグローバル番号を振り、チャットで判断を仰ぐ。

ユーザーがソース箇所を求めた場合、または件数が多くて追跡しづらい場合は markdown に出力する（既定パス: `docs/test-value-review-ambiguous.md`）。

```markdown
| # | テスト | ファイル | 行 | 問題点 | 判断の軸 |
```

各項目にパス・行番号・迷い・判断の軸を書く。ユーザーが `削除: 1,3 / 残す: それ以外` のように返信したら、指定分だけ削除してテストを再実行する。

## 報告フォーマット（Pass 1）

```markdown
## 削除した（明確に低価値）
| テスト | 理由 |

## 残した（価値あり）
- …

## 曖昧なので残したもの（判断求む）
| # | テスト | 迷いポイント |
```

大規模時は上記に加え、横断パス結果・第二意見サマリ・品質ゲート結果を親が統合報告する。

## 再利用の言い方

- 「`path/to/foo.test.ts` をテスト価値レビューして」
- 「この単体テストを4本柱で見て」
- 「フロントの単体テストをまとめて刈り込んで」（→ 大規模オーケストレーション）
- 「削除の第二意見レビューして」
- `@.agents/skills/review-unit-tests/SKILL.md` を明示参照
