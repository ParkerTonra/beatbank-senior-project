import { useEffect, useState } from "react";
import { Beat, BeatCollection } from "./bindings";
import Sidebar from "./components/Sidebar";
import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import UploadBeat from "./components/UploadBeat";
import BeatTable from "./components/BeatTable";
import { SunIcon } from "lucide-react";
import { useBeats } from "./hooks/useBeats";
import { loadSettings, saveSettings, getSettingsPath } from './store';
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { invoke } from "@tauri-apps/api/tauri";
import { message } from "@tauri-apps/api/dialog";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SettingsDropdown from "./components/SettingsDropdown";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
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
      fetchData(); // Refresh data or update state as needed
    } catch (error) {
      console.error('Error adding beat to collection:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag End Event:', event);
    const { active, over } = event;

    if (!over) {
      console.log('Dropped outside any droppable area');
      return;
    }

    const activeType = active.data.current?.type;
    const activeBeatId = active.data.current?.beatId;
    const overId = over.id.toString();

    console.log('Active ID:', active.id);
    console.log('Active Data:', active.data.current);
    console.log('Over ID:', over.id);

    if (overId.startsWith('collection-') && activeType === 'beat') {
      const collectionId = parseInt(overId.replace('collection-', ''), 10);
      handleAddToCollection(collectionId, activeBeatId);
    } else if (overId.startsWith('beat-') && activeType === 'beat') {
      const oldIndex = beats.findIndex((beat) => `beat-${beat.id}` === active.id.toString());
      const newIndex = beats.findIndex((beat) => `beat-${beat.id}` === overId);

      if (oldIndex !== newIndex) {
        const newBeats = arrayMove(beats, oldIndex, newIndex);
        setBeats(newBeats);
      }
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Router>
      
        <div className="flex h-screen bg-gray-100">
          <Sidebar collections={beatCollections} onAddBeatToCollection={handleAddToCollection} onDrop={handleDrop} handleDragEnd={handleDragEnd} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-600 p-6">
              <h1 className="text-3xl font-bold mb-6">Welcome to Beatbank!</h1>
              {/* debug info */}


              <div className="flex justify-center gap-8">
                <div className="flex flex-row">
                  <SettingsDropdown sets={beatCollections} handleAddToCollBtnClick={handleAddToCollBtnClick} selectedBeat={selectedBeat} />

                  

                </div>

                <button onClick={handleThemeChange}>
                  <div className="flex-row items-center justify-center w-52">
                    <div className="flex items-center text-center justify-center">
                      <SunIcon className="h-6 w-6 justify-center mr-2" /> 
                      Toggle Theme
                    </div>
                    <div className="flex justify-center text-sm italic">
                      current: {theme}
                    </div>
                  </div>
                </button>
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
      
    </Router>
    </DndContext>
  );
}

export default App;
