import { useDroppable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { BeatCollection } from '../bindings';
import { useEffect } from 'react';

interface DroppableCollectionProps {
  collection: BeatCollection;
  onAddBeatToCollection: (collectionId: number, beatId: number) => void;
}

const DroppableCollection: React.FC<DroppableCollectionProps> = ({ collection, onAddBeatToCollection }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `collection-${collection.id}`,
  });

  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    // Prevent navigation if a drag is in progress
    if (event.defaultPrevented) {
      return;
    }
    navigate(`/collection/${collection.id}`);
  };


  return (
    <li
      ref={setNodeRef}
      onClick={handleClick}
      className={`bg-gray-700 p-2 rounded hover:bg-gray-600 transition duration-200 cursor-pointer ${
        isOver ? 'border-2 border-green-500' : ''
      }`}
    >
      {collection.set_name}
    </li>
  );
};

export default DroppableCollection;
