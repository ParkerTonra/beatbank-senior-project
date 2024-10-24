// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio_analysis;
mod db;
mod models;
mod schema;
mod store;
use diesel::prelude::*;
use serde_json;
use std::{
    env,
    path::Path,
    sync::{Arc, Mutex},
};

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

    beats
        .load::<Beat>(conn)
        .map_err(|e| e.to_string())
        .and_then(|beats_result| serde_json::to_string(&beats_result).map_err(|e| e.to_string()))
}

#[tauri::command]
fn fetch_column_vis() -> String {
    println!("Fetching column visibility...");
    String::from("{}")
}

#[tauri::command]
fn add_beat(state: State<AppState>, file_path: String) -> Result<String, String> {
    let file_name = Path::new(&file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .and_then(|name| name.rsplitn(2, '.').nth(1)) // Split from the end, get the part before the last period
        .unwrap_or("Unknown")
        .to_string();

    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;

    // Store the inserted beat result
    let inserted_beat =
        db::add_beat(&mut *conn, &file_name, &file_path).map_err(|e| e.to_string())?;

    println!("New beat added with id: {}", inserted_beat.id);

    // Analyze and update the beat synchronously
    analyze_and_update_beat(inserted_beat.id, file_path.clone(), conn)?;

    Ok(format!("New beat added with id: {}", inserted_beat.id))
}

fn analyze_and_update_beat(
    beat_id: i32, 
    file_path: String, 
    conn: &mut diesel::SqliteConnection // Pass connection as mutable reference
) -> Result<(), String> {
    use crate::audio_analysis::analyze_audio;

    println!("Starting analysis for file: {}", file_path);

    // Check if the connection works before running analysis
    if diesel::select(diesel::dsl::sql::<diesel::sql_types::Integer>("1"))
        .load::<i32>(conn)
        .is_err()
    {
        println!("Database connection test failed");
        return Err("Connection check failed".into());
    }
    println!("Connection check passed");

    //Call your Python analysis function
    match analyze_audio(&file_path) {
        Ok((key, tempo)) => {
            println!("Analysis Result: Key: {}, Tempo: {}", key, tempo); // Debug output
            let musical_key_str = key.to_string(); // Ensure key is a String

            // Update the database
            diesel::update(crate::schema::beats::dsl::beats.find(beat_id))
                .set((
                    crate::schema::beats::dsl::musical_key.eq(Some(musical_key_str)),
                    crate::schema::beats::dsl::bpm.eq(Some(tempo)),
                ))
                .execute(conn)
                .map_err(|e| {
                    println!("Error updating beat: {:?}", e); // Log the error
                    e.to_string()
                })?;
        }
        Err(e) => {
            println!("Failed to analyze audio. Error: {}", e); // Log the error
            return Err(e.to_string()); // Return the error as a Result
        }
    }

    Ok(())
}

#[tauri::command]
fn delete_beat(id: i32, state: State<AppState>) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::delete_beat(&mut *conn, id).map_err(|e| e.to_string())?;
    Ok(())
}
use crate::models::BeatChangeset;
#[tauri::command]
fn update_beat(beat: BeatChangeset, state: State<AppState>) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;

    db::update_beat(conn, beat)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_row_order(row_order: Vec<models::RowOrder>, state: State<AppState>) -> Result<(), String> {
    let mut conn_guard = state.conn.lock().map_err(|e| e.to_string())?;
    let conn = &mut conn_guard.conn;
    db::save_row_order(conn, row_order).map_err(|e| e.to_string())
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
    )
    .map_err(|e| e.to_string())?;
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

    beat_collection
        .load::<BeatCollection>(&mut *conn)
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
            update_beat,
            fetch_column_vis, 
            new_beat_collection, 
            fetch_collections,
            delete_beat_collection,
            add_beat_to_collection,
            get_beat_collection,
            get_beats_in_collection,
            save_row_order,
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