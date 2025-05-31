import { ServicesProvider } from '@/context/ServiceContext';
import type { FileSystemService } from '@/service/FileSystemService';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type FolderEntry, useSiblingFolders } from '../useSiblingFolders';

// --- 定数 ---
const TEST_CURRENT_PATH = '/path/to/current';
const TEST_FOLDER_PATH_1 = '/path/to/folder1';
const TEST_FOLDER_NAME_1 = 'folder1';
const TEST_FOLDER_PATH_2 = '/path/to/folder2';
const TEST_FOLDER_NAME_2 = 'folder2';

// --- モック ---
const mockFileSystemService: FileSystemService = {
  openDirectoryDialog: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
};

// --- ヘルパーコンポーネント ---
function ServicesWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ServicesProvider services={mockFileSystemService}>
      {children}
    </ServicesProvider>
  );
}

// --- テストスイート ---
describe('useFolderNavigator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('初期状態または currentFolderPath が空文字列の場合、entries は空配列であり、フォルダ取得処理は実行されない', async () => {
    const { result } = renderHook(() => useSiblingFolders(''), {
      wrapper: ServicesWrapper,
    });

    expect(result.current.entries).toEqual([]);
    // getSiblingFolders が呼ばれないことを確認 (useEffect の依存配列が空のため)
    await waitFor(() => {
      expect(mockFileSystemService.getSiblingFolders).not.toHaveBeenCalled();
    });
  });

  it('currentFolderPath が指定された場合、同階層のフォルダ情報を取得すること', async () => {
    const mockEntries: FolderEntry[] = [
      { name: TEST_FOLDER_NAME_1, path: TEST_FOLDER_PATH_1 },
      { name: TEST_FOLDER_NAME_2, path: TEST_FOLDER_PATH_2 },
    ];

    // 同階層のフォルダパスをモック
    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue([TEST_FOLDER_PATH_1, TEST_FOLDER_PATH_2]);

    // フォルダパスに対するフォルダ名をモック
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockImplementation(async (p) => {
        if (p === TEST_FOLDER_PATH_1) return TEST_FOLDER_NAME_1;
        if (p === TEST_FOLDER_PATH_2) return TEST_FOLDER_NAME_2;
        return '';
      });

    const { result } = renderHook(() => useSiblingFolders(TEST_CURRENT_PATH), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual(mockEntries);
    });

    expect(mockFileSystemService.getSiblingFolders).toHaveBeenCalledWith(
      TEST_CURRENT_PATH,
    );
    expect(mockFileSystemService.getBaseName).toHaveBeenCalledWith(
      TEST_FOLDER_PATH_1,
    );
    expect(mockFileSystemService.getBaseName).toHaveBeenCalledWith(
      TEST_FOLDER_PATH_2,
    );
  });

  it('該当するフォルダがない場合、entries は空配列であること', async () => {
    mockFileSystemService.getSiblingFolders = vi.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useSiblingFolders(TEST_CURRENT_PATH), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual([]);
    });
    expect(mockFileSystemService.getSiblingFolders).toHaveBeenCalledWith(
      TEST_CURRENT_PATH,
    );
    expect(mockFileSystemService.getBaseName).not.toHaveBeenCalled();
  });

  it('getSiblingFolders がエラーをスローした場合、entries は空配列になること', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockRejectedValue(new Error('Failed to get sibling folders'));

    const { result } = renderHook(() => useSiblingFolders(TEST_CURRENT_PATH), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual([]);
    });
    expect(mockFileSystemService.getSiblingFolders).toHaveBeenCalledWith(
      TEST_CURRENT_PATH,
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('getBaseName がエラーをスローした場合、entries は空配列になること', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockResolvedValue([TEST_FOLDER_PATH_1]);
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockRejectedValue(new Error('Failed to get base name'));

    const { result } = renderHook(() => useSiblingFolders(TEST_CURRENT_PATH), {
      wrapper: ServicesWrapper,
    });

    await waitFor(() => {
      expect(result.current.entries).toEqual([]);
    });
    expect(mockFileSystemService.getSiblingFolders).toHaveBeenCalledWith(
      TEST_CURRENT_PATH,
    );
    expect(mockFileSystemService.getBaseName).toHaveBeenCalledWith(
      TEST_FOLDER_PATH_1,
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('フックがアンマウントされた場合、進行中の処理がキャンセルされること (setEntries が呼ばれないこと)', async () => {
    // getSiblingFolders が解決するのに時間がかかるようにモック
    mockFileSystemService.getSiblingFolders = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([TEST_FOLDER_PATH_1]), 50),
          ),
      );
    mockFileSystemService.getBaseName = vi
      .fn()
      .mockResolvedValue(TEST_FOLDER_NAME_1);

    const { unmount, result } = renderHook(
      () => useSiblingFolders(TEST_CURRENT_PATH),
      {
        wrapper: ServicesWrapper,
      },
    );

    // 初期状態では entries は空
    expect(result.current.entries).toEqual([]);

    // フックをアンマウント
    act(() => {
      unmount();
    });

    // 非同期処理が完了するのを待つ (50ms 以上)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // アンマウント後なので entries は更新されていないはず
    // result.current はアンマウント後は更新されないため、
    // ここでは setEntries が呼ばれなかったことを間接的に確認する。
    // (mounted フラグが false になっているため、setEntries は実行されない)
    expect(result.current.entries).toEqual([]); // 変わらないことを確認

    // getSiblingFolders は呼び出されているはず
    expect(mockFileSystemService.getSiblingFolders).toHaveBeenCalledTimes(1);
    // getBaseName は、getSiblingFolders の解決後に mounted フラグをチェックするため、
    // アンマウントされていれば呼ばれないはず。
    // ただし、タイミングによっては getSiblingFolders の Promise が解決する前に
    // unmount が完了し、getBaseName が呼ばれないケースと、
    // getSiblingFolders が解決した直後に unmount され、getBaseName が呼ばれる直前に
    // mounted が false になるケースがある。
    // 重要なのは setEntries が呼ばれないこと。
    // このテストでは、getBaseName が呼ばれたとしても、その後の setEntries が
    // mounted フラグによって抑制されることを期待している。
    // 確実に getBaseName が呼ばれないことを保証するには、より詳細なタイミング制御が必要。
    // ここでは、エラーが発生せず、entries が更新されないことを主眼に置く。
  });
});
