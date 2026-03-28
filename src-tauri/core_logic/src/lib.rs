use std::fs;
use std::path::PathBuf;

// A custom error type for command errors
#[derive(Debug, serde::Serialize, PartialEq)]
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

pub fn list_images_in_container(container_path: String) -> Result<Vec<String>, CommandError> {
    list_images_in_folder(container_path)
}

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
fn get_sibling_folders(folder_path: String) -> Result<Vec<String>, CommandError> {
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

fn get_sibling_archives(container_path: String) -> Result<Vec<String>, CommandError> {
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

///
/// `get_sibling_containers` コマンドは、指定されたパスの兄弟コンテナを取得します。
/// 自分自身のコンテナは除外されます。
///
/// ***コンテナ***とは、フォルダに加えて圧縮ファイルを含みます。
///
pub fn get_sibling_containers(container_path: String) -> Result<Vec<String>, CommandError> {
    let current = PathBuf::from(&container_path);
    if !current.exists() {
        return Err(CommandError::PathNotFound(container_path));
    }

    current.parent().ok_or(CommandError::NoParent)?;

    let folders = get_sibling_folders(container_path.to_string())?;
    let archives = get_sibling_archives(container_path.to_string())?;

    let mut containers = folders;
    containers.extend(archives);

    Ok(containers)
}

#[cfg(test)]
mod test_helpers {
    use std::{
        env::temp_dir,
        fs::{create_dir_all, remove_dir_all},
        path::PathBuf,
    };

    pub struct TempTestDir(pub PathBuf);

    impl TempTestDir {
        pub fn new(name: &str) -> Self {
            let path = temp_dir().join(name);
            create_dir_all(&path).unwrap();
            TempTestDir(path)
        }

        pub fn path(&self) -> &PathBuf {
            &self.0
        }
    }

    impl Drop for TempTestDir {
        fn drop(&mut self) {
            let _ = remove_dir_all(&self.0);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::test_helpers::TempTestDir;
    use super::*;
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

#[cfg(test)]
mod list_images_in_container_test {
    use super::*;
    use crate::test_helpers::TempTestDir;
    use std::fs::File;

    #[test]
    fn test_list_images_in_folder_success() {
        let temp_dir = TempTestDir::new("test_list_images_success");
        File::create(temp_dir.path().join("image1.jpg")).unwrap();
        File::create(temp_dir.path().join("image2.PNG")).unwrap(); // Uppercase extension
        File::create(temp_dir.path().join("document.txt")).unwrap();

        let images = list_images_in_folder(temp_dir.path().to_string_lossy().to_string()).unwrap();

        assert_eq!(images.len(), 2);
        assert!(images.iter().any(|p| p.ends_with("image1.jpg")));
        assert!(images.iter().any(|p| p.ends_with("image2.PNG")));
    }

    #[test]
    fn test_list_images_in_folder_not_found() {
        let result = list_images_in_folder("non_existent_path_for_images".to_string());
        assert!(matches!(result, Err(CommandError::Io(_))));
    }
}

#[cfg(test)]
mod get_sibling_containers_test {
    use super::test_helpers::TempTestDir;
    use super::*;
    use std::{
        env::temp_dir,
        fs::{create_dir_all, File},
    };

    #[test]
    fn should_returns_folders_and_compressed_files() {
        // Arrange
        let base = TempTestDir::new(&uuid::Uuid::new_v4().to_string());
        create_dir_all(base.path().join("A")).unwrap();
        create_dir_all(base.path().join("B")).unwrap();
        File::create(base.path().join("a.zip")).unwrap();
        File::create(base.path().join("b.ZIP")).unwrap();
        // Act
        let current_path = base.path().join("B").to_string_lossy().to_string();
        let mut result = get_sibling_containers(current_path).unwrap();
        result.sort();
        // Assert
        let mut expected = vec![
            base.path().join("A").to_string_lossy().to_string(),
            // B is the current folder, so it should be excluded
            base.path().join("a.zip").to_string_lossy().to_string(),
            base.path().join("b.ZIP").to_string_lossy().to_string(),
        ];
        expected.sort();
        assert_eq!(expected, result);
    }

    #[test]
    fn should_returns_error_when_path_not_exists() {
        // Arrange
        let non_existent_path = temp_dir()
            .join(uuid::Uuid::new_v4().to_string())
            .to_string_lossy()
            .to_string();
        // Act
        let result = get_sibling_containers(non_existent_path.clone());
        // Assert
        assert_eq!(result, Err(CommandError::PathNotFound(non_existent_path)));
    }

    #[test]
    fn should_returns_error_when_path_has_no_parent() {
        let root_path = if cfg!(target_os = "windows") {
            "C:\\".to_string()
        } else {
            "/".to_string()
        };
        let result = get_sibling_containers(root_path.clone());
        assert_eq!(result, Err(CommandError::NoParent));
    }

    #[test]
    fn should_returns_just_folders_when_no_compressed_files() {
        // Arrange
        let base = TempTestDir::new(&uuid::Uuid::new_v4().to_string());
        create_dir_all(base.path().join("A")).unwrap();
        create_dir_all(base.path().join("B")).unwrap();
        let current_path = base.path().join("B").to_string_lossy().to_string();
        // Act
        let mut result = get_sibling_containers(current_path).unwrap();
        result.sort();
        // Assert
        let mut expected = vec![base.path().join("A").to_string_lossy().to_string()];
        expected.sort();
        assert_eq!(expected, result);
    }

    #[test]
    fn should_returns_just_compressed_files_when_no_folders() {
        // Arrange
        let base = TempTestDir::new(&uuid::Uuid::new_v4().to_string());
        File::create(base.path().join("a.zip")).unwrap();
        File::create(base.path().join("b.ZIP")).unwrap();
        let current_path = base.path().join("b.ZIP").to_string_lossy().to_string();
        // Act
        let mut result = get_sibling_containers(current_path).unwrap();
        result.sort();
        // Assert
        let mut expected = vec![
            base.path().join("a.zip").to_string_lossy().to_string(),
            // b.ZIP is the current file, so it should be excluded
        ];
        expected.sort();
        assert_eq!(expected, result);
    }
}
