# ADR-001: ActionContext を Result パターンに移行し関心分離を改善する

## ステータス

提案中 (Proposed)

## コンテキスト

### 現状の問題

現在の `ActionHandler` は `ActionContext`（5プロパティの God Object）を受け取り、アクション内部で直接 `setAppState` / `startTransition` を呼び出して状態を変更している。

```typescript
export interface ActionContext {
  fss: FileSystemService;
  openImageFile: () => Promise<OpenImageFileResult | null>;
  themeApi: { theme: 'dark' | 'light'; setTheme: ... };
  startTransition: (callback: () => void) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}
export type ActionHandler = (context: ActionContext) => Promise<void>;
```

この設計には以下の問題がある：

1. **過剰な依存**: 各アクションは 5 プロパティ中 2〜3 個しか使わないが、全プロパティにアクセスできてしまう
   - `openFolderAction`: `fss`, `startTransition`, `setAppState` のみ使用
   - `toggleThemeAction`: `themeApi` のみ使用
2. **テストの肥大化**: 全テストで 5 プロパティ全てのモックが必要（`createMockContext` が 15 行）
3. **関心の混在**: 「何をするか（ビジネスロジック）」と「どう適用するか（React 状態更新）」が同一関数内に混在
4. **再利用性の欠如**: アクションロジックが React の `setAppState` / `startTransition` に直接依存しているため、別コンテキストでの再利用が困難

### 背景

Issue #29 として改善が要請された。プロジェクトは機能ベースアーキテクチャを採用しており、関心の分離を重視している。

## 決定

**Result パターン** を採用する。各アクションは副作用を直接実行せず、「何が起きたか」を表す `ActionResult`（Discriminated Union）を返す。状態適用は `applyResult` 関数に一元化する。

### 新しい型設計

```typescript
/** アクション結果の discriminated union */
export type ActionResult =
  | { type: 'navigate-folder'; folderPath: string; initialImageIndex: number }
  | { type: 'set-theme'; theme: 'dark' | 'light' }
  | { type: 'noop' };

/** 依存が束縛済みのハンドラー */
export type BoundActionHandler = () => Promise<ActionResult>;

/** アクションが必要とする外部依存 */
export interface ActionDependencies {
  fss: FileSystemService;
  openImageFile: () => Promise<OpenImageFileResult | null>;
  themeApi: { theme: 'dark' | 'light'; setTheme: (theme: 'dark' | 'light') => void };
}

/** ActionResult を副作用に変換するための依存 */
export interface ResultApplier {
  startTransition: (callback: () => void) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setTheme: (theme: 'dark' | 'light') => void;
}
```

### 新しいアクション設計

各アクションは必要最小限の引数のみを受け取る：

```typescript
// openFolderAction: fss のみ
export const openFolderAction = async (fss: FileSystemService): Promise<ActionResult> => { ... };

// openImageAction: openImageFile のみ
export const openImageAction = async (
  openImageFile: () => Promise<OpenImageFileResult | null>,
): Promise<ActionResult> => { ... };

// toggleThemeAction: currentTheme のみ
export const toggleThemeAction = async (currentTheme: 'dark' | 'light'): Promise<ActionResult> => { ... };
```

### applyResult（副作用適用の一元化）

```typescript
export function applyResult(result: ActionResult, applier: ResultApplier): void {
  switch (result.type) {
    case 'navigate-folder':
      applier.startTransition(() => {
        applier.setAppState((prev) => ({
          ...prev,
          currentFolderPath: result.folderPath,
          initialImageIndex: result.initialImageIndex,
        }));
      });
      break;
    case 'set-theme':
      applier.setTheme(result.theme);
      break;
    case 'noop':
      break;
  }
}
```

### Registry の変更

`createActionRegistry` が `ActionDependencies` を受け取り、各アクションに必要な依存のみを束縛する：

```typescript
export function createActionRegistry(deps: ActionDependencies): ActionRegistry {
  return new Map([
    ['open-folder', () => openFolderAction(deps.fss)],
    ['open-image', () => openImageAction(deps.openImageFile)],
    ['toggle-theme', () => toggleThemeAction(deps.themeApi.theme)],
  ]);
}
```

## 帰結

### メリット

1. **関心の分離**: ビジネスロジック（アクション）と副作用適用（applyResult）が明確に分離
2. **テスト容易性の向上**: 各アクションのテストでは最小限のモックのみ必要。戻り値をアサートするだけで良い
3. **型安全性**: Discriminated Union の exhaustive check により、未処理の結果型がコンパイル時に検出可能
4. **拡張性**: 新しい `ActionResult` バリアントを追加するだけで新しい副作用パターンに対応可能
5. **依存の最小化**: 各アクションが本当に必要なものだけを受け取るため、不必要な結合がなくなる

### デメリット

1. **既存ユニットテストの全面書き換え**: 16件のユニットテストが影響を受ける（ただし統合テスト 13件は影響なし）
2. **間接性の増加**: アクション → 結果 → 適用 の2ステップになるため、コードの追跡が1段階増える
3. **型定義の増加**: `ActionResult`, `BoundActionHandler`, `ActionDependencies`, `ResultApplier` など新規型が4つ追加

### 影響

- `ActionContext` と `ActionHandler` 型は削除される
- `createMockContext` テストヘルパーは不要になる
- `app-shell` feature の公開 API（エクスポート型）が変更される
- App.tsx の `useAppActions` 呼び出しが2引数に変更される

## 代替案

### A. ActionContext を維持し戻り値だけ変更

```typescript
type ActionHandler = (context: ActionContext) => Promise<ActionResult>;
```

**却下理由**: 各アクションが依然として全プロパティにアクセス可能。関心分離の目標を達成できない。テストモックの簡略化にも貢献しない。

### B. switch/dispatch パターン（Map-based Registry を廃止）

```typescript
function dispatch(actionId: AppMenuBarEvent, deps: ActionDependencies): Promise<ActionResult> {
  switch (actionId) {
    case 'open-folder': return openFolderAction(deps.fss);
    // ...
  }
}
```

**却下理由**: 既存の Registry パターンとの一貫性が失われる。Open/Closed 原則に反し、新アクション追加時に switch 分岐を追加する必要がある。Map-based Registry はエントリの追加だけで済む。

### C. noop を null で表現（`ActionResult | null`）

**却下理由**: TypeScript の exhaustive check が使えない。呼び出し側で null チェックが必要になり、`switch` での統一的なハンドリングができない。

## 参考

- Issue #29
- [docs/frontend-architecture-analysis.md](../frontend-architecture-analysis.md)
