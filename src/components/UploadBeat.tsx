import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { useState } from 'react';

interface UploadBeatProps {
  fetchData: () => void;
}

const UploadBeat: React.FC<UploadBeatProps> = ({ fetchData }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async () => {
    try {
      const filePaths = await open({
        directory: false,
        multiple: true,
        filters: [{
          name: 'Audio Files',
          extensions: ['flac', 'wav', 'mp3', 'ogg', 'm4a', 'aac', 'aiff', 'wma']
        }]
      });

      if (filePaths && filePaths.length > 0) {
        setSelectedFiles(Array.isArray(filePaths) ? filePaths : [filePaths]);
        console.log("Selected files:", filePaths);

        // Upload each file
        for (const filePath of (Array.isArray(filePaths) ? filePaths : [filePaths])) {
          try {
            const result = await invoke('add_beat', {
              title: filePath.split('/').pop() || 'Unknown', // Use filename as title
              filePath: filePath,
            });
            console.log(result);
            fetchData();
            setUploadStatus(prevStatus => prevStatus + `\n${result}`);
          } catch (error) {
            console.error("Error adding beat:", error);
            setUploadStatus(prevStatus => prevStatus + `\nError uploading ${filePath}: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      setUploadStatus(`Error selecting file: ${error}`);
    }
  };
  

  return (
    <div>
      <button onClick={handleFileUpload}>Upload a beat</button>
      {selectedFiles.length > 0 && (
        <div>
          <p>Selected files:</p>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}
      {uploadStatus && (
        <div>
          <p>Upload Status:</p>
          <pre>{uploadStatus}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadBeat;