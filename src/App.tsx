import { useState } from 'react';
import './App.css';
import { type FolderInfo, Sidebar } from './components';
import { AppMenuBar } from './components/AppMenuBar';
import { ImageViewer } from './components/ImageViewer';
import { useOpenImageFile } from './components/hooks/useOpenImageFile';
import { useSiblingFolders } from './components/hooks/useSiblingFolders';
import { useServices } from './context/ServiceContext';

function App() {
  // 現在表示しているフォルダのパス
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');
  const [initialImageIndex, setInitialImageIndex] = useState<number>(0);

  // サイドバーの表示のために同階層のフォルダ情報を取得
  const { entries } = useSiblingFolders(currentFolderPath);

  const folderInfo: FolderInfo[] = entries.map((entry) => ({
    ...entry,
    imageCount: undefined,
    thumbnailImage: undefined,
  }));

  const selectedFolder = folderInfo.find(
    (folder) => folder.path === currentFolderPath,
  );

  // ファイルシステムサービスを取得
  const fss = useServices();
  const { openImageFile } = useOpenImageFile(fss);

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-100">
        <div data-tauri-drag-region className="draggable">
          <AppMenuBar
            isDraggable={true}
            onMenuAction={async (actionId) => {
              // TODO: スケールを考えてストラテジーパターンへの移行を検討
              if (actionId === 'open-folder') {
                const folderPath = await fss.openDirectoryDialog();
                if (folderPath) {
                  setCurrentFolderPath(folderPath);
                  setInitialImageIndex(0);
                }
              } else if (actionId === 'open-image') {
                const result = await openImageFile();
                if (result?.folderPath) {
                  setCurrentFolderPath(result.folderPath);
                  setInitialImageIndex(result.index);
                }
              }
              // 他のアクションは今まで通り（必要ならここに追加）
            }}
          />
        </div>

        <div className="h-screen flex bg-gray-100">
          <Sidebar
            folders={folderInfo}
            selectedFolder={selectedFolder}
            onFolderSelect={(folder) => {
              const { path } = folder;
              setCurrentFolderPath(path);
            }}
            width={280}
          />
          <ImageViewer
            key={currentFolderPath}
            folderPath={currentFolderPath}
            initialIndex={initialImageIndex}
            className="flex-1"
          />
        </div>
      </div>
    </>
  );
}

export default App;
