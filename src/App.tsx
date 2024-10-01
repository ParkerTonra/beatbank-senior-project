import { useState } from "react";

import "./App.css";
import "./Main.css";
import { SplashScreen } from "./components/SplashScreen";
import { UploadBeat } from "./components/UploadBeat";

function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  

  if (showSplashScreen) {
    return <SplashScreen closeSplashScreen={() => setShowSplashScreen(false)} />;
  }

  return (
    <div className="container">
      <h1>Welcome to Beatbank!</h1>
      <UploadBeat />
    </div>
  );
}

export default App;