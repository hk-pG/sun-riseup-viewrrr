pub mod commands;
pub mod tauri_log_config;
pub mod utils;
use commands::fs::{get_sibling_containers, list_images_in_container};
use commands::thumbnail::{get_folder_thumbnail, prefetch_folder_thumbnails};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_log_config::generate_tauri_log_config().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            list_images_in_container,
            get_sibling_containers,
            get_folder_thumbnail,
            prefetch_folder_thumbnails
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
