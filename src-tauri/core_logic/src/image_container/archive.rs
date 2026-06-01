use std::{
    fs::File,
    io::{copy, Read, Seek},
    path::{Path, PathBuf},
};

use zip::ZipArchive;

use crate::{
    image_container::{
        reader_config::ImageContainerReaderConfig, CommandError, ImageContainer, ImageHandle,
    },
    utils::hash_path,
};

const SUPPORTED_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "gif", "webp"];

#[derive(Debug, Clone, PartialEq, Eq)]
struct ArchiveImageEntry {
    archive_index: usize,
    archive_path: PathBuf,
    display_name: String,
}

pub struct ArchiveImageContainer {
    source_archive_path: PathBuf,
    config: ImageContainerReaderConfig,
}

impl ArchiveImageContainer {
    pub fn new<P: AsRef<Path>>(
        archive_file_path: P,
        config: ImageContainerReaderConfig,
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
        self.list_images()
    }

    fn list_archive_entries(&self) -> Result<Vec<ArchiveImageEntry>, CommandError> {
        self.validate_archive_path()?;

        let mut archive = self.open_archive()?;
        let mut entries = Vec::new();

        for archive_index in 0..archive.len() {
            let file = archive
                .by_index(archive_index)
                .map_err(|err| CommandError::NotAnArchive(err.to_string()))?;

            if !file.is_file() {
                continue;
            }

            let Some(archive_path) = file.enclosed_name() else {
                continue;
            };

            if !is_supported_archive_image_path(&archive_path) {
                continue;
            }

            let display_name = archive_path
                .file_name()
                .map(|name| name.to_string_lossy().to_string())
                .unwrap_or_else(|| archive_path.to_string_lossy().to_string());

            entries.push(ArchiveImageEntry {
                archive_index,
                archive_path,
                display_name,
            });
        }

        entries.sort_by(|left, right| left.archive_path.cmp(&right.archive_path));

        Ok(entries)
    }

    fn validate_archive_path(&self) -> Result<(), CommandError> {
        let container_path = self.source_archive_path.as_path();

        if container_path.is_dir() {
            return Err(CommandError::NotSpecifiedArchive(
                container_path.to_string_lossy().to_string(),
            ));
        }

        if !self.config.is_supported_extension(container_path) {
            return Err(CommandError::UnsupportedExtension(
                container_path.to_string_lossy().to_string(),
            ));
        }

        Ok(())
    }

    fn open_archive(&self) -> Result<ZipArchive<File>, CommandError> {
        let file = File::open(&self.source_archive_path)?;
        ZipArchive::new(file).map_err(|err| CommandError::NotAnArchive(err.to_string()))
    }

    fn get_extract_dir(&self) -> Result<PathBuf, CommandError> {
        let extract_dir = self
            .config
            .get_extract_dir()
            .join(hash_path(&self.source_archive_path));

        std::fs::create_dir_all(&extract_dir)?;

        Ok(extract_dir)
    }

    fn extract_entry<R: Read + Seek>(
        &self,
        archive: &mut ZipArchive<R>,
        extract_dir: &Path,
        entry: &ArchiveImageEntry,
    ) -> Result<String, CommandError> {
        let output_path = extract_dir.join(&entry.archive_path);
        if output_path.exists() {
            return Ok(output_path.to_string_lossy().to_string());
        }

        if let Some(parent) = output_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let mut archive_file = archive
            .by_index(entry.archive_index)
            .map_err(|err| CommandError::NotAnArchive(err.to_string()))?;
        let mut output_file = File::create(&output_path)?;
        copy(&mut archive_file, &mut output_file)?;

        Ok(output_path.to_string_lossy().to_string())
    }
}

impl ImageContainer for ArchiveImageContainer {
    fn list_handles(&self) -> Result<Vec<ImageHandle>, CommandError> {
        let entries = self.list_archive_entries()?;

        Ok(entries
            .into_iter()
            .enumerate()
            .map(|(index, entry)| ImageHandle {
                index: index as u32,
                name: entry.display_name,
            })
            .collect())
    }

    fn resolve_range(&self, offset: u32, count: u32) -> Result<Vec<String>, CommandError> {
        let entries = self.list_archive_entries()?;
        let start = usize::try_from(offset).unwrap_or(usize::MAX);
        if start >= entries.len() {
            return Ok(Vec::new());
        }

        let len = usize::try_from(count).unwrap_or(usize::MAX);
        let end = start.saturating_add(len).min(entries.len());
        let selected_entries = &entries[start..end];

        let extract_dir = self.get_extract_dir()?;
        let mut archive = self.open_archive()?;
        let mut resolved = Vec::with_capacity(selected_entries.len());

        for entry in selected_entries {
            resolved.push(self.extract_entry(&mut archive, &extract_dir, entry)?);
        }

        Ok(resolved)
    }
}

fn is_supported_archive_image_path(path: &Path) -> bool {
    if path.components().count() != 1 {
        return false;
    }

    let Some(extension) = path.extension().and_then(|ext| ext.to_str()) else {
        return false;
    };

    SUPPORTED_EXTENSIONS
        .iter()
        .any(|supported| supported.eq_ignore_ascii_case(extension))
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::image_container::{archive::ArchiveImageContainer, ImageContainerReaderConfig};
    use crate::test_helper::test_helpers::TempTestDir;
    use crate::test_helper::test_helpers::ZipTestEnv;
    use std::fs::File;
    use std::io::Write;
    use std::path::Path;

    #[test]
    fn returns_an_image_file_in_zip_container() {
        // Arrange
        let env = ZipTestEnv::with_images(&["image.jpg"]);
        let config = ImageContainerReaderConfig::new(env.extract_dir.path());
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
        let config = ImageContainerReaderConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        // Act
        let images_in_container = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        assert_eq!(images_in_container.len(), 2);
    }

    #[test]
    fn lists_handles_without_extracting_archive() {
        let env = ZipTestEnv::with_images(&["image_b.jpg", "image_a.jpg"]);
        let config = ImageContainerReaderConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        let handles = zip_image_container.list_handles().unwrap();

        assert_eq!(
            handles,
            vec![
                ImageHandle {
                    index: 0,
                    name: "image_a.jpg".to_string(),
                },
                ImageHandle {
                    index: 1,
                    name: "image_b.jpg".to_string(),
                },
            ]
        );

        let extract_dir = env.extract_dir.path().join(hash_path(&env.zip_path));
        assert!(
            !extract_dir.exists(),
            "list_handles should not create an extracted cache directory"
        );
    }

    #[test]
    fn resolves_only_requested_range_in_handle_order() {
        let env = ZipTestEnv::with_images(&["image_c.jpg", "image_a.jpg", "image_b.jpg"]);
        let config = ImageContainerReaderConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        let resolved = zip_image_container.resolve_range(1, 2).unwrap();

        let resolved_names: Vec<String> = resolved
            .iter()
            .map(|path| {
                Path::new(path)
                    .file_name()
                    .unwrap()
                    .to_string_lossy()
                    .to_string()
            })
            .collect();
        assert_eq!(resolved_names, vec!["image_b.jpg", "image_c.jpg"]);

        let extract_dir = env.extract_dir.path().join(hash_path(&env.zip_path));
        assert!(extract_dir.join("image_b.jpg").exists());
        assert!(extract_dir.join("image_c.jpg").exists());
        assert!(
            !extract_dir.join("image_a.jpg").exists(),
            "resolve_range should not extract images outside the requested slice"
        );
    }

    #[test]
    fn returns_error_when_zip_container_not_found() {
        // Arrange
        let config = ImageContainerReaderConfig::new("/some/extract/dir");

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
        let config = ImageContainerReaderConfig::new(extract_base.path());
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
        let config = ImageContainerReaderConfig::new(extract_base.path());
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
        let config = ImageContainerReaderConfig::new(extract_base.path());
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
        let config = ImageContainerReaderConfig::new(extract_base.path());
        let zip_image_container = ArchiveImageContainer::new(&zip_path, config).unwrap();

        // Act
        let images = zip_image_container.list_images_in_archive().unwrap();

        // Assert
        assert_eq!(images.len(), 0);
    }

    #[test]
    fn resolve_range_reuses_cached_files() {
        let env = ZipTestEnv::with_images(&["image.jpg"]);
        let existing_dir = env
            .extract_dir
            .path()
            .join(crate::utils::hash_path(&env.zip_path));
        std::fs::create_dir_all(&existing_dir).unwrap();
        let cached_image = existing_dir.join("image.jpg");
        let marker_file = existing_dir.join("marker_cached.txt");
        File::create(&cached_image).unwrap();
        File::create(&marker_file).unwrap();

        let config = ImageContainerReaderConfig::new(env.extract_dir.path());
        let zip_image_container = ArchiveImageContainer::new(&env.zip_path, config).unwrap();

        let images = zip_image_container.resolve_range(0, 1).unwrap();

        assert_eq!(images.len(), 1);
        assert_eq!(images[0], cached_image.to_string_lossy());
        assert!(
            marker_file.exists(),
            "Marker file should exist, proving cached files were reused"
        );
    }
}
