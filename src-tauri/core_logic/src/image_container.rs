pub mod archive;
pub mod folder;

use crate::image_container::folder::{
    get_sibling_archives, get_sibling_folders, list_images_in_folder,
};
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

pub fn list_images_in_container(container_path: String) -> Result<Vec<String>, CommandError> {
    let path = PathBuf::from(&container_path);

    // Check if the container exists
    if !path.exists() {
        return Err(CommandError::PathNotFound(container_path));
    }
    // if the container is directory, list images in the directory
    if path.is_dir() {
        return list_images_in_folder(container_path);
    }

    Ok(vec![path
        .join("image_in_zip.jpg")
        .to_string_lossy()
        .to_string()])
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
mod tests {
    use super::*;
    use crate::test_helper::test_helpers::*;

    #[cfg(test)]
    mod list_images_in_container_test {

        use crate::image_container::archive::{ArchiveImageContainer, ArchiveImageContainerConfig};

        use super::*;
        use std::fs::File;

        #[test]
        fn should_returns_images_in_folder() {
            let temp_dir = TempTestDir::new("test_list_images_success");
            File::create(temp_dir.path().join("image1.jpg")).unwrap();
            File::create(temp_dir.path().join("image2.PNG")).unwrap(); // Uppercase extension
            File::create(temp_dir.path().join("document.txt")).unwrap();

            let images =
                list_images_in_container(temp_dir.path().to_string_lossy().to_string()).unwrap();

            assert_eq!(images.len(), 2);
            assert!(images.iter().any(|p| p.ends_with("image1.jpg")));
            assert!(images.iter().any(|p| p.ends_with("image2.PNG")));
        }

        #[test]
        fn should_returns_error_when_folder_not_found() {
            let result = list_images_in_container("non_existent_path_for_images".to_string());
            assert!(matches!(result, Err(CommandError::PathNotFound(_))));
        }

        #[test]
        #[ignore]
        fn should_returns_a_image_file_in_zip_container() {
            // Arrange
            // テスト用の一時ディレクトリを作成する
            let temp_dir = TempTestDir::new_random();

            // 一時ディレクトリに画像ファイルを作成する
            let image_file_path = temp_dir.path().join("image_in_zip.jpg");
            File::create(&image_file_path).unwrap();
            // 一時ディレクトリにzipファイルを作成する
            let zip_file_path = temp_dir.path().join("file.zip");
            // zipファイルに画像ファイルを書き込む
            TempTestDir::create_zip(&zip_file_path, vec![&image_file_path]).unwrap();

            // zipファイルを展開する場所を指定する設定を作成する
            let config = ArchiveImageContainerConfig::new(temp_dir.path());
            // zipファイルをコンテナとして扱うためにArchiveImageContainerを作成する
            let zip_image_container =
                ArchiveImageContainer::new("/aaa/bbb/file.zip", config).unwrap();

            // Act
            let images_in_container = zip_image_container
                .list_images_in_container("/aaa/bbb/file.zip")
                .unwrap();

            // Assert
            assert_eq!(images_in_container.len(), 1);
        }

        #[test]
        fn should_returns_error_when_zip_container_not_found() {
            // Arrange
            let config = ArchiveImageContainerConfig::new("/some/extract/dir");

            // Act
            let result = ArchiveImageContainer::new("/non_existent_path_for_zip.zip", config);

            // Assert
            assert!(matches!(result, Err(CommandError::PathNotFound(_))));
        }
    }

    #[cfg(test)]
    mod get_sibling_containers_test {
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
}
