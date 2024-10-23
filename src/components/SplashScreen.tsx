
import "../Main.css";

export function SplashScreen({ closeSplashScreen }: {closeSplashScreen: () => void}) {
  return <div className="h-screen w-full bg-[#24c8fc]">
    <div className="w-full h-full flex justify-center">
      <div className="h-full flex flex-col justify-around">
        <div className="w-full flex justify-center text-6xl mt-8 font-guerilla">
          BEATBANK
        </div>
        <img src="src/assets/BeatbankLogo.png" width={400} height={400} />
        <div className="w-full flex justify-center">
          <button className="px-12 py-4" onClick={closeSplashScreen}>
            <span className="pi pi-arrow-right"/>
          </button>
        </div>
      </div>
    </div>

  </div>
}