pub mod archive;
pub mod folder;
pub mod reader_config;

use crate::image_container::{
    folder::{get_sibling_archives, get_sibling_folders, FolderImageContainer},
    reader_config::ImageContainerReaderConfig,
};
use std::path::PathBuf;

// A custom error type for command errors
#[derive(Debug, serde::Serialize, PartialEq)]
pub enum CommandError {
    Io(String),
    PathNotFound(String),
    NoParent,
    UnsupportedExtension(String),
    NotSpecifiedArchive(String),
    NotAnArchive(String),
}

impl From<std::io::Error> for CommandError {
    fn from(err: std::io::Error) -> Self {
        CommandError::Io(err.to_string())
    }
}

pub trait ImageContainer {
    ///
    /// Returns a list of image file paths contained within the container.
    ///
    fn list_images(&self) -> Result<Vec<String>, CommandError>;

    ///
    /// Returns the path to the first image for the container.
    ///
    fn get_first_image(&self) -> Result<Option<String>, CommandError>;
}

///
/// `ImageContainer`を外部から利用するための構造体。
/// 外部から利用する際、`ImageContainerReaderConfig`を渡して、コンテナの種類に関係なく画像をリストアップすることができます。
///
pub struct ImageContainerReader {
    config: ImageContainerReaderConfig,
}

impl ImageContainerReader {
    pub fn new(config: ImageContainerReaderConfig) -> Self {
        ImageContainerReader { config }
    }

    pub fn list_images_in_container<P: AsRef<std::path::Path>>(
        &self,
        container_path: P,
    ) -> Result<Vec<String>, CommandError> {
        self._list_images_in_container(container_path.as_ref())
    }

    fn _list_images_in_container<P: AsRef<std::path::Path>>(
        &self,
        container_path: P,
    ) -> Result<Vec<String>, CommandError> {
        // let path = PathBuf::from(&container_path);
        let container_path = container_path.as_ref();

        self.open_container(container_path)
    }

    fn open_container<P: AsRef<std::path::Path>>(
        &self,
        container_path: P,
    ) -> Result<Vec<String>, CommandError> {
        let container_path = container_path.as_ref();

        if !container_path.exists() {
            return Err(CommandError::PathNotFound(
                container_path.to_string_lossy().to_string(),
            ));
        }

        if container_path.is_dir() {
            let folder_container = FolderImageContainer::new(container_path)?;
            return folder_container.list_images();
        }

        let archive_container =
            archive::ArchiveImageContainer::new(container_path, self.config.clone())?;
        archive_container.list_images_in_archive()
    }
}

///
/// INFO: ImageContainerとは独立した関数として実装する理由
/// INFO: コンテナ実装ごとに実装が変わらないため、トレイトに定義すると冗長になってしまう。
/// `get_sibling_containers` コマンドは、指定されたパスの兄弟コンテナを取得します。
/// 自分自身のコンテナは除外されます。
///
/// ***コンテナ***とは、フォルダに加えて圧縮ファイルを含みます。
///
pub fn get_sibling_containers<P: AsRef<std::path::Path>>(
    container_path: P,
) -> Result<Vec<String>, CommandError> {
    let container_path = container_path.as_ref();
    let container_path_str = container_path.to_string_lossy().to_string();

    let current = PathBuf::from(&container_path);
    if !current.exists() {
        return Err(CommandError::PathNotFound(container_path_str));
    }

    current.parent().ok_or(CommandError::NoParent)?;

    let folders = get_sibling_folders(container_path)?;
    let archives = get_sibling_archives(container_path)?;

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
        use super::*;
        use std::fs::File;

        #[test]
        fn returns_images_in_folder() {
            // Arrange
            let temp_dir = TempTestDir::new("test_list_images_success");
            File::create(temp_dir.path().join("image1.jpg")).unwrap();
            File::create(temp_dir.path().join("image2.PNG")).unwrap(); // Uppercase extension
            File::create(temp_dir.path().join("document.txt")).unwrap();
            let reader =
                ImageContainerReader::new(ImageContainerReaderConfig::new(temp_dir.path()));

            // Act
            // let images = list_images_in_container(temp_dir.path(), temp_dir.path()).unwrap();
            let images = reader.list_images_in_container(temp_dir.path()).unwrap();

            // Assert
            assert_eq!(images.len(), 2);
            assert!(images.iter().any(|p| p.ends_with("image1.jpg")));
            assert!(images.iter().any(|p| p.ends_with("image2.PNG")));
        }

        #[test]
        fn returns_error_when_folder_not_found() {
            // Arrange
            let reader = ImageContainerReader::new(ImageContainerReaderConfig::new(
                "non_existent_path_for_images",
            ));

            // Act
            let result = reader.list_images_in_container("non_existent_path_for_images");

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
        fn returns_folders_and_compressed_files() {
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
        fn returns_error_when_path_not_exists() {
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
        fn returns_error_when_path_has_no_parent() {
            let root_path = if cfg!(target_os = "windows") {
                "C:\\".to_string()
            } else {
                "/".to_string()
            };
            let result = get_sibling_containers(root_path.clone());
            assert_eq!(result, Err(CommandError::NoParent));
        }

        #[test]
        fn returns_just_folders_when_no_compressed_files() {
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
        fn returns_just_compressed_files_when_no_folders() {
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
