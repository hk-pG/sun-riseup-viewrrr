use tauri::command;
use core_logic::{
    get_sibling_folders as core_get_sibling_folders,
    list_images_in_folder as core_list_images_in_folder, CommandError,
};

/// Lists all image files in a specified folder. (Wrapper for core logic)
#[command]
pub fn list_images_in_folder(folder_path: String) -> Result<Vec<String>, CommandError> {
    core_list_images_in_folder(folder_path)
}

/// Gets sibling folders for a given path. (Wrapper for core logic)
#[command]
pub fn get_sibling_folders(folder_path: String) -> Result<Vec<String>, CommandError> {
    core_get_sibling_folders(folder_path)
}
