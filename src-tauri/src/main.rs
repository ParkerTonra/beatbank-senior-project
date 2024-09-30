// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod schema;

use diesel::prelude::*;
use models::NewBeat;
use serde_json;
use std::{env, sync::Mutex};
use tauri::State;
use crate::models::Beat;
use crate::schema::beats;

// Struct to hold the Database connection
struct AppState {
    conn: Mutex<SqliteConnection>,
}


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_beats(state: State<AppState>) -> Result<String, String> {
    let mut conn = state.conn.lock().unwrap();
    match get_all_beats(&mut *conn) {
        Ok(beats) => serde_json::to_string(&beats).map_err(|e| e.to_string()),
        Err(e) => Err(e.to_string()),
    }
}

fn get_all_beats(conn: &mut SqliteConnection) -> QueryResult<Vec<Beat>> {
    use crate::schema::beats::dsl::*;
    beats.load::<Beat>(conn)
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

fn main() {
    println!("Starting beatbank...");

    let conn = db::establish_connection();
    println!("Connection established!");

    let app_state = AppState {
        conn: Mutex::new(conn),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![greet, fetch_beats, add_beat, delete_beat,fetch_column_vis])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}