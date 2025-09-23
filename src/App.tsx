import { useCallback, useMemo, useState, useTransition } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppMenuBar } from './features/app-shell';
import {
  type FolderInfo,
  Sidebar,
  useOpenImageFile,
  useSiblingFolders,
} from './features/folder-navigation';
import { ImageViewer } from './features/image-viewer';
import { useServices } from './shared/context/ServiceContext';

// App state interface for better type safety
interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}

function App() {
  // React 19: Consolidated state management
  const [appState, setAppState] = useState<AppState>({
    currentFolderPath: '',
    initialImageIndex: 0,
  });

  // React 19: useTransition for non-urgent updates
  const [, startTransition] = useTransition();

  // サイドバーの表示のために同階層のフォルダ情報を取得
  const { entries } = useSiblingFolders(appState.currentFolderPath);

  // React 19: Optimized memoization with useMemo
  const folderInfo: FolderInfo[] = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        imageCount: undefined,
        thumbnailImage: undefined,
      })),
    [entries],
  );

  const selectedFolder = useMemo(
    () =>
      folderInfo.find((folder) => folder.path === appState.currentFolderPath),
    [folderInfo, appState.currentFolderPath],
  );

  // ファイルシステムサービスを取得
  const fss = useServices();
  const { openImageFile } = useOpenImageFile(fss);

  // React 19: Optimized event handlers with useCallback
  const handleMenuAction = useCallback(
    async (actionId: string) => {
      // TODO: スケールを考えてストラテジーパターンへの移行を検討
      try {
        if (actionId === 'open-folder') {
          const folderPath = await fss.openDirectoryDialog();
          if (folderPath) {
            // React 19: Use transition for non-urgent state updates
            startTransition(() => {
              setAppState({
                currentFolderPath: folderPath,
                initialImageIndex: 0,
              });
            });
          }
        } else if (actionId === 'open-image') {
          const result = await openImageFile();
          if (result && result.folderPath !== null) {
            startTransition(() => {
              setAppState({
                currentFolderPath: result.folderPath as string,
                initialImageIndex: result.index,
              });
            });
          }
        }
        // 他のアクションは今まで通り（必要ならここに追加）
      } catch (error) {
        console.error('Menu action failed:', error);
      }
    },
    [fss, openImageFile],
  );

  const handleFolderSelect = useCallback((folder: FolderInfo) => {
    startTransition(() => {
      setAppState((prev) => ({
        ...prev,
        currentFolderPath: folder.path,
      }));
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-white">
        <div data-tauri-drag-region className="draggable">
          <AppMenuBar isDraggable={true} onMenuAction={handleMenuAction} />
        </div>

        <div className="flex h-screen bg-background">
          <Sidebar
            folders={folderInfo}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            width={280}
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
