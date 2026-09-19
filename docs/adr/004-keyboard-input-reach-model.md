# ADR-004: キーボード入力の到達モデル — コンテナスコープ + フォーカス移譲

## ステータス

Accepted

## 日付

2026-08-18

## 背景

ADR-003 は「操作の一本化（dispatch）」を決めたが、**キーボードイベントが listener にどう届くか**は未定義のままだった。

実装レビューにより、以下の構造的問題が判明した:

1. **ref が成功描画にしか付かない** — loading / error / empty の early return には `ref` がなく、初回 effect で `containerRef.current === null` になる
2. **mapping が毎レンダー新規生成される** — `createDefaultKeyboardMapping` の戻り値が毎回別参照。`useKeyboardHandler` の effect 依存（`shortcuts`, `onAction`）が毎レンダー変わり、描画のたびに listener を付け外しする
3. **フォーカスが無い** — `tabIndex={-1}` だけで `focus()` が呼ばれないため、ビューアにキーが届かない
4. **相殺による偶然動作** — 1（ref 遅れ）と 2（毎回再登録）がたまたま相殺し、現状は動いている。どちらか片方だけ直すと壊れる

根本原因: 入力到達モデルを「**コンテナスコープ（A）**」にするか「**window/document グローバル（B）**」にするかを決めずに実装を進めた。

## 決定

**モデル A（コンテナスコープ）を採用する。**

```text
[入力]           [到達]              [処理]
keydown イベント
  → フォーカス済み ImageViewer コンテナ
      → useKeyboardHandler (containerRef)
          → mapping.onAction
              → dispatch(ActionType)
                  → useViewerActions → state 更新
```



### 採用理由


| 理由           | 内容                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| ADR-002 との整合 | `ImageViewer` は `container` を受け取る独立 UI。グローバル listener は埋め込み時に衝突する        |
| 既存 hook との整合 | `useKeyboardHandler(containerRef)` はもともとコンテナスコープ前提の設計                    |
| a11y         | `role="application"` + フォーカス可能領域はコンテナスコープの自然な形                           |
| テスト容易性       | コンテナにフォーカスして `keydown` を送るだけでよい。グローバル listener では `document` をモックする必要がある |
| 将来の入力欄       | サイドバー検索・設定フォームが入っても衝突しない                                                 |


