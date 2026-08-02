# 単体テスト価値レビュー — 曖昧リスト（適用済）

Pass 1 で「明確に低価値」として削除しなかった／残したテストのうち、削除か残すかの判断を仰いだもの。

- 評価基準: [`.agents/skills/review-unit-tests/SKILL.md`](../.agents/skills/review-unit-tests/SKILL.md)
- コミット済み削除: `e6a3fae`（第二意見レビューで復元なし）
- 方針: 削除寄り（固有契約以外は削る）／ソート責任は `sort`・`folderSort` ユニット寄せ
- **判断メモどおりソース削除・改修を適用済み**

---

## 適用結果サマリ

| 決定 | # |
|------|---|
| 残す | 1, 4, 7, 10, 16, 19 |
| 削除 | 2, 3, 5, 6, 11, 12, 13, 14, 15, 17, 18 |
| 要改修（適用） | 8（例外側のみ）, 9（directory 側のみ）, 20（path consistency のみ）, 21（waitFor 化） |

---

## 判断メモ欄（確定）

| # | 決定 | メモ |
|---|------|------|
| 1 | 残す | デフォルト mapping 無衝突の製品契約 |
| 2 | 削除 | next/prev 期待キー一覧（カタログ） |
| 3 | 削除 | autoHide true→false（バグかも固定） |
| 4 | 残す | container null で listener 未登録 |
| 5 | 削除 | cn responsive / state variants（2本） |
| 6 | 削除 | isStringArray type guard narrowing |
| 7 | 残す | folderSort 数値自然順スモーク |
| 8 | 要改修 | 例外側を残し、null 応答側を削除 |
| 9 | 要改修 | `openDirectoryDialog` を残し、image 側を削除 |
| 10 | 残す | useSiblingFolders ハッピーパス（配線スモーク） |
| 11 | 削除 | FolderView フォルダ名表示（List に寄せる） |
| 12 | 削除 | FolderList 空配列→img なし |
| 13 | 削除 | getSiblingFolders numeric natural sort |
| 14 | 削除 | AppMenuBar menu structure hierarchy |
| 15 | 削除 | applyResult startTransition + setAppState 呼び出し |
| 16 | 残す | theme 時に setAppState を呼ばない（副作用防波堤） |
| 17 | 削除 | ThemeSelector 実装＋テスト（死コード） |
| 18 | 削除 | ThemeToggle aria-labels |
| 19 | 残す | theme-integration DOM + theme-toggle UI 両層 |
| 20 | 要改修 | path consistency を残し、folder1 側を削除 |
| 21 | 要改修 | Error Handling 2本を残し waitFor 化（`console.error` 呼び出し待ち） |
