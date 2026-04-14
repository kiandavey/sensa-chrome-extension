import { useState, useEffect } from "react"
import "./style.css"
import ModeSelection from "./components/ModeSelection"
import WelcomeOverlay from "./components/WelcomeOverlay"
import Dashboard from "./components/Dashboard"

// Import our new database schema
import type { SensaUserProfile } from "./lib/storage"
import { DEFAULT_PROFILE } from "./lib/storage"

export default function IndexPopup() {
  const [currentView, setCurrentView] = useState<"LOADING" | "MODE_SELECTION" | "WELCOME" | "DASHBOARD">("LOADING")
  const [userProfile, setUserProfile] = useState<SensaUserProfile | null>(null)

  // 1. Boot up: Load the full JSON profile from the database
  useEffect(() => {
    chrome.storage.local.get(["sensa_user_profile"], (result) => {
      if (result.sensa_user_profile) {
        const profile = result.sensa_user_profile as SensaUserProfile
        setUserProfile(profile)
        
        // Routing logic based on the nested JSON data
        if (!profile.globalSettings.activeMode) {
          setCurrentView("MODE_SELECTION")
        } else if (!profile.globalSettings.hasSeenWelcome) {
          setCurrentView("WELCOME")
        } else {
          setCurrentView("DASHBOARD")
        }
      } else {
        // First time ever? Save the default profile to the database!
        chrome.storage.local.set({ sensa_user_profile: DEFAULT_PROFILE }, () => {
          setUserProfile(DEFAULT_PROFILE)
          setCurrentView("MODE_SELECTION")
        })
      }
    })
  }, [])

  // 2. Helper function to safely update the nested JSON database
  const updateProfile = (updates: Partial<SensaUserProfile>) => {
    if (!userProfile) return
    const newProfile = { ...userProfile, ...updates }
    
    chrome.storage.local.set({ sensa_user_profile: newProfile }, () => {
      setUserProfile(newProfile)
    })
  }

  // 3. UI Handlers
  const handleSelectMode = (mode: "visual" | "auditory") => {
    updateProfile({
      globalSettings: { ...userProfile!.globalSettings, activeMode: mode }
    })
    setCurrentView("WELCOME")
  }

  const handleGetStarted = () => {
    updateProfile({
      globalSettings: { ...userProfile!.globalSettings, hasSeenWelcome: true }
    })
    setCurrentView("DASHBOARD")
  }

  const handleResetApp = () => {
    chrome.storage.local.set({ sensa_user_profile: DEFAULT_PROFILE }, () => {
      setUserProfile(DEFAULT_PROFILE)
      setCurrentView("MODE_SELECTION")
    })
  }

  // --- THE ROUTER ---
  if (currentView === "LOADING" || !userProfile) {
    return <div className="w-[350px] h-[550px] bg-white flex items-center justify-center">Loading Data...</div>
  }
  
  if (currentView === "MODE_SELECTION") return <ModeSelection onSelectMode={handleSelectMode} />
  
  if (currentView === "WELCOME") return <WelcomeOverlay onGetStarted={handleGetStarted} />
  
  if (currentView === "DASHBOARD") return <Dashboard selectedMode={userProfile.globalSettings.activeMode} onReset={handleResetApp} />
}