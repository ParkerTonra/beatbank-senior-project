// src-tauri/src/main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod schema;
mod store;
use diesel::prelude::*;
use serde_json;
use std::{env, sync::Mutex};

use tauri::State;
use crate::models::{Beat, BeatCollection};
use tauri::{State, generate_context, generate_handler};

struct AppState {
    conn: Mutex<SqliteConnection>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_beats(state: State<AppState>) -> Result<String, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    use crate::schema::beats::dsl::*;
    
    beats.load::<Beat>(&mut *conn)
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
    title: String,
    file_path: String,
) -> Result<String, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    match db::add_beat(&mut *conn, &title, &file_path) {
        Ok(new_beat) => {
            println!("New beat added with id: {}", new_beat.id);
            Ok(format!("New beat added with id: {}", new_beat.id))
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn delete_beat(id: i32, state: State<AppState>) -> Result<(), String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
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
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
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
fn delete_beat_collection(state: State<AppState>, id: i32) -> Result<(), String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_beat_collection(&mut *conn, id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn fetch_collections(state: State<AppState>) -> Result<String, String> {
println!("Fetching collections...");
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    use crate::schema::beat_collection::dsl::*;
    
    beat_collection.load::<BeatCollection>(&mut *conn)
        .map_err(|e| e.to_string())
        .and_then(|beats_result| serde_json::to_string(&beats_result).map_err(|e| e.to_string()))
}

fn main() {
    println!("Starting beatbank...");

    let conn = db::establish_connection();
    println!("Connection established!");

    let app_state = AppState {
        conn: Mutex::new(conn),
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
            store::load_settings, 
            store::save_settings, 
            store::get_settings_path
            ])
        .run(tauri::generate_context!())

        .expect("error while running tauri application");
}
