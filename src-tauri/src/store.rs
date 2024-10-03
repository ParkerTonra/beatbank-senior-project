use std::path::PathBuf;
use std::fs::{self, write, read_to_string};
use serde::{Deserialize, Serialize};

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

// Adjust the path to be one level up from the src-tauri directory
fn resolve_project_root_path(file_name: &str) -> PathBuf {
    let base_dir = std::env::current_dir().unwrap().parent().unwrap().to_path_buf(); // Move one level up
    let settings_path = base_dir.join(file_name);
    if !settings_path.parent().unwrap().exists() {
        fs::create_dir_all(settings_path.parent().unwrap()).expect("Failed to create directory");
    }
    settings_path
}

#[tauri::command]
pub async fn load_settings() -> Result<Settings, String> {
    let settings_path = resolve_project_root_path("settings.json");
    match read_to_string(settings_path) {
        Ok(contents) => Ok(serde_json::from_str(&contents).unwrap_or_default()),
        Err(_) => Ok(Settings::default()),
    }
}

#[tauri::command]
pub async fn save_settings(settings: Settings) -> Result<(), String> {
    let settings_path = resolve_project_root_path("settings.json");
    let contents = serde_json::to_string(&settings).unwrap();
    write(settings_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_settings_path() -> Result<String, String> {
    let settings_path = resolve_project_root_path("settings.json");
    Ok(settings_path.to_string_lossy().into_owned())
}
