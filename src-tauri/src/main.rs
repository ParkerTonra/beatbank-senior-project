// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod models;
pub mod schema;

use crate::models::Beat;
use diesel::prelude::*;
use dotenvy::dotenv;
use serde_json;
use std::env;



#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_beats() -> Result<String, String> {
    let conn = &mut establish_connection();
    match get_all_beats(conn) {
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
    // TODO: Implement fetching column visibility from database
    String::from("{}")
}

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

fn main() {
    println!("Starting beatbank...");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, fetch_beats, fetch_column_vis])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}