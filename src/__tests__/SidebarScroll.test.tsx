import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '@/features/folder-navigation';
import { resetAllMocks, setupTauriMocks } from '@/test/mocks';

const mockFolders = Array.from({ length: 21 }, (_, i) => ({
  name: `test-folder-${String(i + 1).padStart(2, '0')}`,
  path: `/test/folder${i + 1}`,
}));

describe('SidebarScroll - US2: Sidebar container has correct scroll classes', () => {
  beforeEach(() => {
    resetAllMocks();
    setupTauriMocks();
  });

  const renderSidebar = () => {
    return render(<Sidebar folders={mockFolders} onFolderSelect={() => {}} />);
  };

  it('T009: sidebar aside element should have overflow-y-auto class', () => {
    renderSidebar();
    const sidebarAside = screen.getByRole('complementary');
    expect(sidebarAside).toBeInTheDocument();
    expect(sidebarAside.classList.contains('overflow-y-auto')).toBe(true);
  });

  it('T009b: sidebar aside element should have min-h-0 class for correct flex scroll', () => {
    renderSidebar();
    const sidebarAside = screen.getByRole('complementary');
    expect(sidebarAside).toBeInTheDocument();
    expect(sidebarAside.classList.contains('min-h-0')).toBe(true);
  });
});
