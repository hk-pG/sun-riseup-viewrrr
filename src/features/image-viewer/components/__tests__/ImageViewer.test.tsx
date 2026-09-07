import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalFolderContainer } from '@/features/folder-navigation';
import type { ImageContainer } from '@/features/image-viewer';
import { ServicesProvider } from '../../../../shared/context/ServiceContext';
import { useImages } from '../../../../shared/hooks/data/useImages';
import {
  createMockFileSystemService,
  resetAllMocks,
} from '../../../../test/mocks';
import { ImageViewer } from '../..';

vi.mock('../../../../shared/hooks/data/useImages');

describe('ImageViewer', () => {
  beforeEach(() => {
    resetAllMocks();
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

  describe('Component Initialization with Container', () => {
    it('should render without errors with valid container', () => {
      const mockUseImages = vi.mocked(useImages);
      // 空の画像リストを返すモック
      mockUseImages.mockReturnValue({
        images: [],
        isLoading: false,
        error: null,
      });

      renderComponent({
        container: new LocalFolderContainer(
          '/test/folder',
          createMockFileSystemService(),
        ),
      });
      expect(screen.getByText('画像が選択されていません')).toBeInTheDocument();
    });

    it('should initialize with correct container', () => {
      const mockUseImages = vi.mocked(useImages);
      mockUseImages.mockReturnValue({
        images: [],
        isLoading: false,
        error: null,
      });

      const container = new LocalFolderContainer(
        '/test/folder',
        createMockFileSystemService(),
      );
      renderComponent({ container });

      expect(mockUseImages).toHaveBeenCalledWith(container);
    });

    it('should initialize with container only when provided', () => {
      const mockUseImages = vi.mocked(useImages);
      const container: ImageContainer = {
        getCacheKey: () => 'container:/test/folder',
        listHandles: vi.fn().mockResolvedValue([]),
        resolveRange: vi.fn().mockResolvedValue([]),
      };
      mockUseImages.mockReturnValue({
        images: [],
        isLoading: false,
        error: null,
      });

      renderComponent({ container });

      expect(mockUseImages).toHaveBeenCalledWith(container);
    });
  });
});
