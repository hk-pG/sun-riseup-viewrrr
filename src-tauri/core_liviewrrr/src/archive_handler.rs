use std::{
    fs::File,
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

use tempfile::TempDir;
use zip::ZipArchive;

pub struct ArchiveHandler {
    temp_dir: TempDir,
    extracted_dirs: Arc<Mutex<Vec<PathBuf>>>,
}

///
/// ArchiveHandler is a struct that handles the extraction of zip files.
/// This struct is used as interface to extract zip files to a temporary directory with UI.
///
impl ArchiveHandler {
    pub fn new() -> Self {
        Self {
            temp_dir: TempDir::new().expect("Failed to create a temporary directory"),
            extracted_dirs: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn extract_zip(&self, archive_path: &Path) -> Result<PathBuf, String> {
        let zip_file = File::open(archive_path).map_err(|e| e.to_string())?;
        let mut archive = ZipArchive::new(zip_file).map_err(|e| e.to_string())?;

        let extract_path = self.temp_dir.path().join(archive_path.file_stem().unwrap());
        std::fs::create_dir_all(&extract_path).map_err(|e| e.to_string())?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let out_path = extract_path.join(file.name());

            if file.is_dir() {
                std::fs::create_dir_all(&out_path).map_err(|e| e.to_string())?;
            } else {
                let mut out_file = File::create(&out_path).map_err(|e| e.to_string())?;
                let mut buffer = Vec::new();
                file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
                out_file.write_all(&buffer).map_err(|e| e.to_string())?;
            }
        }

        self.extracted_dirs
            .lock()
            .unwrap()
            .push(extract_path.clone());

        Ok(extract_path)
    }

    pub fn get_extracted_dirs(&self) -> Vec<PathBuf> {
        self.extracted_dirs.lock().unwrap().clone()
    }
}

impl Default for ArchiveHandler {
    fn default() -> Self {
        Self::new()
    }
}
