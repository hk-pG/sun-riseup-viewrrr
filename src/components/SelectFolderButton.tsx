import { open } from "@tauri-apps/plugin-dialog";

type Props = {
	onSelect: (folderPath: string) => void;
};

export function SelectFolderButton({ onSelect }: Props) {
	async function handleSelect() {
		const selectedPath = await open({ directory: true });

		if (selectedPath && typeof selectedPath === "string") {
			onSelect(selectedPath);
		}
	}

	return (
		<>
			<button type="button" onClick={handleSelect}>
				フォルダを選択
			</button>
		</>
	);
}
