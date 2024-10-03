import { useEffect, useState } from "react";
import { Beat } from "./bindings";

import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import UploadBeat from "./components/UploadBeat";
import BeatTable from "./components/BeatTable";
import { useBeats } from "./hooks/useBeats";
import { loadSettings, saveSettings, getSettingsPath } from './store';

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [theme, setTheme] = useState<string>('light'); 
  const [settingsPath, setSettingsPath] = useState<string>(''); 

  const {
    beats,
    fetchData,
    columnVisibility,
    loading,
    error,
    setBeats,
    setColumnVisibility,
  } = useBeats();
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const config = { /* your config settings */ };
      const settings = await loadSettings(config); 
      setTheme(settings.theme); 

      const path = await getSettingsPath(config); 
      console.log("Settings path:", path); 
      setSettingsPath(path);
    };
    fetchSettings();
  }, []);

  const handleThemeChange = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'; 
    setTheme(newTheme); 

    const config = { /* your config settings */ };
    await saveSettings(config, { theme: newTheme }); 
    console.log("Theme changed to:", newTheme); 
  };

  if (showSplashScreen) {
    return <SplashScreen closeSplashScreen={() => setShowSplashScreen(false)} />;
  }

  const handleBeatsChange = (newBeats: Beat[]) => {
    setBeats(newBeats);
  };

  const handleBeatSelection = (beat: Beat) => {
    console.log("beat selected:", beat);
    setSelectedBeat(beat);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <h1>Welcome to Beatbank!</h1>
      <h2>Current Theme: {theme}</h2> 
      <button onClick={handleThemeChange}>Toggle Theme</button>
      <UploadBeat fetchData={fetchData} selectedBeat={selectedBeat}/>
      <BeatTable
        beats={beats}
        onBeatSelect={handleBeatSelection}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        selectedBeat={selectedBeat}
        setSelectedBeat={setSelectedBeat}
        fetchData={fetchData}
        onBeatsChange={handleBeatsChange}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
      <div>Settings Path: {settingsPath}</div> 
    </div>
  );
}

export default App;
