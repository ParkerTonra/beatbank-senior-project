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
  //TODO: audio player
  // const [playThisBeat, setPlayThisBeat] = useState<Beat | null>(null);

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
      const settings = await loadSettings(); // Load settings from the backend
      setTheme(settings.theme); // Update the theme state with the loaded settings

      const path = await getSettingsPath(); // Fetch and log the settings path
      console.log("Settings path:", path);
      setSettingsPath(path); // Update the state to display the settings path
    };

    fetchSettings(); // Invoke the fetchSettings function when the component mounts
  }, []); // Empty dependency array ensures this runs only once

  // Define a function to handle theme changes
  const handleThemeChange = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'; // Toggle between light and dark themes
    setTheme(newTheme); // Update the theme state

    await saveSettings({ theme: newTheme }); // Save the new theme settings to the backend
    console.log("Theme changed to:", newTheme); // Log the new theme for debugging purposes
  };


  if (showSplashScreen) {
    return <SplashScreen closeSplashScreen={() => setShowSplashScreen(false)} />;
  }

  const handleBeatsChange = (newBeats: Beat[]) => {
    setBeats(newBeats);
  };

  // TODO: audio player
  // const handleBeatPlay = (beat: Beat) => {
  //   setPlayThisBeat(beat);
  // };

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
        //onBeatPlay={handleBeatPlay}
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
    </div>
  );
}

export default App;
