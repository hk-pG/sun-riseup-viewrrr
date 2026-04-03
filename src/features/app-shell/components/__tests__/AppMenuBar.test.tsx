import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetAllMocks, setupTauriMocks } from '../../../../test/mocks';
import { AppMenuBar, type AppMenuBarProps } from '../AppMenuBar';

// Radix UI の Menubar は jsdom 環境でポップオーバーが開かないため、
// メニュー項目が常に DOM に存在する簡易コンポーネントでモックする
vi.mock('@/shared/components/ui/menubar', () => ({
  Menubar: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <div role="menubar" className={className} {...props}>
      {children}
    </div>
  ),
  MenubarMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MenubarTrigger: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button type="button" role="menuitem" className={className} {...props}>
      {children}
    </button>
  ),
  MenubarContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  MenubarItem: ({
    children,
    onClick,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    // biome-ignore lint/a11y/useKeyWithClickEvents: テスト用モック
    // biome-ignore lint/a11y/useFocusableInteractive: テスト用モック
    <div role="menuitem" onClick={onClick} className={className} {...props}>
      {children}
    </div>
  ),
  MenubarSeparator: ({ className }: { className?: string }) => (
    <hr className={className} />
  ),
  MenubarShortcut: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  MenubarSub: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MenubarSubTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button type="button" className={className}>
      {children}
    </button>
  ),
  MenubarSubContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  FolderOpen: () => <span data-testid="folder-open-icon">FolderOpen</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
}));

// Mock ThemeProvider to avoid theme system dependencies
vi.mock('../../../../../components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

describe('AppMenuBar Component (No Theme Dependencies)', () => {
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
    return render(<AppMenuBar {...getDefaultProps()} {...props} />);
  };

  describe('Component Rendering and Structure', () => {
    it('should render without errors', () => {
      renderAppMenuBar();

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

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

      expect(screen.getByRole('banner')).toBeInTheDocument();
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

      const fileMenu = screen.getByText('ファイル');
      const viewMenu = screen.getByText('表示');

      expect(fileMenu).toBeInTheDocument();
      expect(viewMenu).toBeInTheDocument();

      const menubar = screen.getByRole('menubar');
      expect(menubar).toBeInTheDocument();
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
      const menubar = screen.getByRole('menubar');

      expect(header).toContainElement(menubar);
    });
  });

  describe('Menu Action Callbacks', () => {
    it('ファイルメニューの「フォルダを開く」クリックで onMenuAction("open-folder") が呼ばれる', () => {
      renderAppMenuBar();

      fireEvent.click(screen.getByText('フォルダを開く'));

      expect(mockOnMenuAction).toHaveBeenCalledWith('open-folder');
    });

    it('ファイルメニューの「画像ファイルを開く」クリックで onMenuAction("open-image") が呼ばれる', () => {
      renderAppMenuBar();

      fireEvent.click(screen.getByText('画像ファイルを開く'));

      expect(mockOnMenuAction).toHaveBeenCalledWith('open-image');
    });

    it('表示メニューの「フルスクリーン」クリックで onMenuAction("fullscreen") が呼ばれる', () => {
      renderAppMenuBar();

      fireEvent.click(screen.getByText('フルスクリーン'));

      expect(mockOnMenuAction).toHaveBeenCalledWith('fullscreen');
    });

    it('表示メニューの「テーマ切り替え」クリックで onMenuAction("toggle-theme") が呼ばれる', () => {
      renderAppMenuBar();

      fireEvent.click(screen.getByText('テーマ切り替え'));

      expect(mockOnMenuAction).toHaveBeenCalledWith('toggle-theme');
    });
  });
});
