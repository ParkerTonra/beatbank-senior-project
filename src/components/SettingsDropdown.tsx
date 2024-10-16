import { useState, useRef, useEffect } from "react";
import { ChevronRight, Settings } from "lucide-react";
import { invoke } from "@tauri-apps/api";
import { Beat, BeatCollection } from "../bindings";
import EditBeatCard from "./EditBeatCard";

interface SettingsDropdownProps {
  sets: BeatCollection[];
  handleAddToCollBtnClick: (collectionId: number) => void;
  selectedBeat: Beat | null;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  sets,
  handleAddToCollBtnClick,
  selectedBeat
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleAddToSet = (collectionId: number) => {
    handleAddToCollBtnClick(collectionId);
    setIsOpen(false);
    setIsSubMenuOpen(false);
  };

  const handleQuit = async () => {
    await invoke("quit_app");
  };

  //opens up EditBeatCard as a popup
  const handleEditBeat = async () => {
    if (!selectedBeat) {
      console.log("No beat selected");
      return;
    }
    return (<EditBeatCard beat={selectedBeat} onClose={() => setIsOpen(false)} onSave={handleEditBeat}
      
        />);
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>      <button
      onClick={toggleDropdown}
      className="flex-row text-white font-bold rounded items-center bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-600"
    >
      <div className="flex gap-2 items-center justify-center">
        <Settings size={20} />
        Track Settings

      </div>
      <div className="text-sm justify-center italic w-52 whitespace-nowrap overflow-hidden text-ellipsis">
  selected: <span>{selectedBeat ? selectedBeat.title : 'None'}</span>
</div>

      {/* <h2>Selected Beat : {selectedBeat ? selectedBeat.title : 'None'}</h2> */}
    </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{ zIndex: 1000 }}
        >
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex justify-between items-center cursor-pointer relative"
              onMouseEnter={() => setIsSubMenuOpen(true)}
              onMouseLeave={() => setIsSubMenuOpen(false)}
            >
              <span>Add Beat to Set</span>
              <ChevronRight size={16} />
              {isSubMenuOpen && (
                <div
                  className="absolute left-full top-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  style={{ zIndex: 1001 }}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                        onClick={() => handleAddToSet(set.id)}
                      >
                        {set.set_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              onClick={handleEditBeat}
            >
              Edit Beat
            </div>
            <div
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              onClick={handleQuit}
            >
              Quit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;