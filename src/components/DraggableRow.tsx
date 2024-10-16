import { CSS } from "@dnd-kit/utilities";
import { flexRender, Row, Cell } from "@tanstack/react-table";
import { Beat } from "../bindings";
import { DragEndEvent, useDraggable } from "@dnd-kit/core";

interface DraggableRowProps {
  row: Row<Beat>;
  onRowSelection: (beat: Beat) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function DraggableRow({ row, onRowSelection}: DraggableRowProps) {
  const { transform, setNodeRef, isDragging } = useDraggable({
    id: row.original.id,
  });
  

  const style: any = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
    console.log("Drag start event:", event);
    event.dataTransfer.setData('text/plain', row.original.id.toString());
    console.log("Drag start data:", event.dataTransfer.getData('text/plain'));
  };

  return (
    <tr
  ref={setNodeRef}
  style={style}
  draggable
  onDragStart={handleDragStart}
  onDragOver={(e) => e.preventDefault()}
  onClick={() => onRowSelection(row.original)}
  className={`cursor-pointer ${
    row.getIsSelected() ? "bg-gray-400" : ""
  }`}
  data-row-id={row.original.id}
>
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
