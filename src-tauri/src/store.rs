/*
 * store.rs
 *
 * This module manages user settings for the application. It includes functions to
 * load, save, and retrieve the settings file path, ensuring default settings are
 * created if the settings file doesn't exist.
 *
 * Functions:
 * - resolve_project_root_path: Constructs the path for the settings file, ensuring
 *   the directory exists.
 * - load_settings: Loads user settings from settings.json or creates the file with
 *   default settings if it doesn't exist.
 * - save_settings: Saves user settings to settings.json.
 * - get_settings_path: Returns the path to the settings.json file.
 *
 */

use serde::{Deserialize, Serialize};
use std::fs::{self, read_to_string, write};
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct Settings {
    theme: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            theme: "light".to_string(),
        }
    }
}

// TODO: update path to appropiate location on all os. For example: %APPDATA% on windows.
// Constructs path to settings.json, and creates the directory if necessary.
// Currently points inside app to easily deal with different operating systems.
fn resolve_project_root_path(file_name: &str) -> PathBuf {
    let base_dir = std::env::current_dir()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();
    let settings_path = base_dir.join(file_name);
    if !settings_path.parent().unwrap().exists() {
        fs::create_dir_all(settings_path.parent().unwrap()).expect("Failed to create directory");
    }
    settings_path
}

// Loads user settings from settings.json or creates one with the default settings if none exist
#[tauri::command]
pub async fn load_settings() -> Result<Settings, String> {
    let settings_path = resolve_project_root_path("settings.json");

    if !settings_path.exists() {
        // File doesn't exist, create it with default settings
        let default_settings = Settings::default();
        let contents = serde_json::to_string(&default_settings).unwrap();
        write(&settings_path, contents).expect("Failed to create settings file");
    }

    match read_to_string(settings_path) {
        Ok(contents) => Ok(serde_json::from_str(&contents).unwrap_or_default()),
        Err(_) => Ok(Settings::default()),
    }
}

// Saves user settings to settings.json using the settings_path
#[tauri::command]
pub async fn save_settings(settings: Settings) -> Result<(), String> {
    let settings_path = resolve_project_root_path("settings.json");
    let contents = serde_json::to_string(&settings).unwrap();
    write(settings_path, contents).map_err(|e| e.to_string())
}

// Returns the path to the settings.json file
#[tauri::command]
pub async fn get_settings_path() -> Result<String, String> {
    let settings_path = resolve_project_root_path("settings.json");
    Ok(settings_path.to_string_lossy().into_owned())
}
