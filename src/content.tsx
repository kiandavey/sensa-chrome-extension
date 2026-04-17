import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useRef, useEffect } from "react"
import VisualDock from "./components/VisualDock"
import AuditoryDock from "./components/AuditoryDock"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function FloatingDockManager() {
  const [visualActive, setVisualActive] = useState(false)
  const [auditoryActive, setAuditoryActive] = useState(false)
  const [userThemePref, setUserThemePref] = useState(false) // Raw user preference
  const [isMinimized, setIsMinimized] = useState(false)
  
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  // --- THE BRIDGE ---
  useEffect(() => {
    chrome.storage.local.get(["sensa_visual_active", "sensa_auditory_active", "sensa_user_profile"], (res) => {
      setVisualActive(!!res.sensa_visual_active)
      setAuditoryActive(!!res.sensa_auditory_active)
      if (res.sensa_user_profile?.globalSettings?.theme === "dark") setUserThemePref(true)
    })

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.sensa_visual_active !== undefined) setVisualActive(changes.sensa_visual_active.newValue)
      if (changes.sensa_auditory_active !== undefined) setAuditoryActive(changes.sensa_auditory_active.newValue)
      if (changes.sensa_user_profile !== undefined) {
        setUserThemePref(changes.sensa_user_profile.newValue.globalSettings.theme === "dark")
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  // --- DRAG PHYSICS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y })
    }
    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])


  // --- RENDER LOGIC & THEME SCOPING ---
  if (!visualActive && !auditoryActive) return null

  // THEME SCOPING LOGIC: 
  // If Visual Mode is active, FORCE isDark to false. 
  // Otherwise, respect the user's theme preference.
  const isDark = visualActive ? false : userThemePref

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate(calc(0px + ${position.x}px), calc(-50% + ${position.y}px))`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="fixed right-4 top-1/2 z-[99999] font-sans"
    >
      {visualActive && (
        <VisualDock 
          isDark={isDark} // This will always be false now!
          isMinimized={isMinimized} 
          onMinimizeToggle={() => setIsMinimized(!isMinimized)} 
          onClose={() => {
            setVisualActive(false)
            chrome.storage.local.set({ sensa_visual_active: false })
          }} 
        />
      )}

      {auditoryActive && !visualActive && (
        <AuditoryDock 
          isDark={isDark} // This will respect the user's choice
          isMinimized={isMinimized} 
          onMinimizeToggle={() => setIsMinimized(!isMinimized)} 
          onClose={() => {
            setAuditoryActive(false)
            chrome.storage.local.set({ sensa_auditory_active: false })
          }} 
        />
      )}
    </div>
  )
}