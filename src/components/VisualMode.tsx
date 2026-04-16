import { useState } from "react"

export default function VisualMode() {
  const [isListening, setIsListening] = useState(false)

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 w-full h-full">
      <div className="flex items-center justify-center gap-5 mb-8">
        
        {/* Left Soundwave */}
        <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isListening ? 'text-[#3B82F6]' : 'text-slate-300'}`}>
          <div className="w-0.5 h-3 bg-current rounded-full"></div>
          <div className="w-0.5 h-6 bg-current rounded-full"></div>
          <div className="w-0.5 h-10 bg-current rounded-full"></div>
          <div className="w-0.5 h-4 bg-current rounded-full"></div>
        </div>

        {/* Microphone Button (Fixed Chromium Border Bug using Rings) */}
        <button
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={() => setIsListening(!isListening)}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 relative group outline-none focus:outline-none focus:ring-0 transform-gpu
            ${isListening 
              ? "bg-[#3B82F6] shadow-[0_0_35px_rgba(59,130,246,0.6)] scale-105 ring-0" 
              : "bg-[#3B82F6] ring-[6px] ring-blue-100 shadow-xl hover:scale-105"
            }`}
        >
          {isListening ? (
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 pointer-events-none select-none">
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
              <path d="M5 10v2a7 7 0 0 0 12 5" />
              <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          ) : (
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 pointer-events-none select-none">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>

        {/* Right Soundwave */}
        <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isListening ? 'text-[#3B82F6]' : 'text-slate-300'}`}>
          <div className="w-0.5 h-4 bg-current rounded-full"></div>
          <div className="w-0.5 h-10 bg-current rounded-full"></div>
          <div className="w-0.5 h-6 bg-current rounded-full"></div>
          <div className="w-0.5 h-3 bg-current rounded-full"></div>
        </div>
      </div>

      <h2 className="text-[#5B8AF0] text-xl font-bold text-center whitespace-pre-line h-14">
        {isListening ? "Click or Speak\nto Deactivate" : "Click or Speak\nto Activate"}
      </h2>
    </div>
  )
}