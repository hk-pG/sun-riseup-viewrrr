use std::{fs, path::PathBuf};

use crate::image_container::CommandError;

/// `get_sibling_folders` コマンドは、指定されたパスの兄弟フォルダを取得します。
/// 自分自身のフォルダは除外されます。
///
/// # Examples
///
/// ```ignore
/// use core_logic::get_sibling_folders;
/// let siblings = get_sibling_folders("/path/to/current/folder".to_string());
/// // siblings: Ok(["/path/to/current/folder/../sibling1", "/path/to/current/folder/../sibling2"])
/// ```
pub fn get_sibling_folders(folder_path: String) -> Result<Vec<String>, CommandError> {
    let current = PathBuf::from(&folder_path);

    if !current.exists() {
        return Err(CommandError::PathNotFound(folder_path));
    }

    let parent = current.parent().ok_or(CommandError::NoParent)?;

    let siblings = fs::read_dir(parent)?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                // Exclude the current folder itself
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
/// A `Result` containing either a `Vec<String>` with the full paths of all image files
/// or a `CommandError` if an error occurs.
pub fn list_images_in_folder(folder_path: String) -> Result<Vec<String>, CommandError> {
    const SUPPORTED_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "gif", "webp"];

    let entries = fs::read_dir(&folder_path)?;

    let images = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.is_file() {
                let ext = path.extension()?.to_str()?.to_lowercase();
                if SUPPORTED_EXTENSIONS.contains(&ext.as_str()) {
                    return Some(path.to_string_lossy().to_string());
                }
            }
            None
        })
        .collect();

    Ok(images)
}

pub fn get_sibling_archives(container_path: String) -> Result<Vec<String>, CommandError> {
    let current = PathBuf::from(&container_path);
    if !current.exists() {
        return Err(CommandError::PathNotFound(container_path));
    }

    current.parent().ok_or(CommandError::NoParent)?;

    let entries = fs::read_dir(current.parent().unwrap())?;

    let archives = entries
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.is_file() && path != current {
                    let ext = path.extension()?.to_str()?.to_lowercase();
                    if ext == "zip" {
                        return Some(path.to_string_lossy().to_string());
                    }
                }
                None
            })
        })
        .collect();

    Ok(archives)
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::test_helper::test_helpers::TempTestDir;
    use std::fs::create_dir_all;

    #[test]
    fn test_get_sibling_folders_success() {
        let base = TempTestDir::new("test_siblings_success");
        create_dir_all(base.path().join("A")).unwrap();
        create_dir_all(base.path().join("B")).unwrap();
        create_dir_all(base.path().join("C")).unwrap();

        let current_path = base.path().join("B").to_string_lossy().to_string();
        let mut result = get_sibling_folders(current_path).unwrap();
        result.sort(); // Sort for stable assertion

        let mut expected = vec![
            base.path().join("A").to_string_lossy().to_string(),
            base.path().join("C").to_string_lossy().to_string(),
        ];
        expected.sort();

        assert_eq!(result, expected);
    }

    #[test]
    fn test_get_sibling_folders_not_found() {
        let result = get_sibling_folders("non_existent_path_for_siblings".to_string());
        assert!(matches!(result, Err(CommandError::PathNotFound(_))));
    }
}
