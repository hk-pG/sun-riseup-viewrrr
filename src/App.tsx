import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";

import "./App.css";

function App() {
	const [images, setImages] = useState<string[]>([]);
	const [current, setCurrent] = useState(0);

	async function selectFolder() {
		const folder = await open({ directory: true });
		if (folder && typeof folder === "string") {
			const files = await invoke("list_images_in_folder", {
				folderPath: folder,
			});

			if (Array.isArray(files)) {
				// TODO: should be used type guard instead of type assertion
				// convert using convertFileSrc
				const assetPaths = files.map((file) => convertFileSrc(file));
				setImages(assetPaths as string[]);
				setCurrent(0);
			}
			setCurrent(0);
		}
	}

	return (
		<div>
			<button type="button" onClick={selectFolder}>
				Select Image Folder
			</button>
			{/* current image */}
			{images.length > 0 && (
				<img
					alt="selected file in folder"
					src={`${images[current]}`}
					style={{
						maxWidth: "100%",
						maxHeight: "100%",
					}}
				/>
			)}
			{/* images in folder selected */}
			<div style={{ display: "flex", overflowX: "scroll" }}>
				{images.map((path, index) => (
					<>
						<button
							key={path}
							type="button"
							onClick={() => {
								setCurrent(index);
							}}
							style={{
								backgroundColor: index === current ? "blue" : "white",
								color: index === current ? "white" : "black",
								maxHeight: "50px",
								maxWidth: "50px",
							}}
						>
							<img
								key={path}
								alt="selected file in folder"
								src={`${path}`}
								style={{
									margin: "5px",
									cursor: "pointer",
									maxWidth: "100%",
									maxHeight: "100%",
								}}
							/>
							{index}
						</button>
					</>
				))}
			</div>
		</div>
	);
}

export default App;
