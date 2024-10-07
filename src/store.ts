/*
 * Store.ts
 * 
 * This module manages user settings for the application. It includes functions to
 * load, save, and retrieve the settings file path.
 * 
 * Functions:
 * - loadSettings: Loads user settings from the backend.
 * - saveSettings: Saves user settings to the backend.
 * - getSettingsPath: Retrieves the path to the settings file.
 * 
 */


import { invoke } from '@tauri-apps/api/tauri';

interface Settings {
  theme: string;
}

export async function loadSettings(): Promise<Settings> {
  return await invoke('load_settings');
}

export async function saveSettings(settings: Settings): Promise<void> {
  await invoke('save_settings', { settings });
}

export async function getSettingsPath(): Promise<string> {
  return await invoke('get_settings_path');
}

