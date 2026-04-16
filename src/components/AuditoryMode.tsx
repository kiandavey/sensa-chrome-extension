import { useState } from "react"

interface AuditoryModeProps {
  isDark: boolean
}

export default function AuditoryMode({ isDark }: AuditoryModeProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 w-full h-full">
      <div className="flex items-center justify-center gap-5 mb-8 w-full">
        
        {/* LEFT SOUNDWAVES (Mathematically locked circular arcs) */}
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-12 h-12 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full shrink-0">
            {/* Outer Wave */}
            <path d="M18 3 A 16 16 0 0 0 18 21" />
            {/* Middle Wave */}
            <path d="M14 7 A 10 10 0 0 0 14 17" />
            {/* Inner Wave */}
            <path d="M10 11 A 4 4 0 0 0 10 13" />
          </svg>
        </div>

        {/* CC BUTTON (Matched exactly to Visual Mode's w-[130px] h-[130px]) */}
        <button
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={() => setIsCapturing(!isCapturing)}
          className={`w-[130px] h-[130px] rounded-full flex items-center justify-center transition-all duration-300 relative group outline-none focus:outline-none focus:ring-0 shrink-0
            ${isCapturing 
              ? `bg-[#FF5722] shadow-[0_0_40px_rgba(255,87,34,0.7)] scale-105 ring-0 ${isDark ? 'dark:shadow-[0_0_40px_rgba(249,115,22,0.6)]' : ''}` 
              : `bg-[#F78E48] ring-[10px] shadow-xl hover:scale-105 ${isDark ? 'ring-gray-800' : 'ring-[#FAD5B4]'}`
            }`}
        >
          {/* CC Box (Protected with pointer-events-none) */}
          <div className={`w-14 h-12 bg-white rounded-lg flex items-center justify-center pointer-events-none select-none outline-none shadow-sm ${isCapturing ? 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)]' : 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(249,115,22,0.3)]'}`}>
            <span className={`font-black text-2xl tracking-tighter transition-colors pointer-events-none ${isCapturing ? 'text-[#FF5722]' : 'text-[#F78E48]'}`}>
              CC
            </span>
          </div>
        </button>

        {/* RIGHT SOUNDWAVES (Mathematically locked circular arcs) */}
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-12 h-12 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full shrink-0">
            {/* Outer Wave */}
            <path d="M6 3 A 16 16 0 0 1 6 21" />
            {/* Middle Wave */}
            <path d="M10 7 A 10 10 0 0 1 10 17" />
            {/* Inner Wave */}
            <path d="M14 11 A 4 4 0 0 1 14 13" />
          </svg>
        </div>

      </div>

      <h2 className={`text-xl font-bold text-center whitespace-pre-line h-14 transition-colors duration-300 ${isCapturing ? 'text-[#FF5722]' : 'text-[#FCA571]'}`}>
        {isCapturing ? "Click to\nDeactivate" : "Click to Activate"}
      </h2>
    </div>
  )
}