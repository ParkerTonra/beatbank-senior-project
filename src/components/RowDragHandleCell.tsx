import { useSortable } from '@dnd-kit/sortable';

interface RowDragHandleCellProps {
  rowId: string;
}

export const RowDragHandleCell: React.FC<RowDragHandleCellProps> = ({ rowId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: rowId,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-transparent playback-control"
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
    >
      ≡
    </button>
  );
};

export default RowDragHandleCell;