import { useDroppable } from "@dnd-kit/core";
import { BeatCollection } from "../bindings";
import { Link } from 'react-router-dom';

interface DroppableCollectionProps {
  collection: BeatCollection;
  onAddBeatToCollection: (collectionId: number, beatId: number) => void;
}


const DroppableCollection: React.FC<DroppableCollectionProps> = ({ collection, onAddBeatToCollection }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `collection-${collection.id}`,
  });

  return (
    <li 
      ref={setNodeRef}
      className={`bg-gray-700 p-2 rounded hover:bg-gray-600 transition duration-200 cursor-pointer ${
        isOver ? 'border-2 border-green-500' : ''
      }`}
    >
      <Link to={`/collection/${collection.id}`}>
        {collection.set_name}
      </Link>
    </li>
  );
};

export default DroppableCollection;