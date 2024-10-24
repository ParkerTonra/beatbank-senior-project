import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { BeatCollection } from "./../bindings";
import { Link } from 'react-router-dom';
import DroppableCollection from "./DroppableCollection";

interface SidebarProps {
  collections: BeatCollection[];
  onAddBeatToCollection: (collectionId: number, beatId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collections,
}) => {
  const [title, setTitle] = useState("");
  const [beatCollections, setBeatCollections] = useState<BeatCollection[]>(collections);

  useEffect(() => {
    console.log("Received collections:", collections);
    setBeatCollections(collections);
  }, [collections]);

  async function handleNewBeatCollection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim()) {
      try {
        const newCollection: BeatCollection = await invoke("new_beat_collection", {
          setName: title.trim(),
        });
        console.log("New beat collection created:", newCollection);
        setBeatCollections([...beatCollections, newCollection]);
        setTitle(""); // Clear the input after successful creation
      } catch (error) {
        console.error("Error creating new beat collection:", error);
      }
    } else {
      console.warn("Please enter a valid title for the new set");
    }
  }

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Beat Collections</h2>
      <form onSubmit={handleNewBeatCollection} className="mb-4">
        <input
          type="text"
          placeholder="Enter a name for a new set"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border border-gray-600 bg-gray-700 text-white rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200"
        >
          Add New Set
        </button>
      </form>
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">My sets:</h3>
        <ul className="space-y-2">
          <li className="block w-full text-left p-2 bg-gray-500 py-4 hover:bg-gray-600 rounded h-12 items-center justify-start">
            <Link to="/">
              All Beats
            </Link>
          </li>
          {beatCollections.map((collection) => (
            <DroppableCollection
              key={collection.id}
              collection={collection}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
