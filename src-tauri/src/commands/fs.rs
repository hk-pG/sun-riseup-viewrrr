use std::fs;
use std::path::PathBuf;

use tauri::command;

/// Lists all image files in a specified folder.
///
/// This function scans the given folder and returns a list of file paths
/// for all image files found. Supported image formats are JPG, JPEG, PNG, GIF, and WEBP.
///
/// # Arguments
///
/// * `folder_path` - A string slice that holds the path to the folder to be scanned.
///
/// # Returns
///
/// A `Vec<String>` containing the full paths of all image files found in the folder.
/// If no images are found or if there's an error reading the directory, an empty vector is returned.
///
/// # Panics
///
/// This function will panic if it fails to read the directory specified by `folder_path`.
#[tauri::command]
pub fn list_images_in_folder(folder_path: String) -> Vec<String> {
    use std::fs;

    fs::read_dir(&folder_path)
        .unwrap()
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.is_file() {
                let ext = path.extension()?.to_str()?.to_lowercase();
                if ["jpg", "jpeg", "png", "gif", "webp"].contains(&ext.as_str()) {
                    return Some(path.to_string_lossy().to_string());
                }
            }
            None
        })
        .collect()
}

/// `get_sibling_folders` コマンドは、指定されたパスの兄弟フォルダを取得します。
/// 自分自身のフォルダは除外されます。
/// example: `get_sibling_folders("/path/to/current/folder")`
/// returns: `["/path/to/current/folder/../sibling1", "/path/to/current/folder/../sibling2"]`
#[command]
pub fn get_sibling_folders(path: String) -> Result<Vec<String>, String> {
    let current = PathBuf::from(&path);
    let parent = current
        .parent()
        .ok_or_else(|| "No parent directory found".to_string())?;

    let siblings = fs::read_dir(parent)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.is_dir() && path != current {
                    Some(path.to_string_lossy().to_string())
                } else {
                    None
                }
            })
        })
        .collect();

    Ok(siblings)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;
    use std::fs::{create_dir_all, remove_dir_all};

    #[test]
    fn test_get_sibling_folders() {
        // 一時ディレクトリ作成
        let base = temp_dir().join("tauri_test_siblings");
        let _ = remove_dir_all(&base); // 前のゴミを削除
        create_dir_all(base.join("A")).unwrap();
        create_dir_all(base.join("B")).unwrap();
        create_dir_all(base.join("C")).unwrap();

        // 現在のディレクトリとして "B" を渡す
        let current_path = base.join("B").to_string_lossy().to_string();
        let result = get_sibling_folders(current_path).unwrap();

        // A, C が返ってくる（順序保証はされない）
        assert_eq!(result.len(), 2);
        assert!(result.iter().any(|p| p.contains("A")));
        assert!(result.iter().any(|p| p.contains("C")));

        // クリーンアップ
        let _ = remove_dir_all(base);
    }
}
