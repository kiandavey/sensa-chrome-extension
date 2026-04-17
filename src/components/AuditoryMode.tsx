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
    chrome.storage.local.set({ sensa_auditory_active: newState })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 w-full h-full">
      <div className="flex items-center justify-center gap-5 mb-8 w-full">
        
        {/* LEFT SOUNDWAVES */}
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-12 h-12 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full shrink-0">
            <path d="M18 3 A 16 16 0 0 0 18 21" />
            <path d="M14 7 A 10 10 0 0 0 14 17" />
            <path d="M10 11 A 4 4 0 0 0 10 13" />
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
        <div className={`transition-colors duration-300 shrink-0 flex items-center justify-center w-12 h-12 ${isCapturing ? 'text-[#FF5722]' : (isDark ? 'text-gray-700' : 'text-[#FAD5B4]')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-full h-full shrink-0">
            <path d="M6 3 A 16 16 0 0 1 6 21" />
            <path d="M10 7 A 10 10 0 0 1 10 17" />
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