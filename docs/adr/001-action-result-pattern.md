# ADR-001: ActionContext を Result パターンに移行し関心分離を改善する

## ステータス

Accepted

## 日付

2026-03-15

## コンテキスト

### 現状の問題

Issue #17 で導入した Command Registry パターンにおける `ActionHandler` は `ActionContext`（5 プロパティの God Object）を受け取り、アクション内部で直接 `setAppState` / `startTransition` を呼び出して状態を変更していた。

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

この設計には以下の問題があった：

1. **過剰な依存（ISP 違反）**: 各アクションは 5 プロパティ中 1〜3 個しか使わないが、全プロパティにアクセスできる
   - `openFolderAction`: `fss`, `startTransition`, `setAppState` のみ使用
   - `toggleThemeAction`: `themeApi` のみ使用（5 中 1）
2. **テストの肥大化**: 全テストで 5 プロパティ全てのモックが必要（`createMockContext` が 15 行）
3. **関心の混在**: 「何をするか（ドメインロジック）」と「どう適用するか（React 状態更新）」が同一関数内に混在
4. **再利用性の欠如**: アクションロジックが React の `setAppState` / `startTransition` に直接依存
5. **DI 二重化**: 同じ `fss` が ServiceContext と ActionContext の 2 つの経路で注入される

## 決定

**Result パターン** を採用する。各アクションは副作用を直接実行せず、「何が起きたか」を表す `ActionResult`（Discriminated Union）を返す。キャンセル/何もしない場合は `null` を返す。状態適用は `applyResult` 関数に一元化する。

### 型設計

```typescript
/** フォルダ選択結果（openFolderAction / openImageAction 共通） */
export interface FolderSelectedResult {
  type: 'folder-selected';
  folderPath: string;
  initialImageIndex: number;
}

/** テーマ切替結果 */
export interface ThemeToggledResult {
  type: 'theme-toggled';
  theme: 'dark' | 'light';
}

/** 全結果の discriminated union。キャンセル時は null。 */
export type ActionResult = FolderSelectedResult | ThemeToggledResult;

/** 依存が束縛済みのハンドラー */
export type BoundActionHandler = () => Promise<ActionResult | null>;

/** アクションの計算に必要な外部依存（読み取り側） */
export interface ActionDependencies {
  fss: FileSystemService;
  openImageFile: () => Promise<OpenImageFileResult | null>;
  currentTheme: 'dark' | 'light';
}

/** ActionResult を副作用に変換するための依存（書き込み側） */
export interface ResultApplier {
  startTransition: (callback: () => void) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setTheme: (theme: 'dark' | 'light') => void;
}
```

### アクション設計

各アクションは必要最小限の引数のみを受け取り、結果データを返す純粋関数：

```typescript
// openFolderAction: fss のみ
export const openFolderAction = async (
  fss: FileSystemService,
): Promise<FolderSelectedResult | null> => { ... };

// openImageAction: openImageFile のみ
export const openImageAction = async (
  openImageFile: () => Promise<OpenImageFileResult | null>,
): Promise<FolderSelectedResult | null> => { ... };

// toggleThemeAction: currentTheme のみ（同期関数）
export const toggleThemeAction = (
  currentTheme: 'dark' | 'light',
): ThemeToggledResult => { ... };
```

### 副作用適用の一元化（applyResult）

```typescript
export function applyResult(
  result: ActionResult | null,
  applier: ResultApplier,
): void {
  if (result === null) return;

  switch (result.type) {
    case 'folder-selected':
      applier.startTransition(() => {
        applier.setAppState((prev) => ({
          ...prev,
          currentFolderPath: result.folderPath,
          initialImageIndex: result.initialImageIndex,
        }));
      });
      break;
    case 'theme-toggled':
      applier.setTheme(result.theme);
      break;
  }
}
```

### 依存の分離

```
App.tsx
  ├── ActionDependencies（読み取り側）
  │     fss ──────────────→ openFolderAction(fss)
  │     openImageFile ────→ openImageAction(openImageFile)
  │     currentTheme ─────→ toggleThemeAction(currentTheme)
  │
  │     ↓ BoundActionHandler()
  │     ↓ ActionResult | null
  │
  └── ResultApplier（書き込み側）
        startTransition ──→ folder-selected の適用
        setAppState ──────→ folder-selected の適用
        setTheme ─────────→ theme-toggled の適用
```

## 帰結

### メリット

1. **関心の分離**: ビジネスロジック（アクション）と副作用適用（applyResult）が明確に分離
2. **テスト容易性の大幅な向上**: 各アクションのテストは最小限のモックで戻り値をアサートするだけ。`openFolderAction` のテストでは `FileSystemService` のモックのみ（5→1 依存）
3. **型安全性**: Discriminated Union の exhaustive check により未処理の結果型がコンパイル時に検出
4. **依存の最小化**: `toggleThemeAction` は `'dark' | 'light'` のプリミティブ値のみ。副作用関数にアクセス不可
5. **純粋関数化**: `toggleThemeAction` は完全に同期的な純粋関数。テスト・理解が最も容易
6. **Zustand 移行への準備**: Issue #20 の Zustand 移行時に `applyResult` のみ書き換えれば済む

### デメリット

1. **既存ユニットテストの全面書き換え**: 16 件のユニットテストが書き換え対象（ただし統合テスト 13 件は影響なし）
2. **間接性の増加**: アクション → 結果 → 適用の 2 ステップになりコード追跡が 1 段階増加
3. **型定義の増加**: 新規型が 6 つ追加（`FolderSelectedResult`, `ThemeToggledResult`, `ActionResult`, `BoundActionHandler`, `ActionDependencies`, `ResultApplier`）

### 影響ファイル

| ファイル | 変更内容 |
|---|---|
| `actions/types.ts` | 新型追加、旧型（ActionContext, ActionHandler）削除 |
| `actions/openFolderAction.ts` | `(ctx) → void` → `(fss) → FolderSelectedResult \| null` |
| `actions/openImageAction.ts` | `(ctx) → void` → `(fn) → FolderSelectedResult \| null` |
| `actions/toggleThemeAction.ts` | `(ctx) → void` → `(theme) → ThemeToggledResult`（同期化） |
| `actions/actionRegistry.ts` | `createActionRegistry(deps)` に変更 |
| `hooks/useAppActions.ts` | 2 引数化 + `applyResult` 追加 |
| `actions/index.ts` | エクスポート更新 |
| `App.tsx` | `useAppActions` 呼び出し変更 |
| `__tests__/helpers.ts` | `createMockContext` → `createMockDeps` + `createMockApplier` |

## 設計判断

| 決定事項 | 却下した選択肢 | 理由 |
|---|---|---|
| キャンセル = `null` | `{ type: 'noop' }` バリアント | null ガードが 1 行で完結。switch の exhaustive check は非 null の ActionResult に対して有効。noop は冗長 |
| `FolderSelectedResult` 共有 | アクションごとに別型 | 同一の副作用（フォルダ遷移 + インデックス設定）のため DRY |
| `currentTheme` プリミティブ | `themeApi` オブジェクト全体 | 読み取りに必要なのは値のみ。setTheme へのアクセスを遮断 |
| `toggleThemeAction` 同期化 | async のまま維持 | 非同期処理なし。Registry の async ラッパーで BoundActionHandler に適合 |
| `applyResult` を useAppActions.ts 内配置 | 別ファイル | 密結合だがファイル数を増やさない。テスト用に個別エクスポート |

## 代替案

### A. ActionContext を維持し戻り値だけ変更

```typescript
type ActionHandler = (context: ActionContext) => Promise<ActionResult>;
```

**却下理由**: 各アクションが依然として全プロパティにアクセス可能。ISP 違反が残存。テストモックの簡略化にも貢献しない。

### B. switch/dispatch パターン（Map-based Registry を廃止）

**却下理由**: 既存の Registry パターンとの一貫性が失われる。Open/Closed 原則に反し、新アクション追加時に switch 分岐の追加が必要。

### C. noop バリアントで表現

```typescript
export type ActionResult = ... | { type: 'noop' };
```

**却下理由**: `null` は「何も起きなかった」のセマンティクスとして最も自然。`applyResult` 内で `case 'noop': break;` を書く必要がある。null ガードは 1 行で完結し、switch の exhaustive check は非 null の ActionResult に対して引き続き有効。

## 参考

- Issue #29 — 本 ADR の起点
- Issue #17 — Command Registry パターン導入
- Issue #20 — Zustand 移行（applyResult のみ書き換え対象）
