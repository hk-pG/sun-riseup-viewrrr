import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileSystemService } from '@/features/folder-navigation';
import { ServicesProvider } from '../../../../shared/context/ServiceContext';
import { useImages } from '../../../../shared/hooks/data/useImages';
import { resetAllMocks, setupTauriMocks } from '../../../../test/mocks';
import { ImageViewer } from '../..';

vi.mock('../../../../shared/hooks/data/useImages');

const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: vi.fn(),
  getBaseName: vi.fn(),
  getDirName: vi.fn(),
  listImagesInFolder: vi.fn(),
  getSiblingFolders: vi.fn(),
  convertFileSrc: vi.fn(),
});

describe('ImageViewer', () => {
  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();
  });

  const renderComponent = (props: React.ComponentProps<typeof ImageViewer>) => {
    const mockFileSystemService = createMockFileSystemService();
    // The ImageViewer likely needs access to services via context.
    return render(
      <ServicesProvider services={mockFileSystemService}>
        <ImageViewer {...props} />
      </ServicesProvider>,
    );
  };

  describe('Component Initialization with Folder Paths', () => {
    it('should render without errors with valid folder path', () => {
      const mockUseImages = vi.mocked(useImages);
      // 空の画像リストを返すモック
      mockUseImages.mockReturnValue({
        images: [],
        isLoading: false,
        error: null,
      });

      renderComponent({ folderPath: '/test/folder' });
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should initialize with correct folder path', () => {
      const mockUseImages = vi.mocked(useImages);
      mockUseImages.mockReturnValue({
        images: [],
        isLoading: false,
        error: null,
      });

      renderComponent({ folderPath: '/test/folder' });

      expect(mockUseImages).toHaveBeenCalledWith('/test/folder');
    });
  });
});
