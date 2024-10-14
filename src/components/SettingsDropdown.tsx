import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Settings } from "lucide-react";
import { invoke } from "@tauri-apps/api";
import { BeatCollection } from "../bindings";

interface SettingsDropdownProps {
  sets: BeatCollection[];
  onAddToCollection: (collectionId: number) => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  sets,
  onAddToCollection,
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
    onAddToCollection(collectionId);
    setIsOpen(false);
    setIsSubMenuOpen(false);
  };

  const handleQuit = async () => {
    await invoke("quit_app");
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-white font-bold py-2 px-2 rounded flex items-center bg-blue-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-600"
      >
        <Settings size={20} />
        Add to collection
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
              <span>Add to Set</span>
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
                        onClick={() => handleAddToSet(set)}
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