import React from 'react';
import { useDroppable } from "@dnd-kit/core";
import { BeatCollection } from "../bindings";

interface DroppableCollectionProps {
  collection: BeatCollection;
  onDrop: (beatId: number, collectionId: number) => void;
}

const DroppableCollection: React.FC<DroppableCollectionProps> = ({ collection, onDrop }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `collection-${collection.id}`,
  });

  const handleDragOver = (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
    console.log("Drop event:", event);
    event.preventDefault();
    const beatId = event.dataTransfer.getData('text/plain');
    if (beatId) {
      onDrop(parseInt(beatId), collection.id);
    }
  };


  return (
    <li
      ref={setNodeRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-gray-700 p-2 rounded hover:bg-gray-600 transition duration-200 cursor-pointer ${
        isOver ? 'border-2 border-green-500' : ''
      }`}
    >
      {collection.set_name}
    </li>
  );
};

export default DroppableCollection;