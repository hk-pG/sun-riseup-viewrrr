import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../../../providers/ThemeProvider';
import { resetAllMocks, setupTauriMocks } from '../../../../test/mocks';
import { AppMenuBar, type AppMenuBarProps } from '../AppMenuBar';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  FolderOpen: () => <span data-testid="folder-open-icon">FolderOpen</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
}));

describe('AppMenuBar Component', () => {
  let mockOnMenuAction: ReturnType<typeof vi.fn>;
  let mockOnOpenFolder: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();
    mockOnMenuAction = vi.fn();
    mockOnOpenFolder = vi.fn();
  });

  const getDefaultProps = (): AppMenuBarProps => ({
    onMenuAction: mockOnMenuAction,
  });

  const renderAppMenuBar = (props: Partial<AppMenuBarProps> = {}) => {
    return render(
      <ThemeProvider>
        <AppMenuBar {...getDefaultProps()} {...props} />
      </ThemeProvider>,
    );
  };

  describe('Component Rendering and Structure', () => {
    it('should render without errors', () => {
      renderAppMenuBar();

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    // ドラッグできることはtauriアプリにおいて重要なテスト項目のため単体テストを用意する判断
    it('should set drag region attribute when isDraggable is true', () => {
      renderAppMenuBar({ isDraggable: true });

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('data-tauri-drag-region', 'true');
    });

    it('should not set drag region attribute when isDraggable is false', () => {
      renderAppMenuBar({ isDraggable: false });

      const header = screen.getByRole('banner');
      expect(header).not.toHaveAttribute('data-tauri-drag-region');
    });
  });

  describe('Component Props', () => {
    it('should accept onMenuAction prop', () => {
      const customOnMenuAction = vi.fn();
      renderAppMenuBar({ onMenuAction: customOnMenuAction });

      // Component should render without errors
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should accept onOpenFolder prop', () => {
      const customOnOpenFolder = vi.fn();
      renderAppMenuBar({ onOpenFolder: customOnOpenFolder });

      // Component should render without errors and show the button
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'フォルダを開く' }),
      ).toBeInTheDocument();
    });

    it('should accept isDraggable prop', () => {
      renderAppMenuBar({ isDraggable: true });

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('data-tauri-drag-region', 'true');
    });
  });

  describe('Menu Item Structure Validation', () => {
    it('should have correct menu structure hierarchy', () => {
      renderAppMenuBar();

      // Verify that menu items are properly nested
      const fileMenu = screen.getByText('ファイル');
      const viewMenu = screen.getByText('表示');

      expect(fileMenu).toBeInTheDocument();
      expect(viewMenu).toBeInTheDocument();

      // Verify menubar structure
      const menubar = screen.getByRole('menubar');
      expect(menubar).toBeInTheDocument();
    });

    it('should render menu items with proper accessibility', () => {
      renderAppMenuBar();

      // Check that the main header has proper role
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Check that menu triggers have proper roles
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);

      // Check that buttons have proper roles when onOpenFolder is provided
      renderAppMenuBar({ onOpenFolder: mockOnOpenFolder });
      expect(
        screen.getByRole('button', { name: 'フォルダを開く' }),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA roles and attributes', () => {
      renderAppMenuBar();

      const menubar = screen.getByRole('menubar');
      const menuItems = screen.getAllByRole('menuitem');

      expect(menubar).toHaveAttribute('role', 'menubar');

      menuItems.forEach((item) => {
        expect(item).toHaveAttribute('role', 'menuitem');
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with open folder button', () => {
      renderAppMenuBar({ onOpenFolder: mockOnOpenFolder });

      const header = screen.getByRole('banner');
      const openFolderButton = screen.getByRole('button', {
        name: 'フォルダを開く',
      });
      const menubar = screen.getByRole('menubar');

      // All elements should be within the header
      expect(header).toContainElement(openFolderButton);
      expect(header).toContainElement(menubar);
    });
  });
});
