import { useSortable } from '@dnd-kit/sortable';


interface RowDragHandleCellProps {
  rowId: string;
}

export const RowDragHandleCell = ({ rowId }: RowDragHandleCellProps) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: rowId,
  });


  return (
    <button ref={setNodeRef} {...attributes} {...listeners} className="bg-transparent playback-control">
      ≡
    </button>
  );
};

export default RowDragHandleCell;