import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useRef, useEffect } from "react"
import VisualDock from "./components/VisualDock"
import AuditoryDock from "./components/AuditoryDock"
import VisualSettingsModal from "./components/VisualSettingsModal" // NEW IMPORT
import ReadingSpeedOverlay from "./components/ReadingSpeedOverlay"

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
  const [userThemePref, setUserThemePref] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  // NEW STATE: Tracks if the settings popup is open
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false) 
  const [isReadingSpeedOpen, setIsReadingSpeedOpen] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState(1)
  
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  // --- THE BRIDGE ---
  useEffect(() => {
    chrome.storage.local.get(["sensa_visual_active", "sensa_auditory_active", "sensa_user_profile", "sensa_visual_reading_speed"], (res) => {
      setVisualActive(!!res.sensa_visual_active)
      setAuditoryActive(!!res.sensa_auditory_active)
      if (res.sensa_user_profile?.globalSettings?.theme === "dark") setUserThemePref(true)
      if (typeof res.sensa_visual_reading_speed === "number") {
        setReadingSpeed(res.sensa_visual_reading_speed)
      } else if (typeof res.sensa_user_profile?.visualState?.readingSpeed === "number") {
        setReadingSpeed(res.sensa_user_profile.visualState.readingSpeed)
      }
    })

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.sensa_visual_active !== undefined) {
        setVisualActive(changes.sensa_visual_active.newValue)
        // If Visual mode gets turned off, make sure we close the settings menu too!
        if (!changes.sensa_visual_active.newValue) setIsVisualSettingsOpen(false) 
        if (!changes.sensa_visual_active.newValue) setIsReadingSpeedOpen(false)
      }
      if (changes.sensa_auditory_active !== undefined) setAuditoryActive(changes.sensa_auditory_active.newValue)
      if (changes.sensa_user_profile !== undefined) {
        setUserThemePref(changes.sensa_user_profile.newValue.globalSettings.theme === "dark")
      }
      if (changes.sensa_visual_reading_speed !== undefined && typeof changes.sensa_visual_reading_speed.newValue === "number") {
        setReadingSpeed(changes.sensa_visual_reading_speed.newValue)
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

  const isDark = visualActive ? false : userThemePref

  // Notice how the return now uses <> ... </> to group the Modal and the Dock separately
  return (
    <>
      {/* 1. THE SETTINGS MODAL (Floats dead center, outside the drag logic) */}
      {isVisualSettingsOpen && (
        <VisualSettingsModal onClose={() => setIsVisualSettingsOpen(false)} />
      )}

      {isReadingSpeedOpen && (
        <ReadingSpeedOverlay
          initialSpeed={readingSpeed}
          onSpeedChange={(newSpeed) => {
            setReadingSpeed(newSpeed)
            chrome.storage.local.set({ sensa_visual_reading_speed: newSpeed })
          }}
          onClose={() => setIsReadingSpeedOpen(false)}
        />
      )}

      {/* 2. THE DRAGGABLE DOCK */}
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
            isDark={isDark} 
            isMinimized={isMinimized} 
            onMinimizeToggle={() => setIsMinimized(!isMinimized)} 
            onOpenReadingSpeed={() => setIsReadingSpeedOpen(true)}
            onOpenSettings={() => setIsVisualSettingsOpen(true)} // Pass the command to open
            readingSpeed={readingSpeed}
            onClose={() => {
              setVisualActive(false)
              chrome.storage.local.set({ sensa_visual_active: false })
            }} 
          />
        )}

        {auditoryActive && !visualActive && (
          <AuditoryDock 
            isDark={isDark} 
            isMinimized={isMinimized} 
            onMinimizeToggle={() => setIsMinimized(!isMinimized)} 
            onClose={() => {
              setAuditoryActive(false)
              chrome.storage.local.set({ sensa_auditory_active: false })
            }} 
          />
        )}
      </div>
    </>
  )
}