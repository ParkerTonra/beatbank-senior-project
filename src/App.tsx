import { useEffect, useState } from "react";
import { Beat } from "./bindings";
import Sidebar from "./components/Sidebar";
import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import UploadBeat from "./components/UploadBeat";
import BeatTable from "./components/BeatTable";
import { useBeats } from "./hooks/useBeats";

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const {
    beats,
    beatCollections,
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

  const handleBeatSelection = (beat: Beat) => {
    console.log("beat selected:", beat);
    setSelectedBeat(beat);
  };

  console.log("beatCollections:", beatCollections);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen">Error: {error.message}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collections={beatCollections} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-600 p-6">
          <h1 className="text-3xl font-bold mb-6">Welcome to Beatbank!</h1>
          <UploadBeat fetchData={fetchData} selectedBeat={selectedBeat} />
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
        </main>
      </div>
    </div>
  );
}

export default App;