import { useState } from 'react';
import './App.css';
import FolderListPanel from './components/FolderListPanel';
import ImageViewer from './components/ImageViewer';
import { SelectFolderButton } from './components/SelectFolderButton';
import { useFolderNavigator } from './hooks/useFolderNavigator';

function App() {
  // 現在表示しているフォルダのパス
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');

  const { entries } = useFolderNavigator(currentFolderPath);

  console.log(entries);

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-200">
        <SelectFolderButton onSelect={setCurrentFolderPath} />
      </header>

      <div className="flex h-screen">
        <FolderListPanel
          entries={entries}
          currentFolder={currentFolderPath}
          onSelect={(folder) => setCurrentFolderPath(folder)}
        />
        <div className="flex flex-col items-center justify-center">
          <ImageViewer key={currentFolderPath} folderPath={currentFolderPath} />
        </div>
      </div>
    </>
  );
}

export default App;
