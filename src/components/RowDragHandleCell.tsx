import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RowDragHandleCellProps {
  rowId: string;
}

export const RowDragHandleCell: React.FC<RowDragHandleCellProps> = ({ rowId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sortable-${rowId}`, // Unique ID for sortable handle
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-transparent playback-control"
      style={style}
    >
      ≡
    </button>
  );
};

export default RowDragHandleCell
