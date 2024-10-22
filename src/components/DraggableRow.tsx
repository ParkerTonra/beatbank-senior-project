import { useDraggable } from '@dnd-kit/core';
import { Cell, flexRender, Row } from '@tanstack/react-table';
import { Beat } from '../bindings';
import { CSS } from '@dnd-kit/utilities';

interface DraggableRowProps {
  row: Row<Beat>;
  onRowSelection: (beat: Beat) => void;
}

function DraggableRow({ row, onRowSelection }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `beat-${row.original.id}`, // Unique ID for draggable beat
    data: {
      type: 'beat',
      beat: row.original,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners} // Apply draggable attributes
      onClick={() => onRowSelection(row.original)}
      className={`cursor-pointer ${row.getIsSelected() ? 'bg-gray-400' : ''}`}
    >
      {/* Include the drag handle cell */}

      {row.getVisibleCells().map((cell: Cell<Beat, unknown>) => (
        <td
          className="whitespace-nowrap overflow-hidden text-ellipsis"
          key={cell.id}
          style={{
            width: cell.column.getSize(),
            maxWidth: cell.column.getSize(),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

export default DraggableRow;