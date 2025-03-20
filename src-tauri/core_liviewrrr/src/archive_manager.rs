use std::{
    fs::{self, File},
    path::PathBuf,
};

pub struct ArchiveManager;

impl ArchiveManager {
    pub fn extract_to_temp(zip_path: &str, temp_dir: &str) -> PathBuf {
        let file = File::open(zip_path).expect("Failed to open zip file");
        let mut archive = zip::ZipArchive::new(file).expect("Failed to open zip archive");

        let extract_path = PathBuf::from(temp_dir);
        fs::create_dir(&extract_path).expect("Failed to create temp directory");

        archive
            .extract(&extract_path)
            .expect("Failed to extract zip file");

        extract_path
    }

    pub fn get_first_image(extracted_path: &PathBuf) -> Option<PathBuf> {
        let entries = fs::read_dir(extracted_path).expect("Failed to read extracted directory");

        for entry in entries {
            let entry = entry.expect("Failed to read entry");
            let path = entry.path();
            if path.is_file() {
                let ext = path.extension().unwrap().to_str().unwrap();
                if ["png", "jpg", "jpeg", "webp"].contains(&ext) {
                    return Some(path);
                }
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::temp_folder::TempFolder;

    use super::ArchiveManager;

    #[test]
    fn test_extract_to_temp() {
        let zip_path = "test_assets/test.zip";
        let temp_dir = Uuid::new_v4().to_string();

        // if already exists, remove it
        if std::path::Path::new(&temp_dir).exists() {
            TempFolder::clean_up(&temp_dir);
        }

        let extracted_path = ArchiveManager::extract_to_temp(zip_path, &temp_dir);

        assert!(extracted_path.exists());
        TempFolder::clean_up(&temp_dir);
    }

    #[test]
    fn test_get_first_image() {
        let zip_path = "test_assets/test.zip";
        let temp_dir = Uuid::new_v4().to_string();

        let extracted_path = ArchiveManager::extract_to_temp(zip_path, &temp_dir);
        let image_path = ArchiveManager::get_first_image(&extracted_path);

        assert!(image_path.is_some());
        TempFolder::clean_up(&temp_dir);
    }
}
