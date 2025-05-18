import { useEffect, useState } from "react";
import { getSiblingFolders } from "../lib/commands/fs";
import { basename } from "@tauri-apps/api/path";

export type FolderEntry = {
	name: string;
	path: string;
};

/**
 * 指定のフォルダと同階層にあるフォルダを取得し、
 * 各フォルダの最初の画像を使ったサムネイルを取得する
 *
 * @param currentFolderPath - 現在のフォルダのパス
 * @returns - 同階層のフォルダのパスと、各フォルダのサムネイル
 */
export function useFolderNavigator(currentFolderPath: string) {
	const [entries, setEntries] = useState<FolderEntry[]>([]);

	useEffect(() => {
		let mounted = true;

		async function load() {
			const paths = await getSiblingFolders(currentFolderPath);

			if (!mounted) return;

			const entries: FolderEntry[] = await Promise.all(
				paths.map(async (path) => ({
					path,
					name: await basename(path),
				})),
			);

			setEntries(entries);
		}

		load();

		return () => {
			mounted = false;
		};
	}, [currentFolderPath]);

	return { entries };
}
