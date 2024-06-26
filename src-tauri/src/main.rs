#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


mod db;
use crate::db::clipboard::ClipboardRepository;
use crate::db::{clipboard::Clipboard};
use active_win_pos_rs::get_active_window;
use cli_clipboard::ClipboardContext;
use cli_clipboard::ClipboardProvider;
use std::thread;
use tauri::{SystemTray};
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, Window};
use std::env;

// static DATABASE_URL: &'static str = "/home/salman/testdb";
#[cfg(target_os = "macos")]
static DATABASE_URL: &str = "./instact.db";
#[cfg(target_os = "linux")]
static DATABASE_URL: &str = "./instact.db";
#[cfg(target_os = "windows")]
static DATABASE_URL: &str = "../instact.db";

fn get_db_url() -> String{
    if(env::consts::OS.eq("windows")){
        let url = format!("C:/Users/{}/.instact/clipboard.db",whoami::username());
        url
    }else{
        let url = DATABASE_URL.to_string();
        url
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    count: i32,
    message: String,
    current_window: String,
    process: String,
}


#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct PaginationPayload{
    page: i32,
    limit: i32,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct PaginationResult{
    count: i32,
    data: Vec<Clipboard>
}

#[tauri::command]
fn get_all_content(page_data: PaginationPayload) -> PaginationResult{
    println!("getting data......");
    let conn = ClipboardRepository{
        path: get_db_url()
    };
    
    let total_data = conn.count_all().unwrap();
    let content = conn.find_all_pagination(page_data.page,page_data.limit);
    match content{
        Ok(content_data) => {
            println!("all data sent!");
            PaginationResult{
                count: total_data,
                data: content_data,
            }
            
        }
        Err(err) =>{
            println!("Error fetching data from repository");
            println!("{}",err);
            PaginationResult {
                count: 0,
                data: vec![],
            }
        }
    }
}

#[tauri::command]
fn delete_all_content(window: Window) -> String{
    let conn = ClipboardRepository{
        path: get_db_url()
    };
    let result = conn.delete_all();
    match result {
        Ok(res) =>{
            window.emit("deleteAll", "content in db has been cleared").unwrap();
            format!("data has been cleared")
        }
        Err(_) => {
            println!("Error deleting from repository");
            format!("Error deleting from repository")
        }
    }
}

fn process_clipboard_data(repo: &ClipboardRepository,copied_string: &String,old_string: String, ct: &mut i32 , window: &Window) -> String{
    if old_string.ne(copied_string) {
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
                *ct += 1;
                // let detected_names = get_names(copied_string.clone());
                // let detected_dates = get_dates(copied_string.clone());
                let data = Clipboard { id: ct.clone(), message: copied_string.into(), current_window: screen.into(), process: proc.into() };
                println!("event emitted from rust");
                repo.add(&data);
                println!("saved to db");
                window
                    .emit(
                        "list-updated",
                       &data
                    )
                    .unwrap();

             
            }
            return String::from(copied_string);
}

fn clipboard_listener_service(window: Window) {
    let conn = ClipboardRepository{
        path: get_db_url()
    };
    conn.init();
    thread::spawn(move || {
        let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();

        let delay = std::time::Duration::from_secs(1);
        let mut old_string: String = String::new();
        let mut ct = Box::new(0);
              
        
        println!("Thread-1 started to listen to clipboard events");
        loop {
            match ctx.get_contents() {
                Ok(cpd_string) => {
                    old_string = process_clipboard_data(&conn,&cpd_string,old_string, &mut *ct ,&window);
                }
                Err(_) => {
                    println!("\nError checking clipboard content\n");
                }
            }
            
            std::thread::sleep(delay);
        }
    
    });
}

#[tauri::command]
fn create_history_window(handle: tauri::AppHandle){
    let docs_window = tauri::WindowBuilder::new(
        &handle,
        "test", /* the unique window label */
        tauri::WindowUrl::App("/history".parse().unwrap())
      ).build();
    match docs_window {
        Ok(success) => {
            println!("Window created ");
        }
        Err(err) => {
            println!("{}",err);
        }
        
    }
}

fn create_windows_directory(){
    println!("Current OS: {}",env::consts::OS);
    if(env::consts::OS.eq("windows")){
        let path = format!("C:/Users/{}/.instact",whoami::username());
        println!("path {}",path);
        match std::fs::create_dir(&path){
            Ok(status) =>{
                println!("directory created successfully");
            }
            Err(_) =>{
                println!("could not create path")
            }
        }
    }
}
pub fn main() {
    create_windows_directory();
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
        .invoke_handler(tauri::generate_handler![create_history_window,get_all_content,delete_all_content])
        .setup(|app| {
            // listen to the `event-name` (emitted on any window)

            let main_window = app.get_window("main").unwrap();
            clipboard_listener_service(main_window);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
