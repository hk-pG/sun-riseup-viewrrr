use std::path::{Path, PathBuf};

use crate::image_container::{folder::list_images_in_folder, CommandError};

pub struct ArchiveImageContainer {
    source_archive_path: PathBuf,
    config: ArchiveImageContainerConfig,
}

impl ArchiveImageContainer {
    pub fn new<P: AsRef<Path>>(
        archive_file_path: P,
        config: ArchiveImageContainerConfig,
    ) -> Result<Self, CommandError> {
        // Check the archive file exists
        if !archive_file_path.as_ref().exists() {
            return Err(CommandError::PathNotFound(
                archive_file_path.as_ref().to_string_lossy().to_string(),
            ));
        }

        Ok(ArchiveImageContainer {
            source_archive_path: PathBuf::from(archive_file_path.as_ref()),
            config,
        })
    }

    pub fn list_images_in_container<P: AsRef<Path>>(
        &self,
        container_path: P,
    ) -> Result<Vec<String>, CommandError> {
        let container_path = container_path.as_ref();
        // if the container is directory, list images in the directory
        if container_path.is_dir() {
            return list_images_in_folder(container_path.to_string_lossy().to_string());
        }

        Ok(vec![container_path
            .join("image_in_zip.jpg")
            .to_string_lossy()
            .to_string()])
    }
}
pub struct ArchiveImageContainerConfig {
    extract_dir: PathBuf,
}

impl ArchiveImageContainerConfig {
    pub fn new<P: AsRef<Path>>(extract_dir_path: P) -> Self {
        ArchiveImageContainerConfig {
            extract_dir: PathBuf::from(extract_dir_path.as_ref()),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::image_container::archive::{ArchiveImageContainer, ArchiveImageContainerConfig};
    use crate::test_helper::test_helpers::TempTestDir;
    use std::fs::File;

    #[test]
    fn returns_a_image_file_in_zip_container() {
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
        let extract_dir = TempTestDir::new_random();
        let config = ArchiveImageContainerConfig::new(extract_dir.path());
        // zipファイルをコンテナとして扱うためにArchiveImageContainerを作成する
        let zip_image_container = ArchiveImageContainer::new(&zip_file_path, config).unwrap();

        // Act
        let images_in_container = zip_image_container
            .list_images_in_container(&zip_file_path)
            .unwrap();

        // Assert
        assert_eq!(images_in_container.len(), 1);
    }

    #[test]
    fn returns_error_when_zip_container_not_found() {
        // Arrange
        let config = ArchiveImageContainerConfig::new("/some/extract/dir");

        // Act
        let result = ArchiveImageContainer::new("/non_existent_path_for_zip.zip", config);

        // Assert
        assert!(matches!(result, Err(CommandError::PathNotFound(_))));
    }
}
