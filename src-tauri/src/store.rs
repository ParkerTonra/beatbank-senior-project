use tauri::api::path::app_config_dir;
use tauri::api::file::read_string;
use serde::{Deserialize, Serialize};
use tauri::{Config, AppHandle};
use std::fs::write;

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

#[tauri::command]
pub async fn load_settings(config: Config) -> Result<Settings, String> {
    let settings_path = app_config_dir(&config).unwrap().join("settings.json");
    match read_string(settings_path) {
        Ok(contents) => Ok(serde_json::from_str(&contents).unwrap_or_default()),
        Err(_) => Ok(Settings::default()),
    }
}

#[tauri::command]
pub async fn save_settings(config: Config, settings: Settings) -> Result<(), String> {
    let settings_path = app_config_dir(&config).unwrap().join("settings.json");
    let contents = serde_json::to_string(&settings).unwrap();
    write(settings_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_settings_path(config: Config) -> Result<String, String> {
    let settings_path = app_config_dir(&config).unwrap().join("settings.json");
    Ok(settings_path.to_string_lossy().into_owned())
}
