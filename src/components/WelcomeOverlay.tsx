import sensaLogo from "data-base64:../../assets/sensa-logo.png"

interface WelcomeOverlayProps {
  theme: "light" | "dark"
  onGetStarted: () => void
}

export default function WelcomeOverlay({ theme, onGetStarted }: WelcomeOverlayProps) {
  const isDark = theme === "dark"
  
  return (
    <div className={`w-[350px] h-[550px] p-8 flex flex-col items-center justify-center font-sans transition-colors duration-300 ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-white text-black'}`}>
      <img src={sensaLogo} alt="Sensa Logo" className="w-24 h-24 object-contain mb-6 drop-shadow-sm" />
      <h1 className={`text-3xl font-extrabold mb-3 tracking-tight ${isDark ? 'text-gray-100' : 'text-black'}`}>
        Welcome to Sensa
      </h1>
      <p className={`text-sm text-center mb-10 px-2 leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
        Your intelligent accessibility assistant<br/>for a better web experience
      </p>
      
      {/* Restored Purple Button */}
      <button
        onClick={onGetStarted}
        className="bg-[#8A2BE2] text-white font-bold py-3 px-8 rounded-full transition-all duration-200 group shadow-[0_10px_40px_-10px_rgba(138,43,226,0.8)] hover:bg-[#7a20c9] hover:-translate-y-0.5"
      >
        Get Started
      </button>
    </div>
  )
}