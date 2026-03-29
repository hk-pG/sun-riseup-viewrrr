use std::{fs, path::PathBuf};

use crate::CommandError;

/// Lists all image files in a specified folder.
///
/// This function scans the given folder and returns a list of file paths
/// for all image files found. Supported image formats are JPG, JPEG, PNG, GIF, and WEBP.
///
/// # Arguments
///
/// * `folder_path` - A string slice that holds the path to the folder to be scanned.
///
/// # Returns
///
/// A `Result` containing either a `Vec<String>` with the full paths of all image files
/// or a `CommandError` if an error occurs.
pub fn list_images_in_folder(folder_path: String) -> Result<Vec<String>, CommandError> {
    const SUPPORTED_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "gif", "webp"];

    let entries = fs::read_dir(&folder_path)?;

    let images = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if path.is_file() {
                let ext = path.extension()?.to_str()?.to_lowercase();
                if SUPPORTED_EXTENSIONS.contains(&ext.as_str()) {
                    return Some(path.to_string_lossy().to_string());
                }
            }
            None
        })
        .collect();

    Ok(images)
}

fn get_sibling_archives(container_path: String) -> Result<Vec<String>, CommandError> {
    let current = PathBuf::from(&container_path);
    if !current.exists() {
        return Err(CommandError::PathNotFound(container_path));
    }

    current.parent().ok_or(CommandError::NoParent)?;

    let entries = fs::read_dir(current.parent().unwrap())?;

    let archives = entries
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.is_file() && path != current {
                    let ext = path.extension()?.to_str()?.to_lowercase();
                    if ext == "zip" {
                        return Some(path.to_string_lossy().to_string());
                    }
                }
                None
            })
        })
        .collect();

    Ok(archives)
}
