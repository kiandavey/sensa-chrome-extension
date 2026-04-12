import { useState, useEffect } from "react"
import "./style.css"
import sensaLogo from "data-base64:../assets/sensa-logo.png"

export default function IndexPopup() {
  const [currentView, setCurrentView] = useState<"LOADING" | "MODE_SELECTION" | "WELCOME" | "DASHBOARD">("MODE_SELECTION")
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  useEffect(() => {
    chrome.storage.local.get(["sensa_mode"], (result) => {
      if (result.sensa_mode) {
        setSelectedMode(result.sensa_mode)
      }
    })
  }, [])

  const handleSelectMode = (mode: string) => {
    chrome.storage.local.set({ sensa_mode: mode }, () => {
      setSelectedMode(mode)
      setCurrentView("WELCOME") 
    })
  }

  const handleGetStarted = () => {
    chrome.storage.local.set({ sensa_welcome_seen: true }, () => {
      console.log(`User finished onboarding. Mode: ${selectedMode}`)
      setCurrentView("DASHBOARD") 
    })
  }

  // --- SCREEN 1: LOADING STATE ---
  if (currentView === "LOADING") {
    return <div className="w-[350px] h-[550px] bg-white flex items-center justify-center">Loading...</div>
  }

  // --- SCREEN 2: MODE SELECTION ---
  if (currentView === "MODE_SELECTION") {
    return (
      <div className="w-[350px] h-[550px] p-6 bg-white flex flex-col items-center justify-center font-sans">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Choose your mode:</h1>
        <button
          onClick={() => handleSelectMode("visual")}
          className="w-full py-3 px-4 mb-3 rounded-lg font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-blue-400"
        >
          Visual Mode
        </button>
        <button
          onClick={() => handleSelectMode("auditory")}
          className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-emerald-400"
        >
          Auditory Mode
        </button>
      </div>
    )
  }

  // --- SCREEN 3: WELCOME OVERLAY ---
  if (currentView === "WELCOME") {
    return (
      <div className="w-[350px] h-[550px] p-8 bg-white flex flex-col items-center justify-center font-sans">
        {/* Logo */}
        <img src={sensaLogo} alt="Sensa Logo" className="w-24 h-24 mb-6 drop-shadow-sm" />
        
        {/* Typography */}
        <h1 className="text-3xl font-extrabold text-black mb-3 tracking-tight">
          Welcome to Sensa
        </h1>
        <p className="text-sm text-slate-700 text-center mb-10 px-2 leading-relaxed">
          Your intelligent accessibility assistant<br/>for a better web experience
        </p>

        {/* The Glowing Button */}
        <button
          onClick={handleGetStarted}
          className="bg-[#8A2BE2] text-white font-bold py-3 px-8 rounded-full 
                     shadow-[0_10px_40px_-10px_rgba(138,43,226,0.8)] 
                     hover:bg-[#7a20c9] hover:-translate-y-0.5 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    )
  }

  // --- SCREEN 4: THE MAIN DASHBOARD ---
  if (currentView === "DASHBOARD") {
    return (
      <div className="w-[350px] h-[550px] p-6 bg-slate-50 flex flex-col items-center justify-center font-sans">
        <h1 className="text-xl font-bold text-slate-800">Sensa Dashboard</h1>
        <p className="text-sm text-slate-500 mt-2">Active Mode: {selectedMode}</p>
        
        {/* Quick reset button for testing */}
        <button 
          onClick={() => {
            chrome.storage.local.clear()
            setCurrentView("MODE_SELECTION")
          }}
          className="mt-6 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
        >
          Clear Data & Reset
        </button>
      </div>
    )
  }
}