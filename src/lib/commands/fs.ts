import { invoke } from "@tauri-apps/api/core";

/**
 * 指定のフォルダ内の画像を取得する
 *
 * @param folderPath - 画像を取得するフォルダのパス
 * @returns - 画像のパスの配列
 */
export const listImagesInFolder = async (
	folderPath: string,
): Promise<string[]> => {
	const images = await invoke<string[]>("list_images_in_folder", {
		folderPath,
	});

	return images;
};

/**
 * 指定のフォルダの同階層のフォルダを取得する
 * 自分のフォルダは含まれない
 *
 * @param path - 現在のフォルダのパス
 * @returns - フォルダのパスの配列
 * @description - 現在のフォルダの親フォルダにあるフォルダを取得する
 */
export const getSiblingFolders = async (path: string): Promise<string[]> => {
	try {
		const folders = await invoke<string[]>("get_sibling_folders", { path });
		return folders;
	} catch (error) {
		console.error("Error getting sibling folders:", error);
		return [];
	}
};
