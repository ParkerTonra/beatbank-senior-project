import { useDraggable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, Row } from '@tanstack/react-table';
import { Beat } from '../bindings';
import GhostRow from './GhostDragRow'; // Import the GhostRow component

interface DraggableRowProps {
  row: Row<Beat>;
  onRowSelection: (beat: Beat) => void;
}

function DraggableRow({ row, onRowSelection }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `beat-${row.original.id}`,
    data: {
      type: 'beat',
      beat: row.original, // Including beat in the drag data
    },
  });


  return (
    <>
      <tr
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => onRowSelection(row.original)}
        className={`cursor-pointer ${row.getIsSelected() ? 'bg-gray-400' : ''}`}
      >
        {/* Render the row cells */}
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="whitespace-nowrap">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>

      {/* Drag overlay for showing the GhostRow */}
      {isDragging && (
        <DragOverlay>
          <GhostRow title={row.original.title} />
        </DragOverlay>
      )}
    </>
  );
}

export default DraggableRow;
