# ADR-003: 画像ビューア操作を `dispatch(ActionType)` と `useViewerActions` に集約する

## ステータス

Accepted

## 日付

2026-08-16

## コンテキスト

### 現状の問題

`ImageViewer` 内に `goToNext` / `goToPrevious` / `zoomIn` / `zoomOut` / `resetZoom` などの操作関数が直接定義されている。現状の件数では許容範囲だが、操作が増えるとコンポーネントが JSX・配線・状態更新ロジックの寄せ集めになり fat 化する。

加えて次のギャップがある。

1. **UI とキーボードが未接続**: `ViewerControls` はコンポーネント内の名前付き関数を呼ぶ一方、`useKeyboardHandler` は props の `keyboardMapping` に依存する。`App` は `keyboardMapping` を渡しておらず、`enabled` 欠落によりキーボード操作は実質オフ
2. `ActionType` **は既にあるが活用されていない**: `nextImage` / `zoomIn` 等の型と `createDefaultKeyboardMapping` は存在するが、操作実装と結びついていない
3. **操作追加時の分岐リスク**: UI 用関数とキーボード用 `onAction` を別々に伸ばすと、同じ操作の実装が二重管理になる



### 設計上の前提

- ビューア操作は **UI コントロールとキーボードで同じ実装** を共有する（メニュー / app-shell Action Registry 連携は将来課題とし、本 ADR の必須範囲外）
- 画像ナビゲーションに `useTransition` を使わない（既存方針）。ズームなど重い表示更新には従来どおり `useTransition` を使ってよい
- fat を「消す」のではなく、**分割しやすい場所へ寄せる**



## 決定



### 1. 単一入口 `dispatch(action: ActionType)`

操作の公開 API は名前付き `goToNext` ではなく、`dispatch('nextImage')` とする。

- `ViewerControls` → `dispatch('previousImage' | 'nextImage' | …)`
- キーボード → `KeyboardMapping.onAction` → 同じ `dispatch`

```typescript
const dispatch = (action: ActionType) => {
  switch (action) {
    case 'nextImage':
      // 旧 goToNext の中身
      break;
    case 'zoomIn':
      // 旧 zoomIn の中身
      break;
    default:
      callbacks?.onCustomAction?.(action, /* event は別途方針 */);
  }
};
```



### 2. 状態と `dispatch` は `useViewerActions` に置く

`currentIndex` / `settings` とそれらを更新する操作ロジックを、カスタム hook `useViewerActions` に集約する。

- **hook の責務**: ビューア操作に関する state と `dispatch`
- `ImageViewer` **の責務**: hook・表示・コントロール・キーボードの配線（JSX と接続）

名前付き `goToNext` 等はコンポーネントの公開面から消し、実装は `dispatch` の `case`（または同ファイルの非公開ヘルパー）へ移す。

### 3. キーボード表は `createDefaultKeyboardMapping` を使う

ショートカット定義（key → `ActionType`）の供給源は既存の `createDefaultKeyboardMapping` とする。

- この関数は **振る舞い本体ではない**（表と `enabled: true` と `onAction` の載せ替え）
- 生成時に `onAction: (action) => dispatch(action)` を渡す
- 通常 `App` は `keyboardMapping` を渡さない。デフォルト生成は `ImageViewer` 側の配線で行う
- キーだけ変えたい場合の拡張口として、props での上書き / `createCustomKeyboardMapping` は残してよい



### 4. 初期実装は `switch`、巨大化したら中身だけストラテジ化

- **今〜十数 action**: `useViewerActions` 内の `switch`（または同ファイル関数委譲）で十分
- **領域が分かれてファイル分割したくなったとき**: 入口の `dispatch` は維持し、実装を `ActionType → 実行関数` のレジストリ（関数型ストラテジ）へ移す
- 古典的な Strategy クラス階層は採用しない（本コードベースは関数 + hook 中心）

fat は `ImageViewer` から `useViewerActions` へ移る。これは意図的であり、「コンポーネント fat」より「ロジック hook fat」の方がテスト・分割・呼び出し共有に有利、というトレードオフを取る。

### 接続像（要約）

```text
ViewerControls ──dispatch(action)──┐
                                   ├─→ useViewerActions.dispatch ─→ state 更新
keydown → useKeyboardHandler       │         ↑
            → mapping.onAction ────┘         │
                                             │
createDefaultKeyboardMapping(dispatch) ──────┘  （ImageViewer が配線）
```



## 結果



### メリット

1. **UI / キーボードの単一実装**: 操作追加は `dispatch` 側が主戦場になり、二重実装を避けやすい
2. `ImageViewer` **の責務が配線に寄る**: JSX と操作ロジックの混在を抑えられる
3. **既存資産の活用**: `ActionType` / `createDefaultKeyboardMapping` / `useKeyboardHandler` を接続する形になる
4. **後からの分割がしやすい**: 呼び出し側は `dispatch` のまま、中身だけファイル分割やレジストリ化できる
5. **テスト単位が明確**: 「action → 状態変化」を hook 単体で検証しやすい



### デメリット

1. **fat の移転**: `useViewerActions` が操作増加とともに太くなる（消滅ではない）
2. **文字列 action の自己文書化が弱い**: `goToNext()` より `dispatch('nextImage')` の方が IDE ジャンプしにくい。`ActionType` の `| string` が残ると typo も落ちにくい
3. **間接性の増加**: キー入力 → handler → mapping → dispatch → state、と段が増える
4. `KeyboardEvent` **の扱い**: ボタン由来には event が無い。組み込み操作は event 不要、カスタムのみ event 付き、など分界を別途明確にする必要がある



### 影響ファイル（想定）


| ファイル                                       | 変更内容                                  |
| ------------------------------------------ | ------------------------------------- |
| `hooks/useViewerActions.ts`                | state + `dispatch` を新設（本 ADR の中核）     |
| `components/ImageViewer.tsx`               | 操作関数を hook へ移し、mapping / controls を配線 |
| `keyboard/keyboardUtils.ts`                | 原則変更なし（デフォルト表の利用開始）                   |
| `hooks/useKeyboardHandler.ts`              | 原則変更なし                                |
| `App.tsx`                                  | 通常は変更なし（mapping 未渡しのまま）               |
| `hooks/__tests__/useViewerActions.test.ts` | action → 状態の単体テスト                     |




## 設計判断


| 決定事項                                    | 却下した選択肢                                       | 理由                                                         |
| --------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| 共有範囲 = UI + キーボード                       | Viewer 内 UI のみ / 初手からメニュー Registry 統合         | メニュー統合は app-shell との境界が増える。キーボード共有が現状ギャップの本丸               |
| 入口 = `dispatch(ActionType)`             | 名前付き関数 + keyboard 用 switch / 初手から handler map | 入口一本化が目的。名前付きは keyboard 側と二重管理。map は今の規模では indirection が先行 |
| state + dispatch を 1 hook               | state はコンポーネント残留 / 領域別 hook を初手分割             | 経験上も追いやすく、fat 移転先を 1 つに固定できる。分割は肥大化後                       |
| キー表 = `createDefaultKeyboardMapping`    | App が mapping を組み立てて渡すのを必須化                   | `dispatch` は Viewer 内にある。App に組み立てさせると操作実装が親へ漏れる           |
| 配線は `ImageViewer`、hook は state+dispatch | mapping 生成まで hook に内包                         | hook の責務を操作状態に限定し、入出力配線はコンポーネントに残す                         |
| 実装は switch 起步                           | 初日からファイル単位ストラテジ                               | `ctx` 設計コストが現状の操作数に見合わない。入口が同じなら後追い移行コストは低い                |




## 代替案



### A. 名前付き関数を hook から返し、キーボードだけ `switch`

```typescript
return { goToNext, zoomIn, handleKeyboardAction };
```

**却下理由**: UI の可読性は高いが、関数追加と keyboard `switch` 追加が常にセットになり、スケール時の二重更新コストが大きい。

### B. 初手から `Record<ActionType, Handler>` レジストリ

**却下理由**: 呼び出し形は `dispatch` と同等だが、共通 `ctx` の設計が先に重くなる。巨大 `switch` 対策としては第二形態として妥当であり、必要になったら採用する。

### C. app-shell の Action Registry にビューア操作も載せる

**却下理由**: メニュー連携が必要になった時点の拡張としてはあり得るが、現状の課題（コンポーネント内操作の整理とキーボード接続）に対して境界が広すぎる。本 ADR の `dispatch` を後から Registry の裏に置く余地は残す。

### D. 現状維持（コンポーネント内の名前付き関数）

**却下理由**: 短期は動くが、キーボード未配線のまま操作だけ増やすと fat と二重実装が同時に悪化する。

## フォローアップ（本 ADR の外、または実装時に詰める）

- `ActionType` から広い `| string` を絞り、既知 action を union で厳格化するかどうか
- `dispatch(action, event?)` の署名と `onCustomAction` への event 伝播方針
- `firstImage` / `rotate*` / `toggleControls` など、デフォルトキー表にあるが未実装の action をいつ `dispatch` に載せるか
- hook が一定行数を超えたときのファイル分割トリガ（目安の明文化は任意）



## 参考

- `src/features/image-viewer/components/ImageViewer.tsx` — 現状の操作直書き
- `src/features/image-viewer/types/viewerTypes.ts` — `ActionType` / `KeyboardMapping`
- `src/features/image-viewer/keyboard/keyboardUtils.ts` — `createDefaultKeyboardMapping`
- `src/features/image-viewer/hooks/useKeyboardHandler.ts` — key → `onAction`
- ADR-001 — app-shell 側の Action Result / Registry（本 ADR とは層が異なる。将来の接続候補）

