#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate ureq;


mod oneai;
use crate::oneai::{get_names,get_dates,label::Label};
use active_win_pos_rs::get_active_window;
use cli_clipboard::ClipboardContext;
use cli_clipboard::ClipboardProvider;
use std::thread;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, Window};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[derive(Clone, serde::Serialize)]
struct Payload {
    count: i32,
    message: String,
    current_window: String,
    process: String,
    names_detected: Vec<Label>,
    dates_detected: Vec<Label>
}


#[tauri::command]
fn init_process(window: Window) {
    let delay = std::time::Duration::from_secs(10);
    std::thread::spawn(move || loop {
        window
            .emit(
                "test",
                Payload {
                    count: 0,
                    message: "Tauri is awesome!".into(),
                    current_window: "Active window".into(),
                    process: "Current process".into(),
                    names_detected:vec![],
                    dates_detected: vec![]
                },
            )
            .unwrap();
        std::thread::sleep(delay);
    });
}



fn clipboard_listener_service(window: Window) {
    thread::spawn(move || {
        let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();

        let delay = std::time::Duration::from_secs(1);
        let mut old_string: String = String::new();
        let mut ct = 0;
        println!("Thread-1 started to listen to clipboard events");
        loop {
            let copied_string = ctx.get_contents().unwrap();

            if old_string.ne(&copied_string) {
                old_string = copied_string.clone();
                //if the content has changed
             
                let screen: String;
                let mut proc: String = String::new();
                match get_active_window() {
                    Ok(active_window) => {
                        // println!("active window: {:#?}", active_window);
                        screen = active_window.title;
                        proc = active_window.process_name;
                    }
                    Err(()) => {
                        screen = "Could not get current screen".into();
                        // println!("error occurred while getting the active window");
                    }
                }
                ct += 1;
                let detected_names = get_names(copied_string.clone());
                let detected_dates = get_dates(copied_string.clone());
                window
                    .emit(
                        "list-updated",
                        Payload {
                            count: ct.into(),
                            message: copied_string.into(),
                            current_window: screen.into(),
                            process: proc.into(),
                            names_detected: detected_names,
                            dates_detected: detected_dates
                        },
                    )
                    .unwrap();

                println!("event emitted from rust");
            }
            std::thread::sleep(delay);
        }
    });
}

pub fn main() {
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
        .invoke_handler(tauri::generate_handler![init_process])
        .setup(|app| {
            // listen to the `event-name` (emitted on any window)

            let main_window = app.get_window("main").unwrap();
            clipboard_listener_service(main_window);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
