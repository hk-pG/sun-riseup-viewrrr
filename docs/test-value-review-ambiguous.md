# 単体テスト価値レビュー — 曖昧リスト（判断求む）

Pass 1 で「明確に低価値」として削除しなかった／残したテストのうち、削除か残すかの判断を仰ぐもの。

- 評価基準: [`.agents/skills/review-unit-tests/SKILL.md`](../.agents/skills/review-unit-tests/SKILL.md)
- コミット済み削除: `e6a3fae`（第二意見レビューで復元なし）
- 返信例: `削除: 1,3,5 / 残す: それ以外`

---

## 一覧

| # | テスト | ファイル | 行 |
|---|--------|----------|-----|
| 1 | default mapping 無衝突 | `keyboardConflicts.test.ts` | L204 |
| 2 | nextImage / previousImage 期待キー | `keyboardUtils.test.ts` | L18, L30 |
| 3 | autoHide true→false（既存 timeout 実行） | `useControlsVisibility.test.ts` | L262 |
| 4 | container is null | `useKeyboardHandler.test.ts` | L218 |
| 5 | cn responsive / state variants | `utils.test.ts` | L40, L45 |
| 6 | isStringArray type guard narrowing | `isStringArray.test.ts` | L51 |
| 7 | folderSort 数値自然順スモーク | `folderSort.test.ts` | L12 |
| 8 | useImages 存在しないフォルダ vs 例外 | `useImages.test.tsx` | L80, L103 |
| 9 | tauriAdapters 非string→null（2本） | `tauriAdapters.test.ts` | L45, L98 |
| 10 | useSiblingFolders ハッピーパス | `useSiblingFolders.test.tsx` | L37 |
| 11 | FolderView フォルダ名表示 | `FolderView.test.tsx` | L23 |
| 12 | FolderList 空配列→img なし | `FolderList.test.tsx` | L39 |
| 13 | getSiblingFolders numeric natural sort | `getSiblingFolders.test.ts` | L175 |
| 14 | AppMenuBar menu structure hierarchy | `AppMenuBar.test.tsx` | L134 |
| 15 | applyResult startTransition + setAppState | `useAppActions.test.ts` | L14 |
| 16 | applyResult theme 時に setAppState を呼ばない | `useAppActions.test.ts` | L57 |
| 17 | ThemeSelector 一式（3本） | `theme-toggle.test.tsx` | L124, L136, L152 |
| 18 | ThemeToggle aria-labels | `theme-toggle.test.tsx` | L80 |
| 19 | theme-integration DOM vs theme-toggle UI | `theme-integration.test.tsx` / `theme-toggle.test.tsx` | 下記 |
| 20 | App folder selection vs path consistency | `App.test.tsx` | L182, L275 |
| 21 | App Error Handling 2本 | `App.test.tsx` | L294, L319 |

---

## 詳細

### 1. `keyboardConflicts` — デフォルト mapping 無衝突

- **場所**: [`src/features/image-viewer/keyboard/__tests__/keyboardConflicts.test.ts`](../src/features/image-viewer/keyboard/__tests__/keyboardConflicts.test.ts) **L204–L209**
- **テスト名**: `should validate default keyboard mapping has no conflicts`
- **問題点**: デフォルトショートカット一覧のカタログ隣接。意図的に衝突するキーを追加すると必ず壊れる。一方で「デフォルトが衝突していない」という製品契約の安い回帰でもある。
- **判断の軸**: 仕様変更のたびにメンテするか vs 誤衝突の早期検知を残すか。

### 2. `keyboardUtils` — nextImage / previousImage の期待キー

- **場所**: [`src/features/image-viewer/keyboard/__tests__/keyboardUtils.test.ts`](../src/features/image-viewer/keyboard/__tests__/keyboardUtils.test.ts)
  - **L18–L28**: `should include expected shortcuts for nextImage`
  - **L30–L40**: `should include expected shortcuts for previousImage`
- **問題点**: UX キー契約のカタログ（ArrowRight / Space / j など）。ナビキー変更のたびに壊れるが、ユーザー向けキー固定としての価値もある。
- **判断の軸**: キー一覧を仕様として固定するか、衝突検出（#1）だけに任せるか。

### 3. `useControlsVisibility` — autoHide true→false（既存 timeout 実行）

- **場所**: [`src/features/image-viewer/hooks/__tests__/useControlsVisibility.test.ts`](../src/features/image-viewer/hooks/__tests__/useControlsVisibility.test.ts) **L262–L286**
- **テスト名**: `should handle autoHide changes from true to false (existing timeout still executes)`
- **問題点**: コメントで「現行挙動（バグかも）」と明記。意図契約ではなく現状固定の可能性が高い。バグ修正時に必ず落ちる。
- **判断の軸**: 意図仕様として残す / 削除してバグ修正時に正しいテストを書き直す。

### 4. `useKeyboardHandler` — container is null

- **場所**: [`src/features/image-viewer/hooks/__tests__/useKeyboardHandler.test.ts`](../src/features/image-viewer/hooks/__tests__/useKeyboardHandler.test.ts) **L218–L228**
- **テスト名**: `should not add event listener when container is null`
- **問題点**: 分岐自体は有用だが、アサーションが弱い（listener 未登録の確認中心）。`container is available`（L205）の逆として残す価値はある。
- **判断の軸**: null ガードを明示契約とするか、成功系だけで足りるか。

### 5. `cn` — responsive / state variants

- **場所**: [`src/shared/utils/__tests__/utils.test.ts`](../src/shared/utils/__tests__/utils.test.ts)
  - **L40–L43**: `should handle responsive variants`
  - **L45–L48**: `should handle state variants`
- **問題点**: `cn` は `clsx` + `twMerge` の薄いラッパ。衝突マージ（L34）があればライブラリ仕様の通しに近い。
- **判断の軸**: twMerge の variant 補強として残すか、衝突1本に寄せるか。

### 6. `isStringArray` — type guard narrowing

- **場所**: [`src/shared/utils/__tests__/isStringArray.test.ts`](../src/shared/utils/__tests__/isStringArray.test.ts) **L51–**（`type guard behavior` describe 内）
- **テスト名**: `should narrow type correctly when used as type guard`
- **問題点**: 実行時契約は happy path と重複。TypeScript の型絞り込み確認が主目的なら、コンパイル時の保証で足りる可能性。
- **判断の軸**: TS 型ガードの実行時デモを残すか削除するか。

### 7. `folderSort` — 数値自然順スモーク

- **場所**: [`src/shared/utils/__tests__/folderSort.test.ts`](../src/shared/utils/__tests__/folderSort.test.ts) **L12–L24**
- **テスト名**: `should sort numbered folders naturally`
- **問題点**: `sort.test.ts` に同系の詳細あり。`naturalFolderSort` は `naturalSort` と別実装（どちらも `localeCompare('ja', { numeric: true })`）なので、folderSort 側の `numeric: true` 接続確認としては1本残す意味がある。
- **判断の軸**: wrapper/別実装のスモークとして残すか、sort に任せるか。

### 8. `useImages` — 存在しないフォルダ vs 例外

- **場所**: [`src/shared/hooks/data/__tests__/useImages.test.tsx`](../src/shared/hooks/data/__tests__/useImages.test.tsx)
  - **L80**: `存在しないフォルダを指定した場合、エラーが返される`
  - **L103**: `ファイルアクセスで例外が発生した場合、エラーが返される`
- **問題点**: どちらも最終的に error ステート。失敗モード差（null 応答 vs reject）に固有価値があるかが不明。
- **判断の軸**: 失敗モードを2本維持するか、代表1本に寄せるか。

### 9. `tauriAdapters` — 非string→null（同型ガード）

- **場所**: [`src/shared/adapters/__tests__/tauriAdapters.test.ts`](../src/shared/adapters/__tests__/tauriAdapters.test.ts)
  - **L45**: `openDirectoryDialog` — `文字列以外のオブジェクトが返されたら、nullを返す`
  - **L98**: `openImageFileDialog` — `should handle unexpected dialog response types`
- **問題点**: ほぼ同型のランタイムガード焼き直し。片方で型ガード方針は足りる可能性。
- **判断の軸**: メソッドごとに残すか、代表1本にするか。

### 10. `useSiblingFolders` — ハッピーパス

- **場所**: [`src/features/folder-navigation/hooks/__tests__/useSiblingFolders.test.tsx`](../src/features/folder-navigation/hooks/__tests__/useSiblingFolders.test.tsx) **L37–**（describe `useSiblingContainers` 先頭）
- **テスト名**: `currentFolderPath が指定された場合、同階層のフォルダ情報を取得すること`
- **問題点**: service（`getSiblingFolders.test.ts`）とソート結果が重複。一方でフック配線の唯一の成功系。削除すると hook は error / unmount のみになる。
- **判断の軸**: 配線スモークとして残すか、service に任せるか。

### 11. `FolderView` — フォルダ名表示

- **場所**: [`src/features/folder-navigation/components/FolderView.test.tsx`](../src/features/folder-navigation/components/FolderView.test.tsx) **L23–**
- **テスト名**: `フォルダ名を表示する`
- **問題点**: `FolderList` の複数表示テストでも名前は見える。セル単体のベースラインとしては薄い。
- **判断の軸**: FolderView 単体の最小契約として残すか、List 側に寄せるか。

### 12. `FolderList` — 空配列→img なし

- **場所**: [`src/features/folder-navigation/components/FolderList/__test__/FolderList.test.tsx`](../src/features/folder-navigation/components/FolderList/__test__/FolderList.test.tsx) **L39–L48**
- **テスト名**: `フォルダが渡されなければ何も表示しないこと`
- **問題点**: アサーションが `queryByRole('img')` のみで弱い代理寄り。空リストなら button が 0 の方が契約が明確。
- **判断の軸**: アサーション強化して残す / 削除 / `getAllByRole('button')` 長0 に書き換え。

### 13. `getSiblingFolders` — numeric natural sort

- **場所**: [`src/features/folder-navigation/services/__tests__/getSiblingFolders.test.ts`](../src/features/folder-navigation/services/__tests__/getSiblingFolders.test.ts) **L175–L201**
- **テスト名**: `should handle numeric folder names correctly with natural sort`
- **問題点**: `folderSort` / `sort` と重なりうる。ただし「デフォルト sort を service が配線している」固定としては有用。アルファベットソート配線は L21 付近の別テストでもカバー。
- **判断の軸**: デフォルト natural sort 配線の回帰として残すか、sort ユニットに任せるか。

### 14. `AppMenuBar` — menu structure hierarchy

- **場所**: [`src/features/app-shell/components/__tests__/AppMenuBar.test.tsx`](../src/features/app-shell/components/__tests__/AppMenuBar.test.tsx) **L134–**（`Menu Item Structure Validation`）
- **テスト名**: `should have correct menu structure hierarchy`
- **問題点**: ファイル/表示などのラベルカタログ。コールバック4本（L149–）があれば操作契約は足りる可能性。
- **判断の軸**: メニュー構成のスナップショットとして残すか、コールバックのみにするか。

### 15. `applyResult` — startTransition + setAppState 呼び出し

- **場所**: [`src/features/app-shell/hooks/__tests__/useAppActions.test.ts`](../src/features/app-shell/hooks/__tests__/useAppActions.test.ts) **L14–L26**
- **テスト名**: `folder-selected: startTransition 内で setAppState を呼び出す`
- **問題点**: 直後の updater テスト（L28）が状態生成を強く固定。本テストは呼び出し回数の代理に近い。
- **判断の軸**: startTransition 経路を明示残すか、updater テストにマージ／削除するか。

### 16. `applyResult` — theme 時に setAppState を呼ばない

- **場所**: [`src/features/app-shell/hooks/__tests__/useAppActions.test.ts`](../src/features/app-shell/hooks/__tests__/useAppActions.test.ts) **L57–L62**
- **テスト名**: `theme-toggled: setAppState / startTransition を呼ばない`
- **問題点**: 負のアサーション。`setTheme` 成功（L51）だけで足りるか、副作用の非実行を明示するか。
- **判断の軸**: 横断副作用の防波堤として残すか削除するか。

### 17. `ThemeSelector` 一式（3本）

- **場所**: [`src/components/ui/__tests__/theme-toggle.test.tsx`](../src/components/ui/__tests__/theme-toggle.test.tsx)
  - **L124**: `should render light and dark theme options`
  - **L136**: `should highlight the current theme`
  - **L152**: `should switch themes when buttons are clicked`
- **実装**: [`src/components/ui/theme-toggle.tsx`](../src/components/ui/theme-toggle.tsx)（`ThemeSelector` export）
- **問題点**: アプリ本番コードから未使用（死コンポーネント疑い）。テストだけが生存理由になっている可能性。
- **判断の軸**: コンポーネントごと削除（実装+テスト） / 将来用に残す / テストだけ削除。

### 18. `ThemeToggle` — aria-labels

- **場所**: [`src/components/ui/__tests__/theme-toggle.test.tsx`](../src/components/ui/__tests__/theme-toggle.test.tsx) **L80–**
- **テスト名**: `should have correct aria-labels for light and dark themes`
- **問題点**: デフォルト表示（L41）＋サイクル（L56）と部分重複。a11y 専用として残す余地はある。
- **判断の軸**: aria 専用契約として残すか、サイクルテストに統合するか。

### 19. theme-integration DOM vs theme-toggle UI

- **場所**:
  - [`src/__tests__/theme-integration.test.tsx`](../src/__tests__/theme-integration.test.tsx) **L51**, **L78**（document クラス切替・デフォルト dark）
  - [`src/components/ui/__tests__/theme-toggle.test.tsx`](../src/components/ui/__tests__/theme-toggle.test.tsx)（アイコン切替）
- **問題点**: 層は違う（Provider 副作用 vs UI）。重複感はあるが、片方だけだと片層が無防備になる。
- **判断の軸**: 両層維持 / integration をさらに削る / UI に寄せる。

### 20. `App` — folder selection vs path consistency

- **場所**: [`src/__tests__/App.test.tsx`](../src/__tests__/App.test.tsx)
  - **L182**: `should handle folder selection from sidebar`（folder1）
  - **L275**: `should maintain folder path consistency between sidebar and image viewer`（folder2）
- **問題点**: 同分岐の二重（サイドバー選択→Viewer 反映）。folder2 + aria-pressed の方がやや強い。
- **判断の軸**: 強い方1本に寄せるか、両方残すか。

### 21. `App` — Error Handling 2本

- **場所**: [`src/__tests__/App.test.tsx`](../src/__tests__/App.test.tsx)
  - **L294–L316**: `should handle errors in folder dialog gracefully`
  - **L319–**: `should handle errors in image file opening gracefully`
- **問題点**: クラッシュ耐性契約は有用だが、`setTimeout(resolve, 100)` 依存で脆い。`waitFor` 化の候補。
- **判断の軸**: 残して waitFor 化 / 削除 / 現状維持。

---

## 判断メモ欄

| # | 決定（削除 / 残す / 要改修） | メモ |
|---|------------------------------|------|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |
| 4 |  |  |
| 5 |  |  |
| 6 |  |  |
| 7 |  |  |
| 8 |  |  |
| 9 |  |  |
| 10 |  |  |
| 11 |  |  |
| 12 |  |  |
| 13 |  |  |
| 14 |  |  |
| 15 |  |  |
| 16 |  |  |
| 17 |  |  |
| 18 |  |  |
| 19 |  |  |
| 20 |  |  |
| 21 |  |  |
