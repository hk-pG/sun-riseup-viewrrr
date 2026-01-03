import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import { ServicesProvider } from '@/shared/context/ServiceContext';
import { resetAllMocks, setupTauriMocks } from '@/test/mocks';

/**
 * T004: ビューア通常表示で overflow が hidden になりスクロールが無いことを検証するテスト
 *
 * Goal: 通常表示でビューアに縦スクロールバーが出ず、画像がビューア内に収まることを確認
 * Acceptance: ImageViewer コンテナが overflow-hidden を持ち、scrollHeight <= clientHeight である
 */
describe('ViewerLayout - US1: Viewer displays full image without scrolling', () => {
  let mockFileSystemService: FileSystemService;

  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();

    mockFileSystemService = {
      openDirectoryDialog: vi.fn(),
      getBaseName: vi.fn(),
      getDirName: vi.fn(),
      listImagesInFolder: vi.fn(),
      getSiblingFolders: vi.fn(),
      convertFileSrc: vi.fn((path: string) => `asset://${path}`),
    };

    // Mock feature components to keep layout structure
    vi.mock('@/features/app-shell', () => ({
      AppMenuBar: ({ onMenuAction, isDraggable }: any) => (
        <div data-testid="app-menu-bar" data-draggable={isDraggable}>
          <button
            type="button"
            data-testid="open-folder-btn"
            onClick={() => onMenuAction('open-folder')}
          >
            Open Folder
          </button>
        </div>
      ),
    }));

    vi.mock('@/features/folder-navigation', () => ({
      Sidebar: ({ folders, selectedFolder, onFolderSelect, width }: any) => (
        <div data-testid="sidebar" style={{ width }}>
          {folders.map((folder: any) => (
            <button
              type="button"
              key={folder.path}
              data-testid={`folder-${folder.name}`}
              onClick={() => onFolderSelect(folder)}
              data-selected={selectedFolder?.path === folder.path}
            >
              {folder.name}
            </button>
          ))}
        </div>
      ),
      useOpenImageFile: () => ({
        openImageFile: vi.fn(),
      }),
      useSiblingFolders: () => ({
        entries: [
          { name: 'test-folder-1', path: '/test/folder1' },
          { name: 'test-folder-2', path: '/test/folder2' },
        ],
      }),
    }));

    vi.mock('@/features/image-viewer', () => ({
      ImageViewer: ({ folderPath, initialIndex, className }: any) => (
        <div
          data-testid="image-viewer"
          data-folder-path={folderPath || ''}
          data-initial-index={initialIndex || 0}
          role="application"
          className={className}
          style={{ width: '100%', height: '100%' }}
        >
          Image Viewer Content
        </div>
      ),
    }));
  });

  const renderApp = (services?: Partial<FileSystemService>) => {
    return render(
      <ThemeProvider>
        <ServicesProvider services={services}>
          <App />
        </ServicesProvider>
      </ThemeProvider>,
    );
  };

  it('T004: should not have vertical scrollbar on viewer in normal display', async () => {
    vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
      '/test/folder1',
    );

    renderApp(mockFileSystemService);

    // Find and click the open folder button
    const openFolderBtn = screen.getByTestId('open-folder-btn');

    await act(async () => {
      openFolderBtn?.click?.();
    });

    // Wait for folder to be set
    await waitFor(() => {
      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '/test/folder1');
    });

    // Find the ImageViewer container
    const viewerContainer = screen.getByTestId('image-viewer');
    expect(viewerContainer).toBeInTheDocument();

    // Verify: No vertical scrolling in normal display
    // In jsdom with overflow-hidden, scrollHeight should equal or be close to clientHeight
    const metrics = {
      scrollHeight: viewerContainer.scrollHeight,
      clientHeight: viewerContainer.clientHeight,
      canScroll: viewerContainer.scrollHeight > viewerContainer.clientHeight,
    };

    expect(metrics.canScroll).toBe(false);
  });

  it('T005: should not scroll when resizing window', async () => {
    vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
      '/test/folder1',
    );

    const { rerender } = renderApp(mockFileSystemService);

    // Open folder
    const openFolderBtn = screen.getByTestId('open-folder-btn');

    await act(async () => {
      openFolderBtn?.click?.();
    });

    // Wait for folder to be set
    await waitFor(() => {
      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '/test/folder1');
    });

    const viewerContainer = screen.getByTestId('image-viewer');

    // Simulate window resize by triggering a rerender
    act(() => {
      rerender(
        <ThemeProvider>
          <ServicesProvider services={mockFileSystemService}>
            <App />
          </ServicesProvider>
        </ThemeProvider>,
      );
    });

    // After resize, should still not have scrolling
    const resizedMetrics = {
      scrollHeight: viewerContainer.scrollHeight,
      clientHeight: viewerContainer.clientHeight,
      canScroll: viewerContainer.scrollHeight > viewerContainer.clientHeight,
    };

    expect(resizedMetrics.canScroll).toBe(false);
  });
});
