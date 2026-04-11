import { useState, useEffect } from "react"
import "./style.css" 

export default function IndexPopup() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  // This checks if the user already picked a mode in the past
  useEffect(() => {
    chrome.storage.local.get(["sensa_mode"], (result) => {
      if (result.sensa_mode) {
        setSelectedMode(result.sensa_mode)
      }
    })
  }, [])

  // This saves the chosen mode to your chrome local storage
  const handleSelectMode = (mode: string) => {
    chrome.storage.local.set({ sensa_mode: mode }, () => {
      setSelectedMode(mode)
      console.log(`Sensa Mode saved: ${mode}`)
      // Later, we will trigger the Welcome Overlay right here!
    })
  }

  return (
    <div className="w-80 p-6 bg-slate-50 flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Sensa</h1>
      <p className="text-sm text-slate-500 mb-6 text-center">
        Select your required accessibility mode to begin.
      </p>

      <button
        onClick={() => handleSelectMode("visual")}
        className={`w-full py-3 px-4 mb-3 rounded-lg font-semibold transition-all duration-200 
          ${selectedMode === "visual" 
            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" 
            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`}
      >
        Visual Mode
      </button>

      <button
        onClick={() => handleSelectMode("auditory")}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 
          ${selectedMode === "auditory" 
            ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300" 
            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`}
      >
        Auditory Mode
      </button>
    </div>
  )
}