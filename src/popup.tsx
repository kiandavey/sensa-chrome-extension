import { useState, useEffect } from "react"
import "./style.css"
import ModeSelection from "./components/ModeSelection"
import WelcomeOverlay from "./components/WelcomeOverlay"
import Dashboard from "./components/Dashboard"
import type { SensaUserProfile } from "./lib/storage"
import { DEFAULT_PROFILE } from "./lib/storage"

export default function IndexPopup() {
  const [currentView, setCurrentView] = useState<"LOADING" | "MODE_SELECTION" | "WELCOME" | "DASHBOARD">("LOADING")
  const [userProfile, setUserProfile] = useState<SensaUserProfile | null>(null)
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light") // Persistable theme state

  // 1. Boot up and load persistent data
  useEffect(() => {
    chrome.storage.local.get(["sensa_user_profile"], (result) => {
      if (result.sensa_user_profile) {
        const profile = result.sensa_user_profile as SensaUserProfile
        setUserProfile(profile)
        setCurrentTheme(profile.globalSettings.theme) // Load current theme
        
        // Routing logic based on loaded profile
        if (!profile.globalSettings.activeMode) {
          setCurrentView("MODE_SELECTION")
        } else if (!profile.globalSettings.hasSeenWelcome) {
          setCurrentView("WELCOME")
        } else {
          setCurrentView("DASHBOARD")
        }
      } else {
        // First time initialization
        chrome.storage.local.set({ sensa_user_profile: DEFAULT_PROFILE }, () => {
          setUserProfile(DEFAULT_PROFILE)
          setCurrentTheme(DEFAULT_PROFILE.globalSettings.theme)
          setCurrentView("MODE_SELECTION")
        })
      }
    })
  }, [])

  // 2. Safely update persistent JSON database
  const updateProfile = (updates: Partial<SensaUserProfile>) => {
    if (!userProfile) return
    const newProfile = { ...userProfile, ...updates }
    chrome.storage.local.set({ sensa_user_profile: newProfile }, () => {
      setUserProfile(newProfile)
    })
  }

  // 3. UI Handlers with persistent save
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

  // Handle persistent theme change
  const handleThemeChange = (newTheme: "light" | "dark") => {
    updateProfile({
      globalSettings: { ...userProfile!.globalSettings, theme: newTheme }
    })
    setCurrentTheme(newTheme) // Set local state for immediate update
  }

  const handleResetApp = () => {
    chrome.storage.local.set({ sensa_user_profile: DEFAULT_PROFILE }, () => {
      setUserProfile(DEFAULT_PROFILE)
      setCurrentTheme(DEFAULT_PROFILE.globalSettings.theme)
      setCurrentView("MODE_SELECTION")
    })
  }

  // --- THE ROUTER ---
  if (currentView === "LOADING" || !userProfile) {
    return <div className="w-[350px] h-[550px] bg-white flex items-center justify-center dark:bg-gray-950 dark:text-gray-300">Loading Data...</div>
  }
  
  if (currentView === "MODE_SELECTION") return <ModeSelection theme={currentTheme} onSelectMode={handleSelectMode} />
  
  if (currentView === "WELCOME") return <WelcomeOverlay theme={currentTheme} onGetStarted={handleGetStarted} />
  
  // Dashboard is now an animating view manger. It calls popup.tsx for persistence
  if (currentView === "DASHBOARD") return <Dashboard 
    selectedMode={userProfile.globalSettings.activeMode}
    theme={currentTheme}
    onThemeChange={handleThemeChange} // Persistent theme handler
    onReset={handleResetApp} onModeChange={function (mode: "visual" | "auditory"): void {
      throw new Error("Function not implemented.")
    } }  />
}