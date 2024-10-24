import { DragOverlay } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GhostRow from './GhostDragRow';
import { Beat } from '../bindings';

interface RowDragHandleCellProps {
  row: Beat;
}

export const RowDragHandleCell: React.FC<RowDragHandleCellProps> = ({ row }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sortable-${row.id}`, // Unique ID for sortable handle
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <>
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-transparent playback-control"
      style={style}
    >
      ≡
    </button>
    
      {isDragging && (
      <DragOverlay>
        <GhostRow title={row.title} />
      </DragOverlay>
    )}
    </>
    
    
  );
};

export default RowDragHandleCell
