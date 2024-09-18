
import "../Main.css";

export function SplashScreen({ closeSplashScreen }: {closeSplashScreen: () => void}) {
  return <div className="h-screen w-full bg-[#24c8fc]">
    <div className="w-full flex justify-center">
      <img src="src/assets/BeatbankLogo.png" width={500} height={500} />
    </div>
    <div className="w-full flex justify-center">
      <button onClick={closeSplashScreen}>Enter</button>
    </div>

  </div>
}