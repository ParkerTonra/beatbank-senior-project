import { useEffect, useState } from "react";
import { Beat, BeatCollection } from "./bindings";
import Sidebar from "./components/Sidebar";
import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import UploadBeat from "./components/UploadBeat";
import BeatTable from "./components/BeatTable";
import BeatColl from "./routes/BeatCollection";
import { useBeats } from "./hooks/useBeats";
import { loadSettings, saveSettings, getSettingsPath } from './store';
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { invoke } from "@tauri-apps/api/tauri";
import { message } from "@tauri-apps/api/dialog";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SettingsDropdown from "./components/SettingsDropdown";
import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import BeatCollTable from "./components/BeatCollection";

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [theme, setTheme] = useState<string>('light');
  const [settingsPath, setSettingsPath] = useState<string>('');


  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag end event:", event);
    const { active, over } = event;

    if (active && over) {
      console.log("Active:", active);
      console.log("Over:", over);
      
      if (over.id && typeof over.id === 'string' && over.id.startsWith('collection-')) {
        const beatId = Number(active.id);
        const collectionId = Number(over.id.split('-')[1]);
        console.log(`Attempting to add beat ${beatId} to collection ${collectionId}`);
        handleAddToCollection(collectionId, beatId);
      } else {
        // Handle sorting within the table
        const oldIndex = beats.findIndex(beat => beat.id === beatId);
        const newIndex = beats.findIndex(beat => beat.id === Number(over.id));

        if (oldIndex !== newIndex) {
          const newBeats = arrayMove(beats, oldIndex, newIndex);
          setBeats(newBeats);
        }
      }
    }
  };

  const handleAddToCollBtnClick = async (collectionId: number) => {
    console.log("handleAddToCollBtnClick:", collectionId);
    if (!selectedBeat) {
      message('Please select a beat first.', { title: 'Error', type: 'error' });
      return;
    }
    let beatId = selectedBeat.id;
    console.log("Current beat id:", beatId, "current set id:", collectionId);
    await invoke('add_beat_to_collection', { beatId, collectionId });
    // Refresh data or update state as needed
    fetchData();
  };

  const handleAddToCollection = async (collectionId: number, beatId: number) => {
    try {
      console.log(`Adding beat ${beatId} to collection ${collectionId}`);
      await invoke('add_beat_to_collection', { beatId, collectionId });
      // Refresh data or update state as needed
      fetchData();
    } catch (error) {
      console.error('Error adding beat to collection:', error);
    }
  };

  //TODO: audio player
  // const [playThisBeat, setPlayThisBeat] = useState<Beat | null>(null);

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

  const [collections, setCollections] = useState<BeatCollection[]>(beatCollections);

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

  const handleDrop = (collectionId: number, beatId: number) => {
    console.log("handleDrop:", collectionId, beatId);
    //commitToCollection(beatId, collectionId);
  }

  const handleBeatSelection = (beat: Beat) => {
    console.log("beat selected:", beat);
    setSelectedBeat(beat);
  };

  console.log("beatCollections:", beatCollections);

  if (error) return <div className="flex items-center justify-center h-screen">Error: {error.message}</div>;

  return (
    <Router>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar collections={beatCollections} onAddBeatToCollection={handleAddToCollection} onDrop={handleDrop} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-600 p-6">
              <h1 className="text-3xl font-bold mb-6">Welcome to Beatbank!</h1>
              {/* debug info */}
              <h2>Current Theme: {theme}</h2>
              <h2>Selected Beat : {selectedBeat ? selectedBeat.title : 'None'}</h2>
              <SettingsDropdown sets={beatCollections} handleAddToCollBtnClick={handleAddToCollBtnClick} />
              <div className="w-full flex justify-center">
            <button onClick={handleThemeChange}>Toggle Theme</button>
              </div>
          <UploadBeat fetchData={fetchData} selectedBeat={selectedBeat} />
              <SortableContext items={beats.map(beat => beat.id.toString())} strategy={verticalListSortingStrategy}>
                <Routes>
                  {/* default route for main beat table */}
                  <Route
                    path="/"
                    element={
                      <BeatTable
                        beats={beats}
                        onBeatSelect={handleBeatSelection}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        selectedBeat={selectedBeat}
                        setSelectedBeat={setSelectedBeat}
                        fetchData={fetchData}
                        onBeatsChange={handleBeatsChange}
                        onAddBeatToCollection={handleAddToCollection}
                        columnVisibility={columnVisibility}
                        setColumnVisibility={setColumnVisibility}
                        onDragEnd={handleDragEnd}
                      />
                    }
                  />

                  <Route
                    path="/collection/:id"
                    element={<BeatCollTable />}
                  />


                </Routes>

              </SortableContext>
            </main>
          </div>
        </div>
        <DragOverlay>{/* Render dragged item */}</DragOverlay>
      </DndContext>
    </Router>
  );
}

export default App;
