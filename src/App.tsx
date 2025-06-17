import { useState } from 'react';
import './App.css';
import { type FolderInfo, HeaderMenu, Sidebar } from './components';
import { AppMenuBar } from './components/AppMenuBar';
import { ImageViewer } from './components/ImageViewer';
import { useSiblingFolders } from './components/hooks/useSiblingFolders';
import { useServices } from './context/ServiceContext';

function App() {
  // 現在表示しているフォルダのパス
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');

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

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-100">
        <div data-tauri-drag-region className="titlebar">
          <AppMenuBar
            title="漫画ビューア"
            onMenuAction={(actionId) => {
              alert(`Action ID: ${actionId}`);
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
          <ImageViewer folderPath={currentFolderPath} className="flex-1" />
        </div>
      </div>
    </>
  );
}

export default App;
