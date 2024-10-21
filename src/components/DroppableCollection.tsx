import { useDroppable, useDndContext } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { BeatCollection } from '../bindings';

interface DroppableCollectionProps {
  collection: BeatCollection;
  onAddBeatToCollection: (collectionId: number, beatId: number) => void;
}

const DroppableCollection: React.FC<DroppableCollectionProps> = ({ collection, onAddBeatToCollection }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `collection-${collection.id}`,
  });

  const { active } = useDndContext();

  const style = {
    backgroundColor: isOver ? 'lightblue' : 'grey',
  };

  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    if (active) {
      // A drag is in progress; prevent navigation
      return;
    }
    navigate(`/collection/${collection.id}`);
  };

  return (
    <li
      ref={setNodeRef}
      onClick={handleClick}
      style={style}
      className={`bg-gray-700 p-2 rounded hover:bg-gray-600 transition duration-200 cursor-pointer ${
        isOver ? 'border-2 border-green-500' : ''
      }`}
    >
      {collection.set_name}
    </li>
  );
};

export default DroppableCollection;