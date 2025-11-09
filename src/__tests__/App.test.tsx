import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppMenuBarProps } from '@/features/app-shell';
import type { SidebarProps } from '@/features/folder-navigation';
import type { ImageViewerProps } from '@/features/image-viewer';
import App from '../App';
import { ThemeProvider } from '../components/theme-provider';
import type { FileSystemService } from '../features/folder-navigation/services/FileSystemService';
import { ServicesProvider } from '../shared/context/ServiceContext';
import { resetAllMocks, setupTauriMocks } from '../test/mocks';

// Create a mock function that can be controlled in tests
const mockOpenImageFile = vi.fn();

// Mock the feature components
// For testing rendering App's children and their interactions
vi.mock('../features/app-shell', () => ({
  AppMenuBar: ({ onMenuAction, isDraggable }: AppMenuBarProps) => (
    <div data-testid="app-menu-bar" data-draggable={isDraggable}>
      {/* For testing parameter 'onMenuAction' handling */}
      <button
        type="button"
        data-testid="open-folder-btn"
        onClick={() => onMenuAction('open-folder')}
      >
        Open Folder
      </button>
      <button
        type="button"
        data-testid="open-image-btn"
        onClick={() => onMenuAction('open-image')}
      >
        Open Image
      </button>
    </div>
  ),
}));

vi.mock('../features/folder-navigation', () => ({
  Sidebar: ({
    folders,
    selectedFolder,
    onFolderSelect,
    width,
  }: SidebarProps) => (
    <div data-testid="sidebar" style={{ width }}>
      {/* propsで渡されたフォルダ情報をテストするために各データを属性として付与 */}
      {folders.map((folder: { path: string; name: string }) => (
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
  // Mock the useFileSystemService hook to return our mock service
  useOpenImageFile: () => ({
    openImageFile: mockOpenImageFile,
  }),
  // Mock the useSiblingFolders hook to return a fixed set of folders
  useSiblingFolders: () => ({
    entries: [
      { name: 'folder1', path: '/test/folder1' },
      { name: 'folder2', path: '/test/folder2' },
    ],
  }),
}));

vi.mock('../features/image-viewer', () => ({
  ImageViewer: ({ folderPath, initialIndex, className }: ImageViewerProps) => (
    // For testing rendering and props handling
    <div
      data-testid="image-viewer"
      data-folder-path={folderPath || ''}
      data-initial-index={initialIndex || 0}
      data-key={folderPath || ''}
      className={className}
    >
      Image Viewer
    </div>
  ),
}));

const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
});

describe('App Component', () => {
  let mockFileSystemService: ReturnType<typeof createMockFileSystemService>;

  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();
    mockFileSystemService = createMockFileSystemService();
    mockOpenImageFile.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const renderApp = (services?: Partial<FileSystemService>) => {
    return render(
      <ThemeProvider>
        <ServicesProvider services={services}>
          <App />
        </ServicesProvider>
        ,
      </ThemeProvider>,
    );
  };

  describe('Component Rendering and Initialization', () => {
    it('should render without errors', () => {
      renderApp();

      // モックに付けた各testidが正しくレンダリングされていることを確認
      expect(screen.getByTestId('app-menu-bar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
    });

    it('should initialize with empty folder path', () => {
      renderApp();

      const imageViewer = screen.getByTestId('image-viewer');
      // モックに付けた各任用の属性が空の状態で初期化されていることを確認
      expect(imageViewer).toHaveAttribute('data-folder-path', '');
      expect(imageViewer).toHaveAttribute('data-initial-index', '0');
    });

    it('should set menu bar as draggable', () => {
      renderApp();

      const menuBar = screen.getByTestId('app-menu-bar');
      // INFO: UIに関する設定だが、フレームレスのため確実にdraggable属性が設定されている必要がある
      expect(menuBar).toHaveAttribute('data-draggable', 'true');
    });
  });

  describe('Folder Selection Event Handling', () => {
    it('should handle open-folder menu action', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        '/selected/folder',
      );
      renderApp(mockFileSystemService);

      const openFolderBtn = screen.getByTestId('open-folder-btn');
      fireEvent.click(openFolderBtn);

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      await waitFor(() => {
        const imageViewer = screen.getByTestId('image-viewer');
        // モックのImageViewerにセットされた"選択されたフォルダパス"が正しく反映されていることを確認
        expect(imageViewer).toHaveAttribute(
          'data-folder-path',
          '/selected/folder',
        );
        expect(imageViewer).toHaveAttribute('data-initial-index', '0');
      });
    });

    // open-folderボタン押下後、ダイアログがnullを返す（キャンセル）場合に状態が変化しないことを検証
    it('should not update folder path when dialog is cancelled', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        null,
      );
      renderApp(mockFileSystemService);

      const openFolderBtn = screen.getByTestId('open-folder-btn');
      fireEvent.click(openFolderBtn);

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '');
    });

    it('should handle folder selection from sidebar', () => {
      renderApp();

      const folderBtn = screen.getByTestId('folder-folder1');
      fireEvent.click(folderBtn);

      const imageViewer = screen.getByTestId('image-viewer');
      // useSiblingFoldersのモックが固定値を返すため、
      // その内の1つが選択された場合にImageViewer側に選択値が反映されることを確認
      expect(imageViewer).toHaveAttribute('data-folder-path', '/test/folder1');
    });

    it('should update selected folder in sidebar', () => {
      renderApp();

      const folderBtn = screen.getByTestId('folder-folder1');
      fireEvent.click(folderBtn);

      expect(folderBtn).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Image File Opening Event Handling', () => {
    it('should handle open-image menu action with successful result', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue({
        folderPath: '/image/folder',
        index: 2,
      });

      renderApp(mockFileSystemService);

      const openImageBtn = screen.getByTestId('open-image-btn');
      fireEvent.click(openImageBtn);

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      await waitFor(() => {
        const imageViewer = screen.getByTestId('image-viewer');
        expect(imageViewer).toHaveAttribute(
          'data-folder-path',
          '/image/folder',
        );
        expect(imageViewer).toHaveAttribute('data-initial-index', '2');
      });
    });

    it('should not update state when open-image returns null', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue(null);

      renderApp(mockFileSystemService);

      const openImageBtn = screen.getByTestId('open-image-btn');
      fireEvent.click(openImageBtn);

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '');
      // 初期状態のままなので、indexは0のまま
      expect(imageViewer).toHaveAttribute('data-initial-index', '0');
    });

    it('should handle open-image with missing folderPath', async () => {
      vi.mocked(mockOpenImageFile).mockResolvedValue({
        index: 1,
      });

      renderApp(mockFileSystemService);

      const openImageBtn = screen.getByTestId('open-image-btn');
      fireEvent.click(openImageBtn);

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '');
      // React 19 improvement: Don't update state when folderPath is missing
      expect(imageViewer).toHaveAttribute('data-initial-index', '0');
    });
  });

  describe('State Management', () => {
    it('should reset initial image index when opening folder', async () => {
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockResolvedValue(
        '/new/folder',
      );
      renderApp(mockFileSystemService);

      // First set a different folder to establish initial state
      const folderBtn = screen.getByTestId('folder-folder1');
      fireEvent.click(folderBtn);

      // Then open a new folder via dialog
      const openFolderBtn = screen.getByTestId('open-folder-btn');
      fireEvent.click(openFolderBtn);

      await waitFor(() => {
        const imageViewer = screen.getByTestId('image-viewer');
        expect(imageViewer).toHaveAttribute('data-folder-path', '/new/folder');
        expect(imageViewer).toHaveAttribute('data-initial-index', '0');
      });
    });

    it('should maintain folder path consistency between sidebar and image viewer', () => {
      renderApp();

      // サイドバーでフォルダを選択
      const folderBtn = screen.getByTestId('folder-folder2');
      fireEvent.click(folderBtn);

      // ImageViewerに選択されたフォルダパスが反映されていることを確認
      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '/test/folder2');

      // サイドバー側でもクリックされたフォルダが選択状態になっていることを確認
      const selectedFolder = screen.getByTestId('folder-folder2');
      expect(selectedFolder).toHaveAttribute('data-selected', 'true');
    });

    // folder pathが変化した際にImageViewerが再レンダリングされる（keyが変わる）ことを検証
    it('should re-render ImageViewer with new key when folder path changes', () => {
      renderApp();

      // 初期状態のImageViewerを取得
      const initialImageViewer = screen.getByTestId('image-viewer');
      // 初期状態のフォルダパスを取得
      const initialKey = initialImageViewer.getAttribute('data-folder-path');

      // フォルダを切り替える
      const folderBtn = screen.getByTestId('folder-folder1');
      fireEvent.click(folderBtn);

      // フォルダが切り替わった後のImageViewerを取得
      const updatedImageViewer = screen.getByTestId('image-viewer');
      const updatedKey = updatedImageViewer.getAttribute('data-folder-path');

      // 初期状態と切り替え後のフォルダパスが異なることを確認
      expect(updatedKey).not.toBe(initialKey);
      expect(updatedKey).toBe('/test/folder1');
    });
  });

  describe('Error Handling', () => {
    // open-folder時にダイアログでエラーが発生してもアプリがクラッシュせず、状態が維持されることを検証
    it('should handle errors in folder dialog gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(mockFileSystemService.openDirectoryDialog).mockRejectedValue(
        new Error('Dialog error'),
      );
      renderApp(mockFileSystemService);

      const openFolderBtn = screen.getByTestId('open-folder-btn');
      fireEvent.click(openFolderBtn);

      await waitFor(() => {
        expect(mockFileSystemService.openDirectoryDialog).toHaveBeenCalled();
      });

      // Wait a bit more to ensure any async error handling is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not crash and maintain current state
      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '');

      consoleErrorSpy.mockRestore();
    });

    // open-image時にファイルオープンでエラーが発生してもアプリがクラッシュせず、状態が維持されることを検証
    it('should handle errors in image file opening gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(mockOpenImageFile).mockRejectedValue(
        new Error('Open image error'),
      );

      renderApp(mockFileSystemService);

      const openImageBtn = screen.getByTestId('open-image-btn');
      fireEvent.click(openImageBtn);

      await waitFor(() => {
        expect(mockOpenImageFile).toHaveBeenCalled();
      });

      // Wait a bit more to ensure any async error handling is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not crash and maintain current state
      const imageViewer = screen.getByTestId('image-viewer');
      expect(imageViewer).toHaveAttribute('data-folder-path', '');

      consoleErrorSpy.mockRestore();
    });
  });
});
