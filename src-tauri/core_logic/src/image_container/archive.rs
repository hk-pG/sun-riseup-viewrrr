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
