#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::VecDeque;

use cli_clipboard::ClipboardContext;
use cli_clipboard::ClipboardProvider;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, Window};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn clipboard_listener_service(window: Window) {
    std::thread::spawn(move || {
        let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
        let mut stack: VecDeque<String> = VecDeque::new();
      
        let delay = std::time::Duration::from_secs(5);
        loop {
            let mut str = ctx.get_contents().unwrap();

            // if stack.is_empty() {
                //if the content has changed
                println!("In the thread: clipboard contents: {}", str);
                window
                    .emit(
                        "list-updated",
                        Payload {
                            message: str.into(),
                        },
                    )
                    .unwrap();
                println!("event emitted from rust");
            //     stack.push_back(str);
            // }
            std::thread::sleep(delay);
        }
    });
}

fn main() {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);
    let tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![greet, clipboard_listener_service])
        .setup(|app| {
            // listen to the `event-name` (emitted on any window)
            let main_window = app.get_window("main").unwrap();

            // listen to the `event-name` (emitted on the `main` window)
            let id = main_window.listen("list-updated", |event| {
                println!("got window event-name with payload {:?}", event.payload());
            });
            // unlisten to the event using the `id` returned on the `listen` function
            // an `once` API is also exposed on the `Window` struct
            main_window.unlisten(id);

            // emit the `event-name` event to the `main` window
            main_window
                .emit(
                    "list-updated",
                    Payload {
                        message: "Tauri is awesome!".into(),
                    },
                )
                .unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}