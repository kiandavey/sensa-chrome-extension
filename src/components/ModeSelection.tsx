import sensaLogo from "data-base64:../../assets/sensa-logo.png"

interface ModeSelectionProps {
  theme: "light" | "dark"
  onSelectMode: (mode: "visual" | "auditory") => void
}

export default function ModeSelection({ theme, onSelectMode }: ModeSelectionProps) {
  const isDark = theme === "dark"
  
  return (
    <div className={`w-[350px] h-[550px] p-6 flex flex-col items-center justify-center font-sans ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-white text-black'}`}>
      
      {/* Wrapper to pull everything up slightly for perfect optical centering */}
      <div className="w-full flex flex-col items-center -mt-8">

        <h1 className="text-2xl font-bold mb-6">Choose your mode:</h1>

        {/* --- Visual Mode Card (Blue / Dark Blue) --- */}
        <button
          onClick={() => onSelectMode("visual")}
          className={`w-full bg-white dark:bg-gray-900 border-[3px] rounded-2xl p-5 mb-5 flex flex-col items-center transition-all duration-200 group
                     ${isDark 
                       ? 'border-[#3B82F6] shadow-[0_8px_20px_-6px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.4)]' 
                       : 'border-[#0A44FF] shadow-[0_8px_20px_-6px_rgba(10,68,255,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(10,68,255,0.4)]'}`}
        >
          {/* Eye Icon SVG (Blue / Dark Blue) */}
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-14 h-14 mb-3 group-hover:scale-110 transition-transform duration-200 ${isDark ? 'text-[#3B82F6]' : 'text-[#0A44FF]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-[#3B82F6]' : 'text-[#0A44FF]'}`}>Visual Mode</h2>
          <p className="text-sm text-center leading-snug px-2">
            For audio-based navigation<br />& reading
          </p>
        </button>

        {/* --- Auditory Mode Card (Orange / Dark Orange) --- */}
        <button
          onClick={() => onSelectMode("auditory")}
          className={`w-full bg-white dark:bg-gray-900 border-[3px] rounded-2xl p-5 flex flex-col items-center transition-all duration-200 group
                     ${isDark 
                       ? 'border-[#F97316] shadow-[0_8px_20px_-6px_rgba(249,115,22,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(249,115,22,0.4)]' 
                       : 'border-[#FF5722] shadow-[0_8px_20px_-6px_rgba(255,87,34,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(255,87,34,0.4)]'}`}
        >
          {/* Ear Icon SVG (Orange / Dark Orange) */}
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-14 h-14 mb-3 group-hover:scale-110 transition-transform duration-200 ${isDark ? 'text-[#F97316]' : 'text-[#FF5722]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/>
            <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>
          </svg>

          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-[#F97316]' : 'text-[#FF5722]'}`}>Auditory Mode</h2>
          <p className="text-sm text-center leading-snug px-2">
            For live captions & sound alerts
          </p>
        </button>
        
      </div>
    </div>
  )
}