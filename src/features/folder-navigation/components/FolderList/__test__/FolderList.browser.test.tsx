import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useThumbnail } from '@/features/folder-navigation/hooks/useThumbnail';
import type { FolderInfo } from '@/features/folder-navigation/types/folderTypes';
import { FolderList } from '../FolderList';

vi.mock('@/features/folder-navigation/hooks/useThumbnail', () => ({
  useThumbnail: vi.fn(),
}));

const FOLDER_COUNT = 50;
/** ビューポート外のフォルダ（初期描画窓に入らないこと） */
const OFFSCREEN_FOLDER = 'Folder 15';
/**
 * 初期描画で許容する useThumbnail 呼び出し先の上限。
 * 可視件数（〜3）+ overscan(3×2) + 実測のゆとり。全件(50)より十分小さくする。
 */
const MAX_INITIAL_THUMBNAIL_CALLS = 12;

const mockThumbnailIdle = () => {
  vi.mocked(useThumbnail).mockReturnValue({
    thumbnail: null,
    isLoading: false,
    isError: false,
  });
};

describe('仮想スクロールの初期表示 (Browser Mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThumbnailIdle();
  });

  it('初期表示では描画窓内のフォルダにだけ useThumbnail が呼ばれること', async () => {
    const folders: FolderInfo[] = Array.from({ length: FOLDER_COUNT }).map(
      (_, i) => ({
        name: `Folder ${i + 1}`,
        path: `/path/to/folder${i + 1}`,
        imageCount: i + 1,
      }),
    );

    render(
      // 高さを確定させ、仮想リストがビューポート基準で窓を切れるようにする
      <div
        style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
      >
        <FolderList folders={folders} onFolderSelect={vi.fn()} />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText('Folder 1')).toBeInTheDocument();
    });

    // 初期窓の外は DOM に無い（＝その行の IPC も走らない）
    expect(screen.queryByText(OFFSCREEN_FOLDER)).not.toBeInTheDocument();

    // パス単位で数える（Strict Mode の二重呼び出しで件数だけ膨らむのを避ける）
    const calledPaths = new Set(
      vi.mocked(useThumbnail).mock.calls.map(([path]) => path),
    );

    expect(calledPaths.size).toBeGreaterThan(0);
    expect(calledPaths.size).toBeLessThan(FOLDER_COUNT);
    expect(calledPaths.size).toBeLessThanOrEqual(MAX_INITIAL_THUMBNAIL_CALLS);
  });
});
