# テストモック整理 TODO

## 目的

テストコード内で増えているモックの多重化と重複定義を減らし、
FileSystemService や hook テスト基盤の変更コストを下げる。

## 優先度高

### 1. FileSystemService モックを単一 factory に統一する

- [x] `src/test/mocks.ts` の `createMockFileSystemService` を共通入口として扱う
- [x] `src/features/app-shell/__tests__/helpers.ts` は共通 factory を使う薄い helper に寄せる
- [x] `src/features/app-shell/actions/__tests__/openFolderAction.test.ts` の独自 `createMockFss` を廃止する
- [x] `Partial<FileSystemService>` や `unknown as FileSystemService` に依存したモックを減らす

関連箇所:

- `src/test/mocks.ts`
- `src/features/app-shell/__tests__/helpers.ts`
- `src/features/app-shell/actions/__tests__/openFolderAction.test.ts`

### 2. 古い API 名や不要メソッドをモックから除去する

- [x] `getSiblingFolders` のような旧 API 名をテストコードから取り除く
- [x] `clearThumbnailCache` など現行契約にないメソッドが残っていないか確認する
- [ ] FileSystemService の変更を型エラーで検知できる構造に寄せる

関連箇所:

- `src/test/mocks.ts`
- `src/features/folder-navigation/hooks/__tests__/useOpenImageFile.test.ts`

## 優先度中

### 3. hook テスト用の共通 wrapper を作る

- [ ] `ServicesProvider` を差し込む wrapper を `src/test` 配下へ共通化する
- [ ] 必要なケースだけ SWR のキャッシュ分離をオプションで有効化できるようにする
- [ ] 個別テストにある `createWrapper` / `ServicesWrapper` を段階的に置き換える

関連箇所:

- `src/shared/hooks/data/__tests__/useImages.test.tsx`
- `src/features/folder-navigation/hooks/__tests__/useSiblingFolders.test.tsx`
- `src/features/folder-navigation/hooks/__tests__/useThumbnail.test.tsx`
- `src/features/folder-navigation/hooks/__tests__/useThumbnailPrefetch.test.tsx`

### 4. Tauri モックの初期化責務を整理する

- [ ] モジュールモックの登録と mock 状態の reset を分ける
  - 具体的にどうするかよくわかっていない
- [ ] グローバル setup と個別テストの再初期化の役割を整理する
- [ ] 直接 `vi.mock(...)` を書くテストを減らし、共通ハンドル経由に寄せられるか検討する
  - 具体的にどうするかよくわかっていない

関連箇所:

- `src/test/setup.ts`
- `src/test/mocks.ts`
- `src/__tests__/App.test.tsx`
- `src/shared/adapters/__tests__/tauriAdapters.test.ts`

## 優先度低

### 5. fixture を scenario 単位で整理する

- [ ] sibling containers 用の fixture / builder を作る
- [ ] image list 用の fixture / builder を作る
- [ ] hook test と service test で同じシナリオを共有できるようにする

関連箇所:

- `src/features/folder-navigation/services/__tests__/getSiblingFolders.test.ts`
- `src/features/folder-navigation/hooks/__tests__/useSiblingFolders.test.tsx`
- `src/shared/hooks/data/__tests__/useImages.test.tsx`

## メモ

- 万能 builder を 1 つ作ってすべてをフラグで切り替える形にはしない
- 共通化の対象は `FileSystemService` のダブル、hook test harness、scenario fixture の 3 層に留める
- まずは API 契約の一貫性を優先し、その後に wrapper と fixture の共通化へ進む