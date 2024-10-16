import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { useState } from 'react';
import { Beat } from './../bindings';
import { readDir } from "@tauri-apps/api/fs";

interface UploadBeatProps {
  fetchData: () => void;
  selectedBeat: Beat | null;
}

const UploadBeat: React.FC<UploadBeatProps> = ({ fetchData, selectedBeat }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileDelete = async () => {
    console.log("handleFileDelete");
    if (!selectedBeat) {
      console.log("No beat selected");
      setUploadStatus("No beat selected");
      return;
    }
    try {
      const result = await invoke('delete_beat', { id: selectedBeat.id });
      console.log(result);
      fetchData();
      setUploadStatus(prevStatus => prevStatus + `\n${result}`);
  } catch (error) {
      console.error("Error deleting beat:", error);
      setUploadStatus(prevStatus => prevStatus + `\nError deleting beat: ${error}`);
    }
  };

  async function processEntries(entries) {
    const promises = [];
    const filePaths = [];
    for (const filepath of entries) {
      if (filepath.children) {
        await processEntries(filepath.children);
      } else {
        filePaths.push(filepath.path)
        const validExtensions = ['flac', 'wav', 'mp3', 'ogg', 'm4a', 'aac', 'aiff', 'wma'];
        const extension = filepath.name.split(".").pop();
        if (validExtensions.indexOf(extension) >= 0) {
          setSelectedFiles(filePaths);
          promises.push(invoke('add_beat', {
            title: filepath.name || 'Unknown', // Use filename as title
            filePath: filepath.path,
          }));
        }
      }
    }
    Promise.all(promises).then((values) => {
      fetchData();
      setUploadStatus(values.join("\n"));
    }, function(err) {
      console.error(err)
    });
  }

  const handleFolderUpload = async () => {
    try {
      const filePaths = await open({
        directory: true,
        recursive: true,
        multiple: true,
      });

      if (filePaths && filePaths.length > 0) {
        // Upload each file
        for (const filePath of (Array.isArray(filePaths) ? filePaths : [filePaths])) {
          const entries = await readDir(filePath);
          await processEntries(entries);
          fetchData();
        }
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      setUploadStatus(`Error selecting file: ${error}`);
    }
  }
  
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

        // Upload each file
        for (const filePath of (Array.isArray(filePaths) ? filePaths : [filePaths])) {
          try {
            const result = await invoke('add_beat', {
              title: filePath.split('/').pop() || 'Unknown', // Use filename as title
              filePath: filePath,
            });
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
    <div className="my-2 flex flex-col">
      <div className="w-full flex justify-center gap-5">
        <button onClick={handleFileUpload}>Upload a beat</button>
        <button onClick={handleFolderUpload} className="ml-2">Upload a folder</button>
        <button onClick={handleFileDelete}className="ml-2">Delete</button>
        <button onClick={fetchData}className="ml-2">Refresh</button>
      </div>
      <div className="max-h-[200px] overflow-y-auto my-4">
        <div>
          {selectedFiles.length > 0 && (
            <div>
              <p className="font-bold">Selected files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-2">
          {uploadStatus && (
            <div>
              <p className="font-bold">Upload Status:</p>
              <pre>{uploadStatus}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadBeat;