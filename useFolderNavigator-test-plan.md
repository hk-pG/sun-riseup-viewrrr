# `useFolderNavigator` フック テスト計画

## 1. テスト環境のセットアップ

* [`src/hooks/__tests__/useFolderNavigator.test.ts`](src/hooks/__tests__/useFolderNavigator.test.ts) に `vitest` の `describe`, `it`, `expect` などを記述します。
* Reactフックのテストには `@testing-library/react` の `renderHook` を使用します。

## 2. モックの実装

* **`FileSystemService` のモック**:
  * `vi.fn()` を使用して、`FileSystemService` インターフェースのメソッド（特に `getSiblingFolders` と `getBaseName`）のモックを作成します。
  * これらのモック関数は、テストケースに応じて特定の値を返すように設定します（例: `mockResolvedValue`）。
* **`ServicesProvider` の利用**:
  * `renderHook` の `wrapper` オプションで [`ServicesProvider`](src/context/ServiceContext.tsx:16) を使用し、上記で作成したモック版 `FileSystemService` を [`useFolderNavigator`](src/hooks/useFolderNavigator.ts:17) に注入します。
* **`getSiblingFolderEntries` 関数の扱い**:
  * [`getSiblingFolderEntries`](src/service/getSiblingFolders.ts:15) 関数自体は直接モックしません。代わりに、この関数が内部で使用する `FileSystemService` のメソッド (`getSiblingFolders`, `getBaseName`) をモックすることで、[`getSiblingFolderEntries`](src/service/getSiblingFolders.ts:15) のロジックを含めたテストを行います。これにより、より統合的なテストが可能になります。

## 3. テストケースの洗い出し

* **初期状態**: フックがマウントされた直後、`entries` が空の配列であること。
* **正常系**:
  * `currentFolderPath` が指定された場合に、`FileSystemService` のモックメソッドが正しく呼び出され、期待される `FolderEntry` の配列が `entries` として設定されること。
    * 複数のフォルダが返される場合。
    * フォルダが1つだけ返される場合。
    * 該当するフォルダがない場合（`getSiblingFolders` が空配列を返す）。
* **異常系**:
  * `currentFolderPath` が空文字列の場合、`entries` が空配列のままであること（これは [`getSiblingFolderEntries`](src/service/getSiblingFolders.ts:15) の仕様に基づきます）。
  * `FileSystemService` の `getSiblingFolders` メソッドがエラーをスローした場合、`entries` が空配列になること（エラーが適切に処理されることの確認）。
  * `FileSystemService` の `getBaseName` メソッドがエラーをスローした場合、`entries` が空配列になること。
* **アンマウント時の動作**: フックがアンマウントされた際に、進行中の非同期処理が適切にキャンセルされ、`setEntries` が呼ばれないこと（`useEffect` のクリーンアップ処理の確認）。

## 4. アサーション

* `renderHook` から返される `result.current.entries` の値が期待通りであることを確認します。
* モック化した `FileSystemService` のメソッドが期待された引数で、期待された回数呼び出されたことを `expect(mockFunction).toHaveBeenCalledWith(...)` などで確認します。

## 処理フローのイメージ (Mermaid記法)

```mermaid
sequenceDiagram
    participant TestCode as テストコード
    participant RTL as React Testing Library (renderHook)
    participant FolderNavigatorHook as useFolderNavigator
    participant ServicesProvider as ServicesProvider (ラッパー)
    participant MockFileSystemService as Mock<FileSystemService>
    participant GetSiblingEntriesFn as getSiblingFolderEntries

    TestCode->>RTL: renderHook(useFolderNavigator, { wrapper: ServicesProviderWithMock })
    RTL->>FolderNavigatorHook: フックをマウント / currentFolderPath を渡す
    FolderNavigatorHook->>ServicesProvider: useServices() を呼び出し
    ServicesProvider-->>FolderNavigatorHook: MockFileSystemService を返す
    FolderNavigatorHook->>GetSiblingEntriesFn: getSiblingFolderEntries(currentFolderPath, MockFileSystemService)
    GetSiblingEntriesFn->>MockFileSystemService: getSiblingFolders(currentFolderPath)
    MockFileSystemService-->>GetSiblingEntriesFn: Promise<string[]> (モックされたパスリスト)
    loop 各パスについて
        GetSiblingEntriesFn->>MockFileSystemService: getBaseName(path)
        MockFileSystemService-->>GetSiblingEntriesFn: Promise<string> (モックされたベース名)
    end
    GetSiblingEntriesFn-->>FolderNavigatorHook: Promise<FolderEntry[]> (フォルダエントリのリスト)
    FolderNavigatorHook->>FolderNavigatorHook: setEntries(結果のリスト)
    RTL-->>TestCode: フックの最新の結果 (result.current)
    TestCode->>TestCode: entries の内容やモックの呼び出しを検証 (expect)
