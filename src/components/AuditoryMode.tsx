import { useState } from "react"
import sensaLogo from "data-base64:../../assets/sensa-logo.png"

interface AuditoryModeProps {
  theme: "light" | "dark"
  onThemeChange: (newTheme: "light" | "dark") => void // For functional persistent theme toggle
  onModeChange: (mode: "visual" | "auditory") => void // For horizontal view slide logic
  onReset: () => void
}

export default function AuditoryMode({ theme, onThemeChange, onModeChange, onReset }: AuditoryModeProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const isDark = theme === "dark"

  // Handle active theme persistence change
  const handleToggleTheme = () => {
    onThemeChange(isDark ? "light" : "dark")
  }

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
        
        {/* Functional Persistent Theme Toggle (Sun/Moon) */}
        <div 
          onClick={handleToggleTheme}
          className={`flex items-center bg-slate-200 dark:bg-gray-800 rounded-full p-1 border cursor-pointer w-16 h-8 relative transition-colors ${isDark ? 'border-gray-700' : 'border-slate-300'}`}>
          <div className={`absolute left-1 bg-white dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition-all ${isDark ? 'transform translateX(full)' : ''}`}>
            {isDark ? (
              // Moon Icon (Active in Dark)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              // Sun Icon (Active in Light)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="M4.93 4.93l1.41 1.41"></path>
                <path d="M17.66 17.66l1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="M4.93 19.07l1.41-1.41"></path>
                <path d="M17.66 6.34l1.41-1.41"></path>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* --- MODE SWITCHER (Themed Orange) --- */}
      <div className="px-6 flex justify-center mb-6">
        <div className={`flex rounded-full overflow-hidden border-2 w-[85%] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#FF7A2F]'}`}>
          {/* Connect Visual to call Dashboard handler for smooth slide */}
          <button 
            onClick={() => onModeChange("visual")}
            className={`flex-1 py-1.5 font-bold text-sm transition-colors ${isDark ? 'text-gray-300 hover:text-white dark:hover:bg-gray-700' : 'text-black hover:bg-slate-50'}`}>
            Visual
          </button>
          <button className={`flex-1 py-1.5 font-bold text-sm ${isDark ? 'bg-[#FF7A2F] text-white' : 'bg-[#FF7A2F] text-white'}`}>
            Auditory
          </button>
        </div>
      </div>

      {/* --- MAIN INTERFACE (CC Button & Waves) --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-2">
        
        <div className="flex items-center justify-center gap-5 mb-8">
          
          {/* Left Soundwave (New Line Waves) */}
          <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isCapturing ? 'text-[#FF5722]' : 'text-slate-300 dark:text-gray-700'}`}>
            <div className="w-0.5 h-3 bg-current rounded-full"></div>
            <div className="w-0.5 h-6 bg-current rounded-full"></div>
            <div className="w-0.5 h-10 bg-current rounded-full"></div>
            <div className="w-0.5 h-4 bg-current rounded-full"></div>
          </div>

          {/* Interactive CC Button (Orange themed Aura) */}
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`w-[130px] h-[130px] rounded-full flex items-center justify-center transition-all duration-300 
              ${isCapturing 
                ? `bg-[#FF5722] scale-105 border-[10px] border-transparent 
                   ${isDark ? 'shadow-[0_0_40px_rgba(249,115,22,0.6)]' : 'shadow-[0_0_40px_rgba(255,87,34,0.7)]'}` 
                : "bg-[#F78E48] border-[12px] shadow-xl hover:scale-105 border-[#FAD5B4] dark:border-[#FAD5B4] [data-theme=dark]:border-transparent" // Managing CC box shadows
              }`}
          >
            {/* The white CC box */}
            <div className={`w-14 h-12 bg-white rounded-lg flex items-center justify-center 
                            shadow-sm ${isCapturing ? 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)]' : 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(249,115,22,0.3)]'}`}>
              <span className={`font-black text-2xl tracking-tighter transition-colors ${isCapturing ? 'text-[#FF5722]' : 'text-[#F78E48]'}`}>
                CC
              </span>
            </div>
          </button>

          {/* Right Soundwave (New Line Waves) */}
          <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isCapturing ? 'text-[#FF5722]' : 'text-slate-300 dark:text-gray-700'}`}>
            <div className="w-0.5 h-4 bg-current rounded-full"></div>
            <div className="w-0.5 h-10 bg-current rounded-full"></div>
            <div className="w-0.5 h-6 bg-current rounded-full"></div>
            <div className="w-0.5 h-3 bg-current rounded-full"></div>
          </div>
        </div>

        {/* Dynamic Status Text (Orange) */}
        <h2 className={`text-xl font-bold text-center whitespace-pre-line h-14 transition-colors duration-300 ${isCapturing ? 'text-[#FF5722]' : 'text-[#FCA571]'}`}>
          {isCapturing ? "Click to\nDeactivate" : "Click to Activate"}
        </h2>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-6 flex flex-col items-center gap-3 mt-auto">
        <p className={`text-sm font-bold text-[#FF7A2F]`}>
          Website: <span className={`font-normal ml-1 ${isDark ? 'text-gray-300' : 'text-black'}`}>Google.com</span>
        </p>
        <p className={`text-sm font-bold flex items-center justify-center text-[#FF7A2F]`}>
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