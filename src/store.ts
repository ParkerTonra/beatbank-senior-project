import { invoke } from '@tauri-apps/api/tauri';

interface Settings {
  theme: string;
}

export async function loadSettings(config: any): Promise<Settings> {
  return await invoke('load_settings', { config });
}

export async function saveSettings(config: any, settings: Settings): Promise<void> {
  await invoke('save_settings', { config, settings });
}

export async function getSettingsPath(config: any): Promise<string> {
  return await invoke('get_settings_path', { config });
}
