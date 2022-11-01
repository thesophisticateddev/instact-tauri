#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn custom_func(arg: (&str, &str)) {
    println!("some data in tuple {}",arg.0);
}

fn main() {
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,custom_func])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
