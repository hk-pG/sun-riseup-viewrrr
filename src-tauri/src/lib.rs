use std::fs;
use std::path::PathBuf;
use walkdir::WalkDir;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_folders, list_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// フォルダ一覧取得API
#[tauri::command]
fn list_folders(current_dir: String) -> Vec<String> {
    let path = PathBuf::from(current_dir);
    fs::read_dir(path)
        .unwrap()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|entry| entry.file_name().into_string().unwrap())
        .collect()
}

// 画像一覧取得API
#[tauri::command]
fn list_images(folder: String) -> Vec<String> {
    let path = PathBuf::from(folder);
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|ext| ["png", "jpg", "jpeg", "webp"].contains(&ext.to_str().unwrap()))
        })
        .map(|entry| entry.path().to_string_lossy().to_string())
        .collect()
}
