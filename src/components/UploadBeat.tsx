
import { open } from '@tauri-apps/api/dialog';
import { useState } from 'react';

export const UploadBeat = () => {

const [selectedFile, setSelectedFile] = useState<string | string[] | null>(null);

  const handleFileUpload = async () => {
    try {
      const filePath = await open({
        directory: false,
        multiple: true,
        filters: [{
          name: 'Audio Files',
          extensions: ['flac', 'wav', 'mp3', 'ogg', 'm4a', 'aac', 'aiff', 'wma']
        }]
      });

      if (filePath) {
        // if just one file is selected, setSelectedFile to that file, otherwise make a string array of all the files
        setSelectedFile(filePath);
        console.log("Selected file:", filePath);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };


    return (
        <div>
            <button onClick={handleFileUpload}>Upload a beat</button>
            {selectedFile && <p>Selected file: {selectedFile}</p>}
        </div>
    )
}

export default UploadBeat