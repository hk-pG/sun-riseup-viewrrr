# Research: サイドバーとビューアのスクロール動作修正

## Decision 1: レイアウト方式（高さ同期）
- **Decision**: ルートコンテナをヘッダー直下で `display: flex`（横並び）にし、サイドバーとビューアを `flex: 1` と `min-height: 0` で並べる。ヘッダー以降は `height: 100vh` 基準で計算し、追加のJS計測は行わない。
- **Rationale**: ブラウザ/Chromium-WebView環境での標準的な手法。`min-height: 0` を付与しないと flex 子要素の `overflow-y: auto` が効かず、不要な親スクロールが発生する。CSSのみでリサイズに追従できる。
- **Alternatives considered**: JSで `window.innerHeight - headerHeight` を計算 → イベントリスナー管理が増え、Tauriマルチプラットフォームでの差異吸収が必要になるため不採用。

## Decision 2: ビューアのスクロール条件
- **Decision**: ビューアのラッパーはデフォルト `overflow: hidden`。ズーム倍率が等倍を超え、コンテンツがビューポートを超えた場合にのみ `overflow: auto` を有効化し、画像切替時にはスクロール位置をリセット。
- **Rationale**: FR-002/004/009/010 を同時に満たす最小制御。等倍表示でスクロールバーを出さず、ズーム時に必要な場合だけスクロールを許可できる。
- **Alternatives considered**: 常時 `overflow: auto` でCSSに任せる → 等倍時もスクロールバーが表示されるケースがあり、要求を満たさない。

## Decision 3: サイドバーの独立スクロール
- **Decision**: サイドバーは `overflow-y: auto` を常時有効にし、親コンテナに `min-height: 0` を適用。コンテンツ量に応じてサイドバーのみスクロールさせ、ビューアは影響を受けない。
- **Rationale**: FR-001/003/005 をシンプルに満たす。サイドバーの内容が多い場合でも親のスクロールを発生させず、ビューアに干渉しない。
- **Alternatives considered**: メインコンテンツでスクロールを共用 → ビューアがスクロールしてしまいUXが崩れるため不採用。

## Decision 4: リサイズ対応
- **Decision**: CSSのみでリサイズに追従（`h-full`, `flex`, `min-h-0`）。ウィンドウサイズ変更にJSリスナーを追加しない。
- **Rationale**: Tauri WebViewがCSSリサイズを即時反映するため追加ロジックが不要。FR-008/SC-003を満たしつつ実装を簡潔にする。
- **Alternatives considered**: `ResizeObserver` で明示的に高さ計算 → 必要性が低く、オーバーヘッド増加のため不採用。

## Decision 5: テスト方針（レイアウト/スクロール）
- **Decision**: jsdom + Testing Libraryでコンテナの `overflow` 設定とスクロールリセットを検証。必要に応じてスタイルをインライン/クラスから取得し、ズーム状態切替時のクラス適用を確認。
- **Rationale**: この機能はDOMレベルの挙動が中心であり、E2Eを追加せずとも単体/統合テストで十分にカバーできる。CIの速度と安定性を優先。
- **Alternatives considered**: PlaywrightによるE2E → コストが高く、今回の範囲では過剰。
