use crate::image_container::reader_config::ImageContainerReaderConfig;
use crate::image_container::ImageContainerReader;
use crate::CommandError;

/// Lists all image files in a specified container (folder or archive).
/// This function determines if the given path is a folder or an archive and lists
/// the image files accordingly. It uses the `ImageContainerReader` to handle both types of containers.
///
/// # Arguments
/// * `container_path` - A string slice that holds the path to the container (folder or archive).
/// * `cache_dir` - A string slice that holds the path to the cache directory for storing temporary files when dealing with archives.
///
/// # Returns
/// A `Result` containing either a `Vec<String>` with the full paths of all image files in the container or a `CommandError` if an error occurs.
///
pub fn list_images_in_container<P: AsRef<std::path::Path>, Q: AsRef<std::path::Path>>(
    container_path: P,
    cache_dir: Q,
) -> Result<Vec<String>, CommandError> {
    let container_path = container_path.as_ref();
    let cache_dir = cache_dir.as_ref();

    let reader_config = ImageContainerReaderConfig::new(cache_dir);
    let reader = ImageContainerReader::new(reader_config);

    reader.list_images_in_container(container_path)
}

///
/// 指定されたパスの兄弟コンテナ（フォルダやアーカイブ）を取得します。
///
pub fn get_sibling_containers<P: AsRef<std::path::Path>>(
    container_path: P,
) -> Result<Vec<String>, CommandError> {
    let container_path = container_path.as_ref();

    crate::image_container::get_sibling_containers(container_path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helper::test_helpers::TempTestDir;
    use std::fs::{create_dir_all, File};

    mod list_images_in_container {
        use super::*;
        #[test]
        fn test_list_images_in_folder_success() {
            let temp_dir = TempTestDir::new_random();
            File::create(temp_dir.path().join("image1.jpg")).unwrap();
            File::create(temp_dir.path().join("image2.PNG")).unwrap(); // Uppercase extension
            File::create(temp_dir.path().join("document.txt")).unwrap();

            let images = list_images_in_container(
                temp_dir.path().to_string_lossy().to_string(),
                temp_dir.path().to_string_lossy().to_string(),
            )
            .unwrap();

            assert_eq!(images.len(), 2);
            assert!(images.iter().any(|p| p.ends_with("image1.jpg")));
            assert!(images.iter().any(|p| p.ends_with("image2.PNG")));
        }

        #[test]
        fn test_list_images_in_container_not_found() {
            let result =
                list_images_in_container("non_existent_path_for_images", "non_existent_cache_dir");
            assert!(matches!(result, Err(CommandError::PathNotFound(_))));
        }
    }

    mod get_sibling_containers {
        use super::*;

        #[test]
        fn test_get_sibling_containers_success() {
            let base = TempTestDir::new_random();
            create_dir_all(base.path().join("A")).unwrap();
            create_dir_all(base.path().join("B")).unwrap();
            create_dir_all(base.path().join("C")).unwrap();

            let current_path = base.path().join("B").to_string_lossy().to_string();
            let mut result = get_sibling_containers(current_path).unwrap();
            result.sort(); // Sort for stable assertion

            let mut expected = vec![
                base.path().join("A").to_string_lossy().to_string(),
                base.path().join("C").to_string_lossy().to_string(),
            ];
            expected.sort();

            assert_eq!(result, expected);
        }

        #[test]
        fn test_get_sibling_containers_not_found() {
            let result = get_sibling_containers("non_existent_path_for_siblings");
            assert!(matches!(result, Err(CommandError::PathNotFound(_))));
        }
    }
}
