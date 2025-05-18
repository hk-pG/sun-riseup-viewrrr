mod commands;
use commands::fs::{get_sibling_folders, list_images_in_folder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_images_in_folder,
            get_sibling_folders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
