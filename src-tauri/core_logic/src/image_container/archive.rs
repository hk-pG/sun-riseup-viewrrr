use std::path::{Path, PathBuf};

use zip::ZipArchive;

use crate::{
    image_container::{folder::list_images_in_folder, CommandError},
    utils::hash_path,
};

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

    ///
    /// 指定されたコンテナに含まれる画像ファイルを返す。
    ///
    pub fn list_images_in_archive(&self) -> Result<Vec<String>, CommandError> {
        let container_path = self.source_archive_path.as_path();

        // if the container is directory, list images in the directory
        if container_path.is_dir() {
            // 圧縮ファイルではない場合エラーを返す
            return Err(CommandError::NotSpecifiedArchive(
                container_path.to_string_lossy().to_string(),
            ));
        }

        // Check extension
        if !self.config.is_supported_extension(container_path) {
            return Err(CommandError::UnsupportedExtension(
                container_path.to_string_lossy().to_string(),
            ));
        }

        let hash = hash_path(&container_path);
        // 解凍に失敗した場合はエラーを返す
        let extracted_dir = self.extract_archive(container_path, &hash)?;
        list_images_in_folder(extracted_dir.to_string_lossy().to_string())
    }

    ///
    /// 指定された圧縮ファイルを、指定された名前のディレクトリとして展開する。
    /// 既に同名のディレクトリが存在する場合は、展開せずにそのディレクトリのパスを返す。
    ///
    fn extract_archive<P: AsRef<Path>>(
        &self,
        archive_file_path: P,
        extract_name: &str,
    ) -> Result<PathBuf, CommandError> {
        // 展開の基底となるディレクトリパスを取得
        let extract_base = self.config.get_extract_dir();
        // 圧縮ファイルの中身を展開するディレクトリのパスを作成
        let extract_dir = extract_base.join(extract_name);

        // WARN: 前回の展開が途中で失敗した場合、中途半端なディレクトリが残る可能性がある。
        // WARN: 展開完了のマーカーファイルを作成するなどして完了を判定できるようにすることも検討する。

        // 既に同名のディレクトリが存在する場合は、展開せずにそのディレクトリのパスを返す
        if extract_dir.exists() {
            return Ok(extract_dir);
        }

        // 展開先の一時ディレクトリが存在しない場合は作成する
        if !extract_base.exists() {
            std::fs::create_dir_all(extract_base)?;
        }

        // 圧縮ファイルを開く
        let file = std::fs::File::open(archive_file_path)?;
        let mut archive =
            ZipArchive::new(file).map_err(|e| CommandError::NotAnArchive(e.to_string()))?;

        // 圧縮ファイルを指定の名前のディレクトリとして展開する
        // 展開に失敗した場合はエラーを返す
        archive
            .extract(&extract_dir)
            .map_err(|e| CommandError::NotAnArchive(e.to_string()))?;

        Ok(extract_dir)
    }
}

pub struct ArchiveImageContainerConfig {
    extract_dir: PathBuf,
    supported_extensions: Vec<String>,
}

impl ArchiveImageContainerConfig {
    pub fn new<P: AsRef<Path>>(extract_dir_path: P) -> Self {
        ArchiveImageContainerConfig {
            extract_dir: PathBuf::from(extract_dir_path.as_ref()),
            supported_extensions: vec!["zip".to_string()],
        }
    }

    pub fn get_extract_dir(&self) -> &Path {
        &self.extract_dir
    }

    ///
    ///指定されたパスの拡張子が、サポートされている拡張子のいずれかと一致するかを確認する。
    ///
    /// # Example
    ///
    /// ```
    /// use core_logic::image_container::archive::ArchiveImageContainerConfig;
    ///
    /// let config = ArchiveImageContainerConfig::new("/some/extract/dir");
    ///
    /// assert!(config.is_supported_extension("/some/path/file.zip"));
    /// assert!(!config.is_supported_extension("/some/path/file.txt"));
    /// ```
    ///
    pub fn is_supported_extension<P: AsRef<Path>>(&self, path: P) -> bool {
        let extension = path
            .as_ref()
            .extension()
            .and_then(|ext| ext.to_str())
            // 拡張子がない場合は空文字列にfallbackする
            .unwrap_or("");

        // 大文字小文字を区別せずに、サポートされている拡張子のいずれかと一致するかを確認する
        self.supported_extensions
            .iter()
            .any(|ext| ext.eq_ignore_ascii_case(extension))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::image_container::archive::{ArchiveImageContainer, ArchiveImageContainerConfig};
    use crate::test_helper::test_helpers::TempTestDir;
    use crate::test_helper::test_helpers::ZipTestEnv;
    use std::fs::{create_dir_all, File};
    use std::io::Write;

    #[test]
    fn returns_an_image_file_in_zip_container() {
        // Arrange
        let env = ZipTestEnv::with_images(&["image.jpg"]);
        let config = ArchiveImageContainerConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        // Act
        let images_in_container = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        assert_eq!(images_in_container.len(), 1);
    }

    #[test]
    fn returns_image_files_in_zip_container() {
        // Arrange
        let env = ZipTestEnv::with_images(&["image1.jpg", "image2.jpg"]);
        let config = ArchiveImageContainerConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        // Act
        let images_in_container = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        assert_eq!(images_in_container.len(), 2);
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

    #[test]
    fn returns_error_when_container_is_directory() {
        // Arrange
        let container_dir = TempTestDir::new_random();
        let extract_base = TempTestDir::new_random();
        let config = ArchiveImageContainerConfig::new(extract_base.path());
        let zip_image_container = ArchiveImageContainer::new(container_dir.path(), config).unwrap();

        // Act
        let result = zip_image_container.list_images_in_archive();

        // Assert
        assert!(matches!(result, Err(CommandError::NotSpecifiedArchive(_))));
    }

    #[test]
    fn returns_error_when_extension_unsupported() {
        // Arrange
        let base = TempTestDir::new_random();
        let file_path = base.path().join("file.txt");
        File::create(&file_path).unwrap();
        let extract_base = TempTestDir::new_random();
        let config = ArchiveImageContainerConfig::new(extract_base.path());
        let zip_image_container = ArchiveImageContainer::new(&file_path, config).unwrap();

        // Act
        let result = zip_image_container.list_images_in_archive();

        // Assert
        assert!(matches!(result, Err(CommandError::UnsupportedExtension(_))));
    }

    #[test]
    fn returns_error_when_zip_is_corrupted() {
        // Arrange
        let base = TempTestDir::new_random();
        let zip_path = base.path().join("corrupt.zip");
        let mut f = File::create(&zip_path).unwrap();
        f.write_all(b"not a valid zip").unwrap();
        let extract_base = TempTestDir::new_random();
        let config = ArchiveImageContainerConfig::new(extract_base.path());
        let zip_image_container = ArchiveImageContainer::new(&zip_path, config).unwrap();

        // Act
        let result = zip_image_container.list_images_in_archive();

        // Assert
        assert!(matches!(result, Err(CommandError::NotAnArchive(_))));
    }

    #[test]
    fn returns_empty_list_for_zip_with_no_images() {
        // Arrange
        let tmp = TempTestDir::new_random();
        let zip_path = tmp.path().join("empty.zip");
        TempTestDir::create_zip(&zip_path, Vec::<&std::path::PathBuf>::new()).unwrap();
        let extract_base = TempTestDir::new_random();
        let config = ArchiveImageContainerConfig::new(extract_base.path());
        let zip_image_container = ArchiveImageContainer::new(&zip_path, config).unwrap();

        // Act
        let images = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        assert_eq!(images.len(), 0);
    }

    #[test]
    fn skip_extraction_when_already_cached() {
        // Arrange
        let env = ZipTestEnv::with_images(&["image.jpg"]);
        let extract_base = env.extract_dir.path();
        let hash = crate::utils::hash_path(&env.zip_path);
        let existing_dir = extract_base.join(&hash);
        create_dir_all(&existing_dir).unwrap();
        // create a marker file to detect if extraction is skipped
        let marker_file = existing_dir.join("marker_cached.txt");
        File::create(&marker_file).unwrap();
        // also create the actual image file
        File::create(existing_dir.join("image.jpg")).unwrap();
        let config = ArchiveImageContainerConfig::new(extract_base);
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        // Act
        let images = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        // Verify images are found
        assert_eq!(images.len(), 1);
        // Verify marker file still exists (proof that extraction was skipped)
        assert!(
            marker_file.exists(),
            "Marker file should exist, proving cached dir was reused"
        );
    }
}
