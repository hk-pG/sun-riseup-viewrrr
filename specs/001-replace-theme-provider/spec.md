# Feature Specification: Replace Theme Provider with shadcn/ui Version

**Feature Branch**: `001-replace-theme-provider`  
**Created**: November 9, 2025  
**Status**: Draft  
**Input**: User description: "現在使っている自作のThemeProviderをshadcn/ui製のtheme-provider.tsxのものに差し替えたい。テストでも使っているため、安全に付け替えを行いたい。機能に差がある部分があるかもしれないため、逐次調べ、判断を仰いでほしい。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe Provider Replacement (Priority: P1)

開発者がThemeProviderをshadcn/ui版に置き換える際、既存機能が継続して動作し、テストが引き続き成功する必要がある。system設定は削除され、light/darkの2値のみサポートされる。

**Why this priority**: 基本的なテーマ機能が損なわれることなく、開発・テスト環境の継続性を確保するため最重要。

**Independent Test**: 現在のすべてのテストが新しいプロバイダーでも成功し、既存のコンポーネント（App、ThemeToggle等）が正常に動作することで検証可能。

**Acceptance Scenarios**:

1. **Given** 現在のThemeProviderが稼働中, **When** shadcn/ui版に置き換え, **Then** すべての既存テストが成功する（system関連テストは修正後）
2. **Given** 新しいプロバイダーが導入済み, **When** アプリケーションを起動, **Then** light/dark間のテーマ切り替え機能が正常動作する
3. **Given** 新しいプロバイダーが導入済み, **When** 初回起動, **Then** デフォルトでdarkテーマが適用される

---

### User Story 2 - Storage Persistence Integration (Priority: P2)

新しいThemeProviderのlocalStorage機能により、ユーザーのテーマ設定（light/dark）が永続化され、再起動後も保持される。デフォルトテーマはdarkに設定される。

**Why this priority**: ユーザー体験の向上につながるが、コア機能ではないため2番目の優先度。

**Independent Test**: テーマを変更してページを再読み込みした際、設定が保持されることで検証可能。

**Acceptance Scenarios**:

1. **Given** ユーザーがテーマを変更, **When** アプリケーションを再起動, **Then** 変更したテーマが保持されている
2. **Given** 初回起動時, **When** localStorage未設定, **Then** デフォルトでdarkテーマが適用される

---

### User Story 3 - Simplified Theme Switching (Priority: P3)

light/darkの2値のみのシンプルなテーマ切り替えにより、ユーザーインターフェースとロジックが簡素化される。

**Why this priority**: コードの保守性向上につながるが、ユーザー機能への直接的影響は少ないため3番目の優先度。

**Independent Test**: テーマトグルボタンでlight/dark間の切り替えが正常動作し、system関連のUIが削除されていることで検証可能。

**Acceptance Scenarios**:

1. **Given** ユーザーがテーマトグルを使用, **When** ボタンをクリック, **Then** light/dark間で切り替わる
2. **Given** 新しいUIが表示済み, **When** インターフェースを確認, **Then** systemオプションが存在しない

---

### Edge Cases

- localStorageが無効な環境での動作はどうなるか？
- 無効なstorageKeyが指定された場合の動作はどうなるか？
- 既存のテストモックとの互換性はどうなるか？
- localStorage内に'system'値が残っている場合の処理はどうなるか？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは既存のThemeProviderをshadcn/ui版に置き換えなければならない
- **FR-002**: システムは既存のすべてのテストが新しいプロバイダーでも成功することを保証しなければならない  
- **FR-003**: ユーザーはテーマ設定（light/dark）を引き続き変更できなければならない
- **FR-004**: システムはテーマ設定をlocalStorageに永続化しなければならない
- **FR-005**: システムはカスタムstorageKeyをサポートしなければならない
- **FR-006**: システムはresolvedThemeプロパティの代替手段を提供するか、既存コードの修正ガイダンスを提供しなければならない
- **FR-007**: システムはsystem設定を削除し、light/darkの2値のみをサポートしなければならない
- **FR-008**: システムはデフォルトテーマをdarkに設定しなければならない
- **FR-008**: システムはテスト環境での適切なモック対応を提供しなければならない
- **FR-009**: システムはresolvedThemeプロパティを削除し、既存の依存コードを修正しなければならない

### Key Entities *(include if feature involves data)*

- **ThemeProvider**: テーマ状態管理とコンテキスト提供を担当するReactコンポーネント
- **useTheme**: テーマ状態とセッター関数を提供するカスタムフック
- **Theme**: 'light' | 'dark' のユニオン型（systemを削除）
- **StorageKey**: localStorageでの設定保存に使用するキー文字列

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 既存のすべてのテストが新しいThemeProviderでも100%成功する
- **SC-002**: テーマ変更操作のレスポンス時間が現在と同等（1秒以内）を維持する
- **SC-003**: ユーザーのテーマ設定（light/dark）が再起動後も100%保持される
- **SC-004**: デフォルトテーマがdarkに設定され、初回起動時に適用される
