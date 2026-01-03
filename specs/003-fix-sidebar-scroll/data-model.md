# Data Model: サイドバーとビューアのスクロール動作修正

## Entities

### LayoutContainer
- **Purpose**: ヘッダー直下のメインコンテナ。サイドバーとビューアを横並びで保持し、高さ同期を担保。
- **Fields**:
  - `headerHeight` (number): ルートヘッダーの高さ（CSSで控除）
  - `viewportHeight` (number): ウィンドウ高さから `headerHeight` を差し引いた値（CSS計算で使用）
- **Behavior**:
  - flex/gridで横並び。`min-height: 0` を子要素に伝播させ、子の `overflow` が有効になるようにする。

### SidebarPane
- **Purpose**: フォルダ/サムネイルリストを表示するサイドバー。
- **Fields**:
  - `scrollPosition` (number): スクロール位置（画像切替時も維持）
  - `contentHeight` (number): 子リストの高さ（CSS依存で計測不要）
- **Behavior**:
  - 常時 `overflow-y: auto`。リサイズ時も高さを親と揃え、ビューアに影響しない。

### ViewerPane
- **Purpose**: 画像表示領域。通常時はスクロールなし、ズーム時のみスクロール。
- **Fields**:
  - `zoomLevel` (number): 現在のズーム倍率
  - `canScroll` (boolean): `zoomLevel > 1` かつコンテンツがビューポートを超える場合に `true`
- **Behavior**:
  - 通常は `overflow: hidden`、`canScroll` が `true` のとき `overflow: auto`
  - 画像切替時にスクロール位置をリセット

## Relationships
- `LayoutContainer` が `SidebarPane` と `ViewerPane` を子として持つ（並列）。
- `SidebarPane` と `ViewerPane` は高さを共有し、スクロール状態は互いに独立。

## Validation / Rules
- `zoomLevel` は 1.0 を基準とし、1.0 以下では `canScroll` を `false` にする。
- `LayoutContainer` 配下の子には `min-height: 0` を付与し、意図しない親スクロールを防ぐ。
- 画像切替時は `ViewerPane` のスクロール位置を 0 にリセットする。
