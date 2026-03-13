import { useState, useTransition } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './components/theme-provider';
import { AppMenuBar, useAppActions } from './features/app-shell';
import {
  type FolderInfo,
  Sidebar,
  useOpenImageFile,
  useSiblingFolders,
} from './features/folder-navigation';
import { ImageViewer } from './features/image-viewer';
import { useServices } from './shared/context/ServiceContext';

// App state interface for better type safety
export interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}

/**
 * アプリケーションのルートコンポーネント
 * TODO: 状態管理が複雑化している。appStateでの管理に無理が生じ始めている。
 * TODO: App.tsx自体が肥大化してきている。状態管理とUIロジックの分離を検討。
 *
 * @param props.initialState - テストやStorybook用の初期状態（オプション）。
 *                             初期フォルダパスや画像インデックスを注入できます。
 */
function App({ initialState }: { initialState?: Partial<AppState> }) {
  const [appState, setAppState] = useState<AppState>({
    currentFolderPath: initialState?.currentFolderPath || '',
    initialImageIndex: initialState?.initialImageIndex || 0,
  });

  // useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  // Theme API from provider (used for toggle-theme action)
  const themeApi = useTheme();

  // サイドバーの表示のために同階層のフォルダ情報を取得
  const { entries } = useSiblingFolders(appState.currentFolderPath);

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

  // Command Registry パターンによるメニューアクション処理
  const { executeAction } = useAppActions({
    fss,
    openImageFile,
    themeApi,
    startTransition,
    setAppState,
  });

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
        <div data-tauri-drag-region className="draggable">
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
            folderPath={appState.currentFolderPath}
            initialIndex={appState.initialImageIndex}
            className="flex-1"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
