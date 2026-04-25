import { useState, useEffect, useRef } from "react"
import sensaLogo from "data-base64:../../assets/sensa-logo.png"
import VisualMode from "./VisualMode"
import AuditoryMode from "./AuditoryMode"

interface DashboardProps {
  selectedMode: "visual" | "auditory" | null
  theme: "light" | "dark"
  onModeChange: (mode: "visual" | "auditory") => void
  onThemeChange: (newTheme: "light" | "dark") => void
  onReset: () => void
}

export default function Dashboard({ selectedMode, theme, onModeChange, onThemeChange, onReset }: DashboardProps) {
  const [currentViewMode, setCurrentViewMode] = useState<"visual" | "auditory">("visual")
  const [isUserSwitchAnimating, setIsUserSwitchAnimating] = useState(false)
  const animationTimeoutRef = useRef<number | null>(null)

  // --- AUTO-SAVE LOGIC ---
  // 1. Load the last visited tab when the popup opens
  useEffect(() => {
    chrome.storage.local.get(["sensa_last_tab"], (res) => {
      if (res.sensa_last_tab) {
        setCurrentViewMode(res.sensa_last_tab)
      } else if (selectedMode) {
        setCurrentViewMode(selectedMode)
      }
    })
  }, [selectedMode])

  // 2. Save the tab to the database every time you click the switch
  const handleViewSwap = (newMode: "visual" | "auditory") => {
    if (newMode === currentViewMode) return
    setIsUserSwitchAnimating(true)
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
    }
    animationTimeoutRef.current = window.setTimeout(() => {
      setIsUserSwitchAnimating(false)
      animationTimeoutRef.current = null
    }, 520)
    setCurrentViewMode(newMode)
    // Tab switch is navigation only: deactivate running mode(s), do not auto-activate target mode.
    chrome.storage.local.set({
      sensa_last_tab: newMode,
      sensa_visual_active: false,
      sensa_auditory_active: false
    })
    chrome.runtime.sendMessage({ type: "sensa-activate-mode", mode: null })
    onModeChange(newMode)
  }

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Enforce Visual Mode scope: Always Light Mode
  const isAuditory = currentViewMode === "auditory"
  const isDark = isAuditory ? theme === "dark" : false
  const modeTransitionClass = isUserSwitchAnimating ? "transition-colors duration-500" : "transition-none duration-0"

  return (
    <div className={`w-[350px] h-[550px] flex flex-col font-sans relative overflow-hidden ${modeTransitionClass} ease-in-out ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-white text-black'}`}>
      
      {/* --- NAVBAR --- */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 z-20">
        <div className="flex items-center gap-3">
          <img src={sensaLogo} alt="Sensa Logo" className="w-14 h-14 object-contain" />
          <h1 className="text-3xl font-extrabold tracking-tight">Sensa</h1>
        </div>
        
        {isAuditory ? (
          <button
            onClick={() => onThemeChange(isDark ? "light" : "dark")}
            className={`relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-300 border focus:outline-none
              ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-slate-200 border-slate-300'}`}
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-out
                ${isDark ? 'translate-x-8' : 'translate-x-0'}`}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
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
          </button>
        ) : (
          <button className="text-[#3B82F6] hover:text-blue-700 transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </button>
        )}
      </div>

      {/* --- DYNAMIC MODE SWITCHER PILL --- */}
      <div className="px-6 flex justify-center mb-4 z-20 mt-2">
        <div className={`relative flex w-[85%] h-11 rounded-full p-[3px] border-2 ${modeTransitionClass}
          ${isAuditory ? (isDark ? 'bg-gray-900 border-[#FF7A2F]' : 'bg-white border-[#FF7A2F]') : 'bg-white border-[#3B82F6]'}`}
        >
          <div
            className={`absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] rounded-full ${isUserSwitchAnimating ? "transition-all duration-500" : "transition-none duration-0"} ease-[cubic-bezier(0.4,0,0.2,1)] shadow-sm
              ${isAuditory ? 'translate-x-[100%] bg-[#FF7A2F]' : 'translate-x-0 bg-[#3B82F6]'}`}
          />
          <button
            onClick={() => handleViewSwap("visual")}
            className={`flex-1 relative z-10 font-bold text-sm ${isUserSwitchAnimating ? "transition-colors duration-300" : "transition-none duration-0"} focus:outline-none ${!isAuditory ? 'text-white' : (isDark ? 'text-gray-300' : 'text-black')}`}
          >
            Visual
          </button>
          <button
            onClick={() => handleViewSwap("auditory")}
            className={`flex-1 relative z-10 font-bold text-sm ${isUserSwitchAnimating ? "transition-colors duration-300" : "transition-none duration-0"} focus:outline-none ${isAuditory ? 'text-white' : 'text-black'}`}
          >
            Auditory
          </button>
        </div>
      </div>

      {/* --- FLEX SLIDER (NO STARTUP ANIMATION, YES TOGGLE ANIMATION) --- */}
      <div className="flex-1 w-full relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-[200%] h-full flex ${isUserSwitchAnimating ? "transition-transform duration-500" : "transition-none duration-0"} ease-[cubic-bezier(0.4,0,0.2,1)]`}
          style={{ transform: isAuditory ? "translateX(-50%)" : "translateX(0)" }}>
          <div className="w-1/2 h-full flex shrink-0">
            <VisualMode />
          </div>
          <div className="w-1/2 h-full flex shrink-0">
            <AuditoryMode isDark={isDark} />
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-6 flex flex-col items-center gap-2 mt-auto pb-4 z-20">
        <p className={`text-sm font-bold ${modeTransitionClass} ${isAuditory ? 'text-[#FF7A2F]' : 'text-[#3B82F6]'}`}>
          Website: <span className={`font-normal ml-1 ${isDark ? 'text-gray-300' : 'text-black'}`}>Google.com</span>
        </p>
        <p className={`text-sm font-bold flex items-center justify-center ${modeTransitionClass} ${isAuditory ? 'text-[#FF7A2F]' : 'text-[#3B82F6]'}`}>
          Extension Status: 
          <span className={`font-normal ml-2 flex items-center ${isDark ? 'text-green-500' : 'text-green-600'}`}>
            Online <span className={`inline-block w-2.5 h-2.5 rounded-full ml-1.5 ${isDark ? 'bg-green-500' : 'bg-green-600'}`}></span>
          </span>
        </p>
      </div>

      <div className="px-6 pb-6 pt-1 z-20">
        <button 
          onClick={onReset}
          className={`w-full py-2 rounded-lg text-xs font-semibold ${modeTransitionClass} focus:outline-none
            ${isDark ? 'bg-gray-800 text-gray-500 hover:bg-gray-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          Switch Accessibility Mode (Dev)
        </button>
      </div>

    </div>
  )
}