use std::{fs, path::PathBuf};

use crate::image_container::{CommandError, ImageContainer, ImageHandle};

const SUPPORTED_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "gif", "webp"];

pub struct FolderImageContainer {
    folder_path: PathBuf,
}

impl FolderImageContainer {
    ///
    /// 指定されたフォルダを表す `FolderImageContainer` を作成します。
    /// 構造体の生成時に存在チェックを行う。(その瞬間の存在しか保証しない: TOCTOU)
    ///
    pub fn new<P: AsRef<std::path::Path>>(folder_path: P) -> Result<Self, CommandError> {
        // 存在チェック
        let folder_path = folder_path.as_ref();
        if !folder_path.exists() {
            return Err(CommandError::PathNotFound(
                folder_path.to_string_lossy().to_string(),
            ));
        }

        Ok(Self {
            folder_path: folder_path.to_path_buf(),
        })
    }
}

impl ImageContainer for FolderImageContainer {
    fn list_handles(&self) -> Result<Vec<ImageHandle>, CommandError> {
        let image_paths = list_image_paths_in_folder(&self.folder_path)?;

        Ok(image_paths
            .into_iter()
            .enumerate()
            .map(|(index, path)| ImageHandle {
                index: index as u32,
                name: path
                    .file_name()
                    .map(|name| name.to_string_lossy().to_string())
                    .unwrap_or_else(|| path.to_string_lossy().to_string()),
            })
            .collect())
    }

    fn resolve_range(&self, offset: u32, count: u32) -> Result<Vec<String>, CommandError> {
        let image_paths = list_image_paths_in_folder(&self.folder_path)?;
        let start = usize::try_from(offset).unwrap_or(usize::MAX);
        if start >= image_paths.len() {
            return Ok(Vec::new());
        }

        let len = usize::try_from(count).unwrap_or(usize::MAX);
        let end = start.saturating_add(len).min(image_paths.len());

        Ok(image_paths[start..end]
            .iter()
            .map(|path| path.to_string_lossy().to_string())
            .collect())
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
fn list_image_paths_in_folder<P: AsRef<std::path::Path>>(
    folder_path: P,
) -> Result<Vec<PathBuf>, CommandError> {
    let entries = fs::read_dir(&folder_path)?;

    let mut images: Vec<PathBuf> = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if is_supported_image_path(&path) {
                return Some(path);
            }
            None
        })
        .collect();

    images.sort();

    Ok(images)
}

fn is_supported_image_path(path: &std::path::Path) -> bool {
    if !path.is_file() {
        return false;
    }

    let Some(extension) = path.extension().and_then(|ext| ext.to_str()) else {
        return false;
    };

    SUPPORTED_EXTENSIONS
        .iter()
        .any(|supported| supported.eq_ignore_ascii_case(extension))
}

///
/// INFO: get_sibling_foldersとget_sibling_archivesは、ImageContainerの実装とは独立させる必要がある。
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
pub fn get_sibling_folders<P: AsRef<std::path::Path>>(
    folder_path: P,
) -> Result<Vec<String>, CommandError> {
    let folder_path = folder_path.as_ref();
    let current = PathBuf::from(&folder_path);

    if !current.exists() {
        return Err(CommandError::PathNotFound(
            folder_path.to_string_lossy().to_string(),
        ));
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

///
/// INFO: get_sibling_foldersと同様に、get_sibling_archivesもImageContainerとは独立させる必要がある。
/// INFO: コンテナ実装が変わっても、隣接するコンテナの取得方法は変わらないため、トレイトに定義すると冗長になってしまう。
///
pub fn get_sibling_archives<P: AsRef<std::path::Path>>(
    container_path: P,
) -> Result<Vec<String>, CommandError> {
    let container_path = container_path.as_ref();
    let current = PathBuf::from(&container_path);
    if !current.exists() {
        return Err(CommandError::PathNotFound(
            container_path.to_string_lossy().to_string(),
        ));
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
        let result = get_sibling_folders("non_existent_path_for_siblings");
        assert!(matches!(result, Err(CommandError::PathNotFound(_))));
    }
}
