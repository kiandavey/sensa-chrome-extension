import { useState } from "react"
import sensaLogo from "data-base64:../../assets/sensa-logo.png"

interface VisualModeProps {
  theme: "light" | "dark"
  onModeChange: (mode: "visual" | "auditory") => void // For horizontal view slide logic
  onReset: () => void
}

export default function VisualMode({ theme, onModeChange, onReset }: VisualModeProps) {
  const [isListening, setIsListening] = useState(false)
  const isDark = theme === "dark"

  return (
    <div className={`w-[350px] h-[550px] flex flex-col font-sans relative ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-white text-black'}`}>
      
      {/* --- NAVBAR --- */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Dark Mode handled logo */}
          <img 
            src={sensaLogo} 
            alt="Sensa Logo" 
            className={`w-10 h-10 object-contain ${isDark ? 'invert' : ''}`} 
          />
          <h1 className="text-3xl font-extrabold tracking-tight">Sensa</h1>
        </div>
        
        {/* Help Icon (Themed Blue) */}
        <button className="text-[#3B82F6] hover:text-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </button>
      </div>

      {/* --- MODE SWITCHER (Themed Blue) --- */}
      <div className="px-6 flex justify-center mb-6">
        <div className={`flex rounded-full overflow-hidden border-2 w-[85%] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#3B82F6]'}`}>
          <button className={`flex-1 py-1.5 font-bold text-sm ${isDark ? 'bg-[#3B82F6] text-white' : 'bg-[#3B82F6] text-white'}`}>
            Visual
          </button>
          {/* Connect Auditory to call Dashboard handler for smooth slide */}
          <button 
            onClick={() => onModeChange("auditory")}
            className={`flex-1 py-1.5 font-bold text-sm transition-colors hover:bg-slate-50 ${isDark ? 'text-gray-300 hover:text-white dark:hover:bg-gray-700' : 'text-black'}`}>
            Auditory
          </button>
        </div>
      </div>

      {/* --- MAIN INTERFACE (Microphone & Waves) --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-2">
        
        <div className="flex items-center justify-center gap-5 mb-8">
          {/* Left Soundwave */}
          <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isListening ? 'text-[#3B82F6]' : 'text-slate-300 dark:text-gray-700'}`}>
            <div className="w-0.5 h-3 bg-current rounded-full"></div>
            <div className="w-0.5 h-6 bg-current rounded-full"></div>
            <div className="w-0.5 h-10 bg-current rounded-full"></div>
            <div className="w-0.5 h-4 bg-current rounded-full"></div>
          </div>

          {/* Interactive Microphone Button (Blue) */}
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 relative group
              ${isListening 
                ? "bg-[#3B82F6] shadow-[0_0_35px_rgba(59,130,246,0.6)] scale-105" 
                : "bg-[#3B82F6] border-[6px] shadow-xl hover:scale-105 border-blue-100 dark:border-blue-900"
              }`}
          >
            {isListening ? (
              // Mic OFF Icon (Activated State)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            ) : (
              // Mic ON Icon (Inactive State)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </button>

          {/* Right Soundwave */}
          <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isListening ? 'text-[#3B82F6]' : 'text-slate-300 dark:text-gray-700'}`}>
            <div className="w-0.5 h-4 bg-current rounded-full"></div>
            <div className="w-0.5 h-10 bg-current rounded-full"></div>
            <div className="w-0.5 h-6 bg-current rounded-full"></div>
            <div className="w-0.5 h-3 bg-current rounded-full"></div>
          </div>
        </div>

        {/* Dynamic Status Text (Blue) */}
        <h2 className="text-[#5B8AF0] text-xl font-bold text-center whitespace-pre-line h-14">
          {isListening ? "Click or Speak\nto Deactivate" : "Click or Speak\nto Activate"}
        </h2>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-6 flex flex-col items-center gap-3 mt-auto">
        <p className={`text-sm font-bold text-[#3B82F6]`}>
          Website: <span className={`font-normal ml-1 ${isDark ? 'text-gray-300' : 'text-black'}`}>Google.com</span>
        </p>
        <p className={`text-sm font-bold flex items-center justify-center text-[#3B82F6]`}>
          Extension Status: 
          <span className={`font-normal ml-2 flex items-center ${isDark ? 'text-green-500' : 'text-green-600'}`}>
            Online <span className={`inline-block w-2.5 h-2.5 rounded-full ml-1.5 ${isDark ? 'bg-green-500' : 'bg-green-600'}`}></span>
          </span>
        </p>
      </div>

      {/* Temporary Reset Button */}
      <div className="px-6 pb-6 pt-4 z-50">
        <button 
          onClick={onReset}
          className="w-full py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
        >
          Switch Accessibility Mode (Dev)
        </button>
      </div>

    </div>
  )
}