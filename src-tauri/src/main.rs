// src-tauri/src/main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod schema;
mod store;
use diesel::prelude::*;
use serde_json;
use std::{env, path::Path, sync::{Arc, Mutex}};

use crate::models::{Beat, BeatCollection};
use tauri::{Manager, State};

struct DatabaseConnection {
    conn: SqliteConnection,
}

impl Drop for DatabaseConnection {
    fn drop(&mut self) {
        // Optimize the database before closing
        diesel::sql_query("PRAGMA optimize")
            .execute(&mut self.conn)
            .ok();
        println!("Database connection cleaned up");
    }
}

struct AppState {
    conn: Arc<Mutex<DatabaseConnection>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_beats(state: State<AppState>) -> Result<String, String> {    
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    use crate::schema::beats::dsl::*;
    
    beats.load::<Beat>(conn)
        .map_err(|e| e.to_string())
        .and_then(|beats_result| serde_json::to_string(&beats_result).map_err(|e| e.to_string()))
}

#[tauri::command]
fn fetch_column_vis() -> String {
    println!("Fetching column visibility...");
    String::from("{}")
}

#[tauri::command]
fn add_beat(
    state: State<AppState>,
    file_path: String,
) -> Result<String, String> {
    let file_name = Path::new(&file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .and_then(|name| name.rsplitn(2, '.').nth(1)) // Split from the end, get the part before the last period
        .unwrap_or("Unknown")
        .to_string();

        let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
        let conn = &mut conn_guard.conn;
        match db::add_beat(&mut *conn, &file_name, &file_path) {
        Ok(new_beat) => {
            println!("New beat added with id: {}", new_beat.id);
            Ok(format!("New beat added with id: {}", new_beat.id))
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn delete_beat(id: i32, state: State<AppState>) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::delete_beat(&mut *conn, id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn new_beat_collection(
    state: State<AppState>,
    set_name: String,
    venue: Option<String>,
    city: Option<String>,
    state_name: Option<String>,
    date_played: Option<String>,
    date_created: Option<String>,
) -> Result<BeatCollection, String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    let collection = db::new_beat_collection(
        &mut *conn,
        &set_name,
        venue.as_deref(),
        city.as_deref(),
        state_name.as_deref(),
        date_played.as_deref(),
        date_created.as_deref(),
    ).map_err(|e| e.to_string())?;
    Ok(collection)
}

#[tauri::command]
fn get_beat_collection(state: State<AppState>, id: i32) -> Result<BeatCollection, String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::get_beat_collection(&mut *conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_beats_in_collection(state: State<AppState>, id: i32) -> Result<Vec<Beat>, String> {
    println!("getting beats in collection");
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::get_beats_in_collection(&mut *conn, id).map_err(|e| e.to_string())
    // print the result

}

#[tauri::command]
fn delete_beat_collection(state: State<AppState>, id: i32) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::delete_beat_collection(&mut *conn, id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn fetch_collections(state: State<AppState>) -> Result<String, String> {
println!("Fetching collections...");
let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
let conn = &mut conn_guard.conn;

    
    use crate::schema::beat_collection::dsl::*;
    
    beat_collection.load::<BeatCollection>(&mut *conn)
        .map_err(|e| e.to_string())
        .and_then(|beats_result| serde_json::to_string(&beats_result).map_err(|e| e.to_string()))
}

#[tauri::command]
fn add_beat_to_collection(
    state: State<AppState>,
    collection_id: i32,
    beat_id: i32,
) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::add_beat_to_collection(&mut *conn, collection_id, beat_id).map_err(|e| e.to_string())?;
    Ok(())
}


fn main() {
    println!("Starting beatbank...");

    let conn = DatabaseConnection {
        conn: db::establish_connection(),
    };
    println!("Connection established!");

    let app_state = AppState {
        conn: Arc::new(Mutex::new(conn)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            greet, 
            fetch_beats, 
            add_beat, 
            delete_beat,
            fetch_column_vis, 
            new_beat_collection, 
            fetch_collections,
            delete_beat_collection,
            add_beat_to_collection,
            get_beat_collection,
            get_beats_in_collection,
            store::load_settings, 
            store::save_settings, 
            store::get_settings_path
            ])
        .setup(|app| {
            // Enable foreign keys for SQLite
            let state: State<AppState> = app.state();
            let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
            diesel::sql_query("PRAGMA foreign_keys = ON")
                .execute(&mut conn_guard.conn)
                .map_err(|e| e.to_string())?;
            Ok(())
        })
        .on_window_event(|e| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = e.event() {
                api.prevent_close();
                let window = e.window().clone();
                let app_handle = window.app_handle();
                // Perform cleanup in a separate thread
                std::thread::spawn(move || {
                    println!("Cleaning up before exit...");
                    // Give time for any pending operations to complete
                    std::thread::sleep(std::time::Duration::from_millis(100));
                    app_handle.exit(0);
                });
            }
        })
        .run(tauri::generate_context!())

        .expect("error while running tauri application");
}
