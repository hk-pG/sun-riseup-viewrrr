import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
	const [folders, setFolders] = useState<string[]>([]);
	const [images, setImages] = useState<string[]>([]);
	const [currentDir, setCurrentDir] = useState<string>('.');
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

	setCurrentDir('.');
	useEffect(() => {
		invoke<string[]>('list_folders', { currentDir }).then(setFolders);
	}, [currentDir]);

	const handleFolderClick = (folder: string) => {
		setSelectedFolder(folder);
		invoke<string[]>('list_images', { folder }).then(setImages);
	};

	return (
		<div className="flex h-screen">
			{/* フォルダビューア */}
			<div className="w-1/4 bg-gray-100 p-4 border-r border-gray-300">
				{folders.map((folder) => (
					<div
						key={folder}
						className={`cursor-pointer p-2 rounded transition ${
							folder === selectedFolder
								? 'bg-blue-500 text-white'
								: 'hover:bg-gray-300'
						}`}
						onKeyUp={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleFolderClick(folder);
							}
						}}
						onClick={() => handleFolderClick(folder)}
					>
						📁 {folder}
					</div>
				))}
			</div>

			{/* 画像ビューア */}
			<div className="w-3/4 p-4 flex flex-wrap gap-2 overflow-y-auto">
				{images.map((img) => (
					<img
						key={img}
						src={`file://${img}`}
						alt={img}
						className="w-32 h-32 object-cover rounded shadow-md"
					/>
				))}
			</div>
		</div>
	);
}
export default App;
