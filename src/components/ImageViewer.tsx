import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { ImageSource } from "../types/ImageSource";
import { LocalFolderContainer } from "../containers/LocalFolderContainer";

export default function ImageViewer() {
	// ユーザーの選択した1つのフォルダ内の画像のパスを格納する
	const [images, setImages] = useState<ImageSource[]>([]);
	// 現在表示している画像のインデックス
	const [current, setCurrent] = useState(0);

	/**
	 * ダイアログを開いてユーザーにフォルダを選択させる
	 */
	async function selectFolder() {
		// ダイアログを開いてフォルダを選択させる
		const folder = await open({ directory: true });
		if (folder && typeof folder === "string") {
			// フォルダ内の画像を取得する
			const container = new LocalFolderContainer(folder);
			const imageList = await container.listImages();

			setImages(imageList);
			setCurrent(0);
		}
	}

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				setCurrent((c) => Math.min(c + 1, images.length - 1));
			} else if (e.key === "ArrowLeft") {
				setCurrent((c) => Math.max(c - 1, 0));
			}
		};

		// キーボードの左右キーで画像を切り替える
		window.addEventListener("keydown", handler);

		// コンポーネントがアンマウントされたときにイベントリスナーを削除する
		return () => window.removeEventListener("keydown", handler);
	}, [images]);
	return (
		<>
			<button type="button" onClick={selectFolder}>
				Select Image Folder
			</button>
			{/* 現在表示している画像 */}
			{images.length > 0 && (
				<img
					alt="selected file in folder"
					src={`${images[current].assetUrl}`}
					className="max-h-full max-w-full object-contain"
				/>
			)}

			{/* 画像のインデックスを表示 */}
			<div>
				<p>
					{current + 1} / {images.length}
				</p>
			</div>
			<div className="flex justify-center w-full absolute bottom-0">
				<button
					type="button"
					onClick={() => {
						// 左矢印が押されたとき
						setCurrent((c) => Math.max(c - 1, 0));
					}}
				>
					{/* 左矢印 */}
					<span>&lt;</span>
				</button>

				<button
					type="button"
					onClick={() => {
						// 右矢印が押されたとき
						setCurrent((c) => Math.min(c + 1, images.length - 1));
					}}
				>
					{/* 右矢印 */}
					<span>&gt;</span>
				</button>
			</div>
		</>
	);
}
