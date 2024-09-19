
import "../Main.css";

export function SplashScreen({ closeSplashScreen }: {closeSplashScreen: () => void}) {
  return <div className="h-screen w-full bg-[#24c8fc]">
    <div className="w-full flex justify-center">
      <div>
        <div className="w-full flex justify-center text-6xl mt-6 font-guerilla">
          BEATBANK
        </div>
        <img src="src/assets/BeatbankLogo.png" width={400} height={400} />
        <div className="w-full flex justify-center">
          <button onClick={closeSplashScreen}>Enter</button>
        </div>
      </div>
    </div>

  </div>
}