import { useState, useEffect } from "react"
import "./style.css"
import ModeSelection from "./components/modeSelection"
import WelcomeOverlay from "./components/WelcomeOverlay"
import Dashboard from "./components/Dashboard"

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
      setCurrentView("DASHBOARD") 
    })
  }

  const handleResetApp = () => {
    chrome.storage.local.clear(() => {
      setSelectedMode(null)
      setCurrentView("MODE_SELECTION")
    })
  }

  if (currentView === "LOADING") return <div className="w-[350px] h-[550px] bg-white flex items-center justify-center">Loading...</div>
  
  if (currentView === "MODE_SELECTION") return <ModeSelection onSelectMode={handleSelectMode} />
  
  if (currentView === "WELCOME") return <WelcomeOverlay onGetStarted={handleGetStarted} />
  
  if (currentView === "DASHBOARD") return <Dashboard selectedMode={selectedMode} onReset={handleResetApp} />
}