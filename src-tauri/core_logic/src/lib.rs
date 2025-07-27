use std::fs;
use std::path::PathBuf;

// A custom error type for command errors
#[derive(Debug, serde::Serialize)]
pub enum CommandError {
    Io(String),
    PathNotFound(String),
    NoParent,
}

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        CommandError::Io(err.to_string())
    }
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

/// `get_sibling_folders` コマンドは、指定されたパスの兄弟フォルダを取得します。
/// 自分自身のフォルダは除外されます。
///
/// # Examples
///
/// ```no_run
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;
    use std::fs::{create_dir_all, remove_dir_all, File};

    #[test]
    fn test_list_images_in_folder_success() {
        let temp_dir = temp_dir().join("test_list_images_success");
        create_dir_all(&temp_dir).unwrap();
        File::create(temp_dir.join("image1.jpg")).unwrap();
        File::create(temp_dir.join("image2.PNG")).unwrap(); // Uppercase extension
        File::create(temp_dir.join("document.txt")).unwrap();

        let images = list_images_in_folder(temp_dir.to_string_lossy().to_string()).unwrap();

        assert_eq!(images.len(), 2);
        assert!(images.iter().any(|p| p.ends_with("image1.jpg")));
        assert!(images.iter().any(|p| p.ends_with("image2.PNG")));

        remove_dir_all(temp_dir).unwrap();
    }

    #[test]
    fn test_list_images_in_folder_not_found() {
        let result = list_images_in_folder("non_existent_path_for_images".to_string());
        assert!(matches!(result, Err(CommandError::Io(_))));
    }

    #[test]
    fn test_get_sibling_folders_success() {
        let base = temp_dir().join("test_siblings_success");
        let _ = remove_dir_all(&base);
        create_dir_all(base.join("A")).unwrap();
        create_dir_all(base.join("B")).unwrap();
        create_dir_all(base.join("C")).unwrap();

        let current_path = base.join("B").to_string_lossy().to_string();
        let mut result = get_sibling_folders(current_path).unwrap();
        result.sort(); // Sort for stable assertion

        let mut expected = vec![
            base.join("A").to_string_lossy().to_string(),
            base.join("C").to_string_lossy().to_string(),
        ];
        expected.sort();

        assert_eq!(result, expected);

        remove_dir_all(base).unwrap();
    }

    #[test]
    fn test_get_sibling_folders_not_found() {
        let result = get_sibling_folders("non_existent_path_for_siblings".to_string());
        assert!(matches!(result, Err(CommandError::PathNotFound(_))));
    }
}
