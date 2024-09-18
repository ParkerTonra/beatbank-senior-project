import { useState } from "react";
import { open } from '@tauri-apps/api/dialog';
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async () => {
    try {
      const filePath = await open({
        directory: false,
        multiple: false,
        filters: [{
          name: 'Audio Files',
          extensions: ['flac', 'wav', 'mp3', 'ogg', 'm4a', 'aac', 'aiff', 'wma']
        }]
      });
      
      if (filePath) {
        setSelectedFile(filePath);
        console.log("Selected file:", filePath);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to Beatbank!</h1>
      <button onClick={handleFileUpload}>Upload a beat</button>
      {selectedFile && (
        <p>Selected file: {selectedFile}</p>
      )}
    </div>
  );
}

export default App;