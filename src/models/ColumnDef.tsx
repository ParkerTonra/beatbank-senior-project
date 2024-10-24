import RowDragHandleCell from "./../components/RowDragHandleCell.tsx";
import RowPlayHandleCell from "./../components/RowPlayHandleCell.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { Beat } from "../bindings";

interface Row {
  id: string;
  original: Beat;
}
//format seconds, and integer into MM:SS format (string)
const formatSecs = (secs?: number): string => {
  if (secs === undefined || secs === null) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const createColumnDef = (onBeatPlay: (beat: Beat) => void): ColumnDef<Beat>[] => [
  {
    accessorKey: "drag-handle",
    header: "",
    cell: ({ row }: { row: Row }) => (
      <div>
        
        <RowDragHandleCell row={row.original} />
      </div>
      
    ),
    size: 35,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    maxSize: 1,
  },
  {
    accessorKey: "title",
    header: "Title",
    size: 260
  },
  {
    accessorKey: "bpm",
    header: "BPM",
    size: 35,
  },
  {
    accessorKey: "musical_key",
    header: "Key",
    size: 35,
    enableResizing: false,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    size: 35,
    cell: ({ row }) => formatSecs(row.original.duration),
  },
  {
    accessorKey: "artist",
    header: "Artist",
  },

  {
    accessorKey: "date_created",
    header: "Date Added",
  },
  {
    accessorKey: "file_path",
    header: "Location",
  },
  {
    accessorKey: "play-handle",
    header: "Play",
    cell: ({ row }) => (
      <RowPlayHandleCell
        rowId={row.original.id.toString()}
        onPlay={() => onBeatPlay(row.original)}
      />
    ),
    size: 20,
  }
];
// function setAudioSrc(src: string): void {
//   // Implement the function here
//   // For example, you can set the audio source to the provided src
//   const audioElement = document.getElementById("audio") as HTMLAudioElement;
//   audioElement.src = src;
// }

