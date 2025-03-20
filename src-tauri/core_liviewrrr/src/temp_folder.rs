use std::{fs, path::Path};
use uuid::Uuid;

pub struct TempFolder;

impl TempFolder {
    pub fn create_temp_folder(base_path: &str) -> String {
        let temp_path = format!("{}/{}", base_path, Uuid::new_v4());
        fs::create_dir_all(&temp_path).expect("Failed to create temp directory");
        temp_path
    }

    pub fn clean_up(temp_path: &str) {
        if Path::new(temp_path).exists() {
            fs::remove_dir_all(temp_path).expect("Failed to remove temp directory");
        }
    }
}
