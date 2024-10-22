import { useDraggable } from '@dnd-kit/core';
import { Cell, flexRender, Row } from '@tanstack/react-table';
import { Beat } from '../bindings';
import { CSS } from '@dnd-kit/utilities';

interface DraggableRowProps {
  row: Row<Beat>;
  onRowSelection: (beat: Beat) => void;
  isSelected: boolean;
}

function DraggableRow({ row, onRowSelection, isSelected }: DraggableRowProps) {
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
      className={`cursor-pointer max-h-[50px] ${row.getIsSelected() || isSelected ? 'bg-blue-900' : ''}`}
    >
      {row.getVisibleCells().map((cell: Cell<Beat, unknown>) => (
        <td
          className="whitespace-nowrap overflow-hidden text-ellipsis h-[40px]"
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