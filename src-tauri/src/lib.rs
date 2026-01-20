// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod byond;

use byond::{
    check_byond_version, connect_to_server, delete_byond_version, install_byond_version,
    list_installed_byond_versions,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            check_byond_version,
            install_byond_version,
            connect_to_server,
            list_installed_byond_versions,
            delete_byond_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
