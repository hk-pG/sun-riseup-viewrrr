import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ServicesProvider } from '@/shared';
import { mockImageSourcesByFolderPath } from '../../../../data/mockData';
import { type FileSystemService, type FolderInfo, FolderList } from '../index';

const folders: FolderInfo[] = [
  {
    path: '/test_images/folder_1',
    name: 'フォルダ1',
    imageCount: mockImageSourcesByFolderPath['/test_images/folder_1']?.length,
  },
  {
    path: '/test_images/folder_2',
    name: 'フォルダ2',
    imageCount: mockImageSourcesByFolderPath['/test_images/folder_2']?.length,
  },
  {
    path: '/mock/empty-folder',
    name: '空のフォルダ',
    imageCount: 0,
  },
];

const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: (): Promise<string | null> => {
    throw new Error('Function not implemented.');
  },
  getBaseName: (_filePath: string): Promise<string> => {
    throw new Error('Function not implemented.');
  },
  getDirName: (_filePath: string): Promise<string> => {
    throw new Error('Function not implemented.');
  },
  listImagesInFolder: (_folderPath: string): Promise<string[]> => {
    throw new Error('Function not implemented.');
  },
  getSiblingFolders: (_currentFolderPath: string): Promise<string[]> => {
    throw new Error('Function not implemented.');
  },
  convertFileSrc: (_filePath: string): string => {
    throw new Error('Function not implemented.');
  },
});

const MockServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const mockService = createMockFileSystemService();
  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta = {
  title: 'FolderNavigation/FolderList',
  component: FolderList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, _context) => {
      return (
        <MockServiceProvider>
          <Story />
        </MockServiceProvider>
      );
    },
  ],
  args: {
    onFolderDoubleClick: fn(),
    onFolderSelect: fn(),
  },
} satisfies Meta<typeof FolderList>;
export default meta;

type Story = StoryObj<typeof FolderList>;

export const Default: Story = {
  args: {
    folders,
    selectedFolder: folders[0],
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const NoSelection: Story = {
  args: {
    folders,
    selectedFolder: undefined,
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const Empty: Story = {
  args: {
    folders: [],
    selectedFolder: undefined,
    thumbnailSize: 80,
    showImageCount: true,
  },
};
