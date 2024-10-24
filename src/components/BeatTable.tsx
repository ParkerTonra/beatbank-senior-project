import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  ColumnResizeMode,
  ColumnSizingState,
  OnChangeFn,
  VisibilityState, SortingState, Row, getSortedRowModel,
} from "@tanstack/react-table";
import { createColumnDef } from "./../models/ColumnDef.tsx";
import { Beat, ColumnVis, EditThisBeat } from "./../bindings.ts";
import {
  DragEndEvent,
} from "@dnd-kit/core";
import DraggableRow from "./DraggableRow.tsx";
import { invoke } from "@tauri-apps/api/tauri";
import EditBeatCard from "./EditBeatCard.tsx";

interface BeatTableProps {
  beats: Beat[];
  // TODO: audio player
  // onBeatPlay: (beat: Beat) => void;
  onBeatSelect: (beat: Beat) => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedBeat: Beat | null;
  setSelectedBeat: React.Dispatch<React.SetStateAction<Beat | null>>;
  fetchData?: () => void;
  fetchSetData?: (id: number) => void;
  onBeatsChange: (newBeats: Beat[]) => void;
  columnVisibility: ColumnVis;
  setColumnVisibility: (columnVis: ColumnVis) => void;
  saveRowOrder?: (beatsToSave: Beat[]) => Promise<void>; // TODO: make this mandatory and work for sets as well.
  onAddBeatToCollection: (beatId: number, collectionId: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function BeatTable({
  beats,
  // TODO: audio player
  // onBeatPlay,
  onBeatSelect,
  isEditing,
  setIsEditing,
  selectedBeat,
  setSelectedBeat,
  fetchData,
  columnVisibility,
  setColumnVisibility,
}: BeatTableProps) {
  // row selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // key press state
  const [lastSelectedRow, setLastSelectedRow] = useState<string | null>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [sorting, setSorting] = useState<SortingState>([])

  // react based on key press state:
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true);
      if (e.key === "Shift") setIsShiftPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false);
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onBeatPlay = (beat: Beat) => {
    // TODO: audio player
    console.log("handleBeatPlay:", beat);
  };

  const handleRowSelection = (beat: Beat) => {
    const rowId = beat.id.toString();
    console.log("handleRowSelection:", rowId);
    setRowSelection((prev) => {
      if (isCtrlPressed) {
        // Toggle the selected row
        const newSelection: RowSelectionState = { ...prev };
        newSelection[rowId] = !newSelection[rowId];
        setLastSelectedRow(rowId);
        return newSelection;
      } else if (isShiftPressed && lastSelectedRow) {
        // Select all rows between last selected and current
        const newSelection: RowSelectionState = { ...prev };
        const rowIds = tableInstance.getRowModel().rows.map((row) => row.id);
        const startIndex = rowIds.indexOf(lastSelectedRow);
        const endIndex = rowIds.indexOf(rowId);
        const [start, end] =
          startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];
        for (let i = start; i <= end; i++) {
          newSelection[rowIds[i]] = true;
        }
        return newSelection;
      } else {
        // Select only the clicked row
        setLastSelectedRow(rowId);
        // get the beat object from the rowId
        onBeatSelect(beat);
        return { [rowId]: true } as RowSelectionState;
      }
    });
  };

  const finalColumnDef = useMemo(
    () => createColumnDef(onBeatPlay),
    [onBeatPlay]
  );

  const tableInstance = useReactTable<Beat>({
    columns: finalColumnDef,
    data: beats,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange" as ColumnResizeMode,
    onColumnSizingChange: setColumnSizing,
    getRowId: (row: Record<string, any>) => row.id,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnVisibility,
      columnSizing,
      sorting,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onColumnVisibilityChange: setColumnVisibility as OnChangeFn<VisibilityState>,
    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  })

  if (columnVisibility === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto select-none">
      <table className="w-full mb-96">
        <thead>
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="relative pr-4 text-left border-gray-800 border-b-4 cursor-pointer mr-2"
                  style={{
                    width: header.getSize(),
                  }}
                  onClick={() => header.column.toggleSorting()}
                >
                  <div className="flex items-center truncate w-full justify-between">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    <div>
                      {header.column.getIsSorted() === "asc" ? (
                        <span>^</span>
                      ) : header.column.getIsSorted() === "desc" ? (
                        <span>v</span>
                      ) :
                        null
                      }
                    </div>
                  </div>

                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""
                        }`}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tableInstance.getRowModel().rows.map((rowElement) => (
            <DraggableRow
              row={rowElement as Row<Beat>}
              key={rowElement.id}
              onRowSelection={handleRowSelection}
            />
          ))}
        </tbody>
      </table>
      <div className="flex px-4 border border-black shadow rounded mt-12 text-sm space-x-4">
        <div className="px-1 border-b border-black ">
          <label>
            <input
              className="border border-black flex-row"
              type="checkbox"
              checked={tableInstance.getIsAllColumnsVisible()}
              onChange={tableInstance.getToggleAllColumnsVisibilityHandler()}
            />{" "}
            Toggle All
          </label>
        </div>

        {tableInstance.getAllLeafColumns().map((column) => {
          return (
            <div key={column.id} className="mb-36">
              <label>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />{" "}
                {column.id}
              </label>
            </div>
          );
        })}
      </div>
      {isEditing && selectedBeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <EditBeatCard
              beat={selectedBeat}
              onClose={() => {
                setIsEditing(false);
                setSelectedBeat(null);
                setRowSelection({});
              }}
              onSave={(updatedBeat: EditThisBeat) => {
                console.log("Saving updated beat...");
                setIsEditing(false);
                setSelectedBeat(null);
                setRowSelection({});

                invoke("update_beat", {
                  beat: updatedBeat
                })
                  .then((response) => {
                    console.log("Response from update_beat:", response);
                    console.log("Fetching updated data");
                    if (fetchData) fetchData();
                  })
                  .catch((error) => {
                    console.error("Error updating beat:", error);
                  });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


export default BeatTable;