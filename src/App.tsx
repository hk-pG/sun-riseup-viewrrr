import { LucideAlertTriangle } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import './App.css';
import { type AppState, createAppState } from './appState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { AppMenuBar, useAppActions } from './features/app-shell';
import {
  type FolderInfo,
  LocalFolderContainer,
  Sidebar,
  useOpenImageFile,
  useSiblingContainers,
} from './features/folder-navigation';
import { ImageViewer } from './features/image-viewer';
import { useServices } from './shared/context/ServiceContext';
import { logger } from './shared/utils/logger';

const APP_VIEWER_CONTAINER_CONFIG = {
  chunkSize: 100,
};

/**
 * アプリケーションのルートコンポーネント
 * TODO: 状態管理が複雑化している。appStateでの管理に無理が生じ始めている。
 * TODO: App.tsx自体が肥大化してきている。状態管理とUIロジックの分離を検討。
 *
 * @param props.initialState - テストやStorybook用の初期状態（オプション）。
 *                             初期フォルダパスや画像インデックスを注入できます。
 */
function App({ initialState }: { initialState?: Partial<AppState> }) {
  const [appState, setAppState] = useState<AppState>(() =>
    createAppState(initialState),
  );

  // useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  // Theme API from provider (used for toggle-theme action)
  const themeApi = useTheme();

  // サイドバーの表示のために同階層のフォルダ情報を取得
  const { entries, error } = useSiblingContainers(appState.currentFolderPath);

  useEffect(() => {
    if (error) {
      toast.error('Error Occurred', {
        description: `${error.message}`,
        icon: <LucideAlertTriangle color="red" />,
        closeButton: true,
      });
      logger.error(error.message);
    }
  }, [error]);

  const folderInfo: FolderInfo[] = entries.map((entry) => ({
    ...entry,
    imageCount: undefined,
    thumbnailImage: undefined,
  }));

  const selectedFolder = folderInfo.find(
    (folder) => folder.path === appState.currentFolderPath,
  );

  // ファイルシステムサービスを取得
  const fss = useServices();
  const { openImageFile } = useOpenImageFile(fss);
  const imageContainer = appState.currentFolderPath
    ? new LocalFolderContainer(
        appState.currentFolderPath,
        fss,
        APP_VIEWER_CONTAINER_CONFIG,
      )
    : undefined;

  // Command Registry パターンによるメニューアクション処理
  const { executeAction } = useAppActions(
    {
      fss,
      openImageFile,
      currentTheme: themeApi.theme,
    },
    {
      startTransition,
      setAppState,
      setTheme: themeApi.setTheme,
    },
  );

  const handleMenuAction = executeAction;

  const handleFolderSelect = (folder: FolderInfo) => {
    startTransition(() => {
      setAppState((prev) => ({
        ...prev,
        currentFolderPath: folder.path,
        initialImageIndex: 0, // Reset image index when changing folders
      }));
    });
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-background">
        <div data-tauri-drag-region className="draggable h-16">
          <AppMenuBar isDraggable={true} onMenuAction={handleMenuAction} />
        </div>

        <div className="flex flex-1 overflow-hidden bg-background text-foreground">
          <Sidebar
            folders={folderInfo}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            width={280}
            loading={isPending}
          />
          <ImageViewer
            key={appState.currentFolderPath}
            container={imageContainer}
            initialIndex={appState.initialImageIndex}
            className="flex-1"
          />
        </div>
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
