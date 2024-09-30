import { useCallback, useEffect, useState } from "react";
import { Beat } from "./bindings";

import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import UploadBeat from "./components/UploadBeat";
import BeatTable from "./components/BeatTable";
import { useBeats } from "./hooks/useBeats";

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [playThisBeat, setPlayThisBeat] = useState<Beat | null>(null);



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

  if (showSplashScreen) {
    return <SplashScreen closeSplashScreen={() => setShowSplashScreen(false)} />;
  }

  const handleBeatsChange = (newBeats: Beat[]) => {
    setBeats(newBeats);
  };

  const handleBeatPlay = (beat: Beat) => {
    setPlayThisBeat(beat);
  };

  const handleBeatSelection = (beat: Beat) => {
    console.log("beat selected:", beat);
    setSelectedBeat(beat);
  };

  // const triggerRefresh = useCallback(() => {
  //   console.log("triggerRefresh");
  //   setRefresh(prev => !prev);
  // }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <h1>Welcome to Beatbank!</h1>
      <UploadBeat fetchData={fetchData}/>
      <BeatTable
        beats={beats}
        onBeatPlay={handleBeatPlay}
        onBeatSelect={handleBeatSelection}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        selectedBeat={selectedBeat}
        setSelectedBeat={setSelectedBeat}
        // onTriggerRefresh={triggerRefresh}
        onBeatsChange={handleBeatsChange}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
      
    </div>
  );
}

export default App;