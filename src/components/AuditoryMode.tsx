import { useState, useEffect } from "react"

interface AuditoryModeProps {
  isDark: boolean
}

export default function AuditoryMode({ isDark }: AuditoryModeProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  // --- THE TWO-WAY BRIDGE ---
  useEffect(() => {
    // 1. Check status the exact millisecond the popup opens
    chrome.storage.local.get(["sensa_auditory_active"], (res) => {
      setIsCapturing(!!res.sensa_auditory_active)
    })

    // 2. Listen for the web page telling us it closed
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.sensa_auditory_active !== undefined) {
        setIsCapturing(changes.sensa_auditory_active.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  // Send signal to web page
  const handleToggle = () => {
    const newState = !isCapturing
    setIsCapturing(newState)
    chrome.runtime.sendMessage({ type: "sensa-activate-mode", mode: newState ? "auditory" : null })
    chrome.storage.local.set({
      sensa_auditory_active: newState,
      // Enforce single active mode: turning auditory on must turn visual off.
      ...(newState ? { sensa_visual_active: false } : {})
    })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 w-full h-full">
      <div className="flex items-center justify-center gap-7 mb-8 w-full">
        
        {/* LEFT SOUNDWAVES */}
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-14 h-14 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full shrink-0">
            <rect x="4" y="9" width="2.8" height="6" rx="1.4" />
            <rect x="8.2" y="7" width="2.8" height="10" rx="1.4" />
            <rect x="12.4" y="5" width="2.8" height="14" rx="1.4" />
            <rect x="16.6" y="7.5" width="2.8" height="9" rx="1.4" />
          </svg>
        </div>

        {/* CC BUTTON (Now uses handleToggle) */}
        <button
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={handleToggle}
          className={`w-[130px] h-[130px] rounded-full flex items-center justify-center transition-all duration-300 relative group outline-none focus:outline-none focus:ring-0 shrink-0
            ${isCapturing 
              ? `bg-[#FF5722] shadow-[0_0_40px_rgba(255,87,34,0.7)] scale-105 ring-0 ${isDark ? 'dark:shadow-[0_0_40px_rgba(249,115,22,0.6)]' : ''}` 
              : `bg-[#F78E48] ring-[10px] shadow-xl hover:scale-105 ${isDark ? 'ring-gray-800' : 'ring-[#FAD5B4]'}`
            }`}
        >
          <div className={`w-14 h-12 bg-white rounded-lg flex items-center justify-center pointer-events-none select-none outline-none shadow-sm ${isCapturing ? 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)]' : 'shadow-[0_2px_8px_-2px_rgba(255,87,34,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(249,115,22,0.3)]'}`}>
            <span className={`font-black text-2xl tracking-tighter transition-colors pointer-events-none ${isCapturing ? 'text-[#FF5722]' : 'text-[#F78E48]'}`}>
              CC
            </span>
          </div>
        </button>

        {/* RIGHT SOUNDWAVES */}
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-14 h-14 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full shrink-0">
            <rect x="4" y="7.5" width="2.8" height="9" rx="1.4" />
            <rect x="8.2" y="5" width="2.8" height="14" rx="1.4" />
            <rect x="12.4" y="7" width="2.8" height="10" rx="1.4" />
            <rect x="16.6" y="9" width="2.8" height="6" rx="1.4" />
          </svg>
        </div>

      </div>

      <h2 className={`text-xl font-bold text-center whitespace-pre-line h-14 transition-colors duration-300 ${isCapturing ? 'text-[#FF5722]' : 'text-[#FCA571]'}`}>
        {isCapturing ? "Click to\nDeactivate" : "Click to Activate"}
      </h2>
    </div>
  )
}