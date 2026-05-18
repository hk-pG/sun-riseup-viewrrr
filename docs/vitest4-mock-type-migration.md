# vitest 4 - Mock 型エラー 修正一覧

## 背景

vitest 4 で `vi.fn()` の戻り値型が変更され、`Mock<Procedure | Constructable>` という緩い型になりました。  
その結果、**具体的な関数型が期待される場所に `vi.fn()` を直接代入するとビルドエラー**が発生します。

| vitest 3 (旧) | vitest 4 (新) |
|---|---|
| `ReturnType<typeof vi.fn>` → 具体的関数型に代入可 | `ReturnType<typeof vi.fn>` = `Mock<Procedure \| Constructable>` → 具体的関数型に代入不可 |

### エラー例

```
Type 'Mock<Procedure | Constructable>' is not assignable to type '(actionId: AppMenuBarEvent) => void'.
```

## 修正方針

`vi.fn<T>()` の型引数で型を明示し、**宣言時に初期化して型推論させる**（アプローチB）。  
`import type { Mock } from 'vitest'` は追加不要。

```typescript
// Before（vitest 3 では動作していた）
let mockHandler: ReturnType<typeof vi.fn>;
mockHandler = vi.fn();

// After（採用: アプローチB — vi.fn<T>() の型推論を活用）
let mockHandler = vi.fn<(arg: ArgType) => void>();
// beforeEach での再初期化時も型引数が必要（省略すると型エラーが復活）
mockHandler = vi.fn<(arg: ArgType) => void>();
```

> **注意（罠）**: `let` 宣言の型推論は初期値から決まるため、`beforeEach` 内での再代入でも `vi.fn<T>()` の型引数は**省略できない**。宣言と `beforeEach` 内の再初期化を必ずセットで型引数付きにすること。

### 不採用アプローチ（参考）

`Mock<T>` 型注釈を使う方法（アプローチA）も vitest 4 対応として有効だが、型の二重記述と `import type { Mock }` の追加が必要なためアプローチBを採用。

```typescript
// アプローチA（不採用）
import type { Mock } from 'vitest';
let mockHandler: Mock<(arg: ArgType) => void>;
mockHandler = vi.fn<(arg: ArgType) => void>(); // ← 型を2か所に書く必要がある
```

---

## 修正対象ファイル一覧

### 1. `src/features/app-shell/components/__tests__/AppMenuBar.test.tsx`

**期待されるプロップ型** （`AppMenuBar.tsx` より）

```typescript
// AppMenuBarProps
onMenuAction: (actionId: AppMenuBarEvent) => void;
onOpenFolder?: () => void;
```

**import 変更:**

```typescript
// Before
import { AppMenuBar, type AppMenuBarProps } from '../AppMenuBar';

// After（AppMenuBarEvent を追加）
import { AppMenuBar, type AppMenuBarEvent, type AppMenuBarProps } from '../AppMenuBar';
```

**変数宣言の変更（describe スコープ内）:**

```typescript
// Before
let mockOnMenuAction: ReturnType<typeof vi.fn>;
let mockOnOpenFolder: ReturnType<typeof vi.fn>;

// After
let mockOnMenuAction = vi.fn<(actionId: AppMenuBarEvent) => void>();
let mockOnOpenFolder = vi.fn<() => void>();
```

**beforeEach 内の変更:**

```typescript
// Before
mockOnMenuAction = vi.fn();
mockOnOpenFolder = vi.fn();

// After
mockOnMenuAction = vi.fn<(actionId: AppMenuBarEvent) => void>();
mockOnOpenFolder = vi.fn<() => void>();
```

**インライン宣言の変更:**

```typescript
// Before
const customOnMenuAction = vi.fn();

// After
const customOnMenuAction = vi.fn<(actionId: AppMenuBarEvent) => void>();
```

---

### 2. `src/features/image-viewer/hooks/__tests__/useKeyboardHandler.test.ts`

**期待されるプロップ型** （`viewerTypes.ts` より）

```typescript
// KeyboardMapping
onAction: (action: ActionType, event: KeyboardEvent) => void;
```

**import 変更:**

```typescript
// Before
import type { KeyboardMapping, KeyboardShortcut } from '../../types/viewerTypes';

// After（ActionType を追加）
import type { ActionType, KeyboardMapping, KeyboardShortcut } from '../../types/viewerTypes';
```

**変数宣言の変更（describe スコープ内）:**

```typescript
// Before
let mockOnAction: ReturnType<typeof vi.fn>;

// After
let mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
```

**beforeEach 内の変更:**

```typescript
// Before
mockOnAction = vi.fn();

// After
mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
```

---

### 3. `src/shared/utils/__tests__/keyboardConflicts.test.ts`

**期待されるプロップ型** （`viewerTypes.ts` より）

```typescript
// KeyboardMapping
onAction: (action: ActionType, event: KeyboardEvent) => void;
```

import 変更は不要（`ActionType` は既にインポート済み）。

**変数宣言の変更（describe スコープ内）:**

```typescript
// Before
let mockOnAction: ReturnType<typeof vi.fn>;

// After
let mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
```

**beforeEach 内の変更:**

```typescript
// Before
mockOnAction = vi.fn();

// After
mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
```

---

## 影響範囲まとめ

| ファイル | 修正箇所数 | 変更の種類 |
|---|---|---|
| `AppMenuBar.test.tsx` | 5箇所 | import 追加、宣言 × 2、`vi.fn<T>()` × 3 |
| `useKeyboardHandler.test.ts` | 3箇所 | import 追加、宣言 × 1、`vi.fn<T>()` × 1 |
| `keyboardConflicts.test.ts` | 2箇所 | 宣言 × 1、`vi.fn<T>()` × 1 |

**合計: 3ファイル、10箇所**

## 修正後の確認コマンド

```bash
pnpm type-check   # TypeScript 検証
pnpm lint         # Biome チェック
pnpm test         # テスト実行（35ファイル / 346テスト）
```
