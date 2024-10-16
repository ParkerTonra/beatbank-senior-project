// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod schema;
mod store;
mod audio_analysis; // <-- Add this line

use diesel::prelude::*;
use pyo3::PyResult;
use serde_json;
use std::{env, sync::{Mutex}};


use crate::models::{Beat, BeatCollection, NewBeat};
use tauri::{State};

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
    let new_beat = NewBeat {
        title: &title,
        artist: None,
        album: None,
        genre: None,
        year: None,
        track_number: None,
        duration: None,
        composer: None,
        lyricist: None,
        cover_art: None,
        comments: None,
        file_path: &file_path,
        bpm: None,
        musical_key: None,
        date_created: chrono::Utc::now().naive_utc(),
    };
    let inserted_beat: Beat = diesel::insert_into(crate::schema::beats::dsl::beats)
        .values(&new_beat)
        .get_result(&mut *conn)
        .map_err(|e| e.to_string())?;

    // Analyze and update the beat synchronously
    analyze_and_update_beat(inserted_beat.id, file_path.clone(), &mut conn)?;

    Ok(format!("New beat added with id: {}", inserted_beat.id))
}


fn analyze_and_update_beat(
    beat_id: i32,
    file_path: String,
    conn: &mut diesel::SqliteConnection // Pass connection as mutable reference
) -> Result<(), String> {
    use crate::audio_analysis::analyze_audio;

    // Call your Python analysis function
    println!("Starting analysis for file: {}", file_path);
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
fn get_beat_collection(state: State<AppState>, id: i32) -> Result<BeatCollection, String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_beat_collection(&mut *conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_beats_in_collection(state: State<AppState>, id: i32) -> Result<Vec<Beat>, String> {
    println!("getting beats in collection");
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_beats_in_collection(&mut *conn, id).map_err(|e| e.to_string())
    // print the result

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

#[tauri::command]
fn add_beat_to_collection(
    state: State<AppState>,
    collection_id: i32,
    beat_id: i32,
) -> Result<(), String> {
    let mut conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::add_beat_to_collection(&mut *conn, collection_id, beat_id).map_err(|e| e.to_string())?;
    Ok(())
}


#[tauri::command]
async fn analyze_audio_command(file_path: String) -> Result<(String, f64), String> {
    use crate::audio_analysis::analyze_audio;

    // Call your analyze_audio function and handle the result
    match analyze_audio(&file_path) {
        Ok((key, tempo)) => Ok((key.to_string(), tempo)),  // Convert key to String
        Err(e) => Err(e.to_string()),
    }
}

fn setup_python() -> PyResult<()> {
    println!("Starting setup_python");
    // Set the Python path dynamically, if needed
    let current_dir = env::current_dir().expect("Failed to get current directory");
    let src_dir = current_dir.join("src");

    let python_path = format!(
        "{};{}",
        env::var("PYTHONPATH").unwrap_or_default(),
        src_dir.display()
    );

    // Print the Python path for debugging
    println!("Updated Python path: {:?}", python_path);

    // Set the environment variable
    env::set_var("PYTHONPATH", python_path);

    Ok(())
}

fn main() {
    // Initialize the Python interpreter
    pyo3::prepare_freethreaded_python();

    setup_python().expect("Failed to setup Python");
    println!("Python setup");


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
            add_beat_to_collection,
            get_beat_collection,
            get_beats_in_collection,
            store::load_settings,
            store::save_settings, 
            store::get_settings_path,
            analyze_audio_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

