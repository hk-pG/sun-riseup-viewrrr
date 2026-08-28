import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalFolderContainer } from '@/features/folder-navigation';
import type { ImageContainer } from '@/features/image-viewer';
import { ServicesProvider } from '../../../../shared/context/ServiceContext';
import { useImages } from '../../../../shared/hooks/data/useImages';
import {
  createMockFileSystemService,
  resetAllMocks,
  setupTauriMocks,
} from '../../../../test/mocks';
import { ImageViewer } from '../..';

vi.mock('../../../../shared/hooks/data/useImages');

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

  const twoImages = [
    {
      id: 'page-1',
      name: 'page-1.jpg',
      assetUrl: '/page-1.jpg',
    },
    {
      id: 'page-2',
      name: 'page-2.jpg',
      assetUrl: '/page-2.jpg',
    },
  ];

  describe('stage reading (right-opening)', () => {
    const mockRect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 400,
      right: 400,
      width: 400,
      height: 400,
      toJSON: () => ({}),
    };

    const renderWithImages = () => {
      vi.mocked(useImages).mockReturnValue({
        images: twoImages,
        isLoading: false,
        error: null,
      });
      return renderComponent({
        container: new LocalFolderContainer(
          '/test/folder',
          createMockFileSystemService(),
        ),
        settings: { autoHideControls: false },
      });
    };

    it('shows a page HUD instead of a button toolbar', () => {
      renderWithImages();

      expect(screen.getByText('1 / 2')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '次の画像' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'ズームイン' }),
      ).not.toBeInTheDocument();
    });

    it('advances on left-half click (right-opening)', () => {
      renderWithImages();
      const stage = screen.getByRole('application');
      vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue(mockRect);

      fireEvent.click(stage, { clientX: 50, clientY: 200 });

      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    it('goes back on right-half click (right-opening)', () => {
      renderWithImages();
      const stage = screen.getByRole('application');
      vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue(mockRect);

      fireEvent.click(stage, { clientX: 50, clientY: 200 });
      fireEvent.click(stage, { clientX: 350, clientY: 200 });

      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('turns the page with the wheel even while not zoomed', () => {
      renderWithImages();
      const stage = screen.getByRole('application');

      fireEvent.wheel(stage, { deltaY: 80 });

      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });
});
