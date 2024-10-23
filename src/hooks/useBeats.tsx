
import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Beat, BeatCollection } from "./../bindings";

const defaultColumnVisibility = {
  title: true,
  bpm: true,
  musical_key: true,
  duration: true,
  artist: false,
  date_added: false,
  file_path: false,
  id: false
};

export const useBeats = () => {
    const [beats, setBeats]: [Beat[], Dispatch<SetStateAction<Beat[]>>] =
    useState<Beat[]>([]);
  const [columnVisibility, setColumnVisibility] = useState(
    defaultColumnVisibility
  );

  const [beatCollections, setBeatCollections]: [BeatCollection[], Dispatch<SetStateAction<BeatCollection[]>>] = useState<BeatCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentCollection, setCurrentCollection] = useState<BeatCollection | null>(null);
  // fetch sets, data, and column visibility for initialization
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching data...");
    try {
      const [beatsResult, columnVisResult, collectionsResult] = await Promise.all([
        invoke<string>("fetch_beats"),
        invoke<string>("fetch_column_vis"),
        invoke<string>("fetch_collections"), 
      ]);

      const myBeats = JSON.parse(beatsResult);
      setBeats(myBeats);

      let columnVis = JSON.parse(columnVisResult);
      if (columnVis && typeof columnVis === "object" && "0" in columnVis) {
        columnVis = columnVis[0];
      }

      setColumnVisibility({ ...defaultColumnVisibility, ...columnVis });


      let myBeatCollections = JSON.parse(collectionsResult);
      setBeatCollections(myBeatCollections);
    } catch (error) {
      setError(error as Error);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSetData = useCallback(async (setId: number) => {
    console.log("Fetching set data...");
    setLoading(true);
    setError(null);
    try {
      // Fetch beat collection data
      const collectionResponse = await invoke<BeatCollection>('get_beat_collection', { id: setId });
      setCurrentCollection(collectionResponse);

      // Fetch beats in the collection
      const beatsResponse = await invoke<Beat[]>('get_beats_in_collection', { id: setId });

      if (Array.isArray(beatsResponse)) {
        setBeats(beatsResponse);
      } else {
        console.error('Unexpected response format for beats:', beatsResponse);
        setError(new Error('Received invalid data format for beats.'));
        setBeats([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(new Error('An error occurred while fetching data.'));
      setBeats([]);
      setCurrentCollection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    beats,
    setBeats,
    columnVisibility,
    setColumnVisibility,
    currentCollection,
    loading,
    error,
    fetchData,
    fetchSetData,
    beatCollections,
  };
};
