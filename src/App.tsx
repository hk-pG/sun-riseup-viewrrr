import { useCallback, useMemo, useState, useTransition } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppMenuBar, type AppMenuBarEvent } from './features/app-shell';
import {
  type FolderInfo,
  Sidebar,
  useOpenImageFile,
  useSiblingFolders,
} from './features/folder-navigation';
import { ImageViewer } from './features/image-viewer';
import { useTheme } from './providers/ThemeProvider';
import { useServices } from './shared/context/ServiceContext';

// App state interface for better type safety
interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentFolderPath: '',
    initialImageIndex: 0,
  });

  // useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();

  // Theme API from provider (used for toggle-theme action)
  const themeApi = useTheme();

  // サイドバーの表示のために同階層のフォルダ情報を取得
  const { entries } = useSiblingFolders(appState.currentFolderPath);

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

  // Optimized event handlers with useCallback and better error handling
  const handleMenuAction = useCallback(
    async (actionId: AppMenuBarEvent) => {
      // TODO: スケールを考えてストラテジーパターンへの移行を検討
      try {
        if (actionId === 'open-folder') {
          const folderPath = await fss.openDirectoryDialog();
          if (folderPath) {
            // React 19: Use transition for non-urgent state updates
            startTransition(() => {
              setAppState((prev) => ({
                ...prev,
                currentFolderPath: folderPath,
                initialImageIndex: 0,
              }));
            });
          }
        } else if (actionId === 'open-image') {
          const result = await openImageFile();
          if (result?.folderPath) {
            startTransition(() => {
              setAppState((prev) => ({
                ...prev,
                currentFolderPath: result.folderPath as string,
                initialImageIndex: result.index,
              }));
            });
          }
        } else if (actionId === 'toggle-theme') {
          try {
            // useTheme is used below via closure; safe to call outside because hook must be used in component scope
            const { theme: currentTheme, resolvedTheme, setTheme } = themeApi;

            // テーマの切り替えルールを関数として純粋に定義
            const getOppositeTheme = (
              current: typeof currentTheme,
              resolved: typeof resolvedTheme,
            ) =>
              current === 'system'
                ? resolved === 'dark'
                  ? 'light'
                  : 'dark'
                : current === 'dark'
                  ? 'light'
                  : 'dark';

            setTheme(getOppositeTheme(currentTheme, resolvedTheme));
          } catch (err) {
            console.error('toggle-theme failed', err);
          }
        }
        // 他のアクションは今まで通り（必要ならここに追加）
      } catch (error) {
        console.error('Menu action failed:', error);
        // React 19: Better error handling could include error boundaries or user feedback
      }
    },
    [fss, openImageFile, themeApi],
  );

  const handleFolderSelect = useCallback((folder: FolderInfo) => {
    startTransition(() => {
      setAppState((prev) => ({
        ...prev,
        currentFolderPath: folder.path,
        initialImageIndex: 0, // Reset image index when changing folders
      }));
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-background">
        <div data-tauri-drag-region className="draggable">
          <AppMenuBar isDraggable={true} onMenuAction={handleMenuAction} />
        </div>

        <div className="flex h-screen bg-background text-foreground">
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
