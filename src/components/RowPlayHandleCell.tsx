import React from 'react';
import { Play } from "lucide-react";

interface RowPlayHandleCellProps {
  rowId: string;
  onPlay: () => void;
}

const RowPlayHandleCell: React.FC<RowPlayHandleCellProps> = ({  onPlay }) => {
  return (
    <button onClick={onPlay} className="bg-transparent">
      <Play size={18} color='darkgray' />
    </button>
  );
};

export default RowPlayHandleCell;
