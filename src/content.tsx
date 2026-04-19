import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useRef, useEffect } from "react"
import VisualDock from "./components/VisualDock"
import AuditoryDock from "./components/AuditoryDock"
import VisualSettingsModal from "./components/VisualSettingsModal" // NEW IMPORT
import AuditorySettingsModal from "./components/AuditorySettingsModal"
import ReadingSpeedOverlay from "./components/ReadingSpeedOverlay"
import CaptionLanguageOverlay from "./components/CaptionLanguageOverlay"
import TextSizeOverlay from "./components/TextSizeOverlay"
import CaptionTransparencyOverlay from "./components/CaptionTransparencyOverlay"
import FocusModeOverlay from "./components/FocusModeOverlay"
import type { SensaUserProfile } from "./lib/storage"

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
  const [isAuditorySettingsOpen, setIsAuditorySettingsOpen] = useState(false)
  const [isCaptionLanguageOpen, setIsCaptionLanguageOpen] = useState(false)
  const [isTextSizeOpen, setIsTextSizeOpen] = useState(false)
  const [isCaptionTransparencyOpen, setIsCaptionTransparencyOpen] = useState(false)
  const [captionLanguage, setCaptionLanguage] = useState("en-US")
  const [textSize, setTextSize] = useState(32)
  const [captionTransparency, setCaptionTransparency] = useState(75)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isReadingSpeedOpen, setIsReadingSpeedOpen] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState(1)
  
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  // --- THE BRIDGE ---
  useEffect(() => {
    chrome.storage.local.get(["sensa_visual_active", "sensa_auditory_active", "sensa_user_profile", "sensa_visual_reading_speed", "sensa_auditory_caption_language", "sensa_auditory_text_size", "sensa_auditory_caption_transparency", "sensa_auditory_focus_mode"], (res) => {
      setVisualActive(!!res.sensa_visual_active)
      setAuditoryActive(!!res.sensa_auditory_active)
      if (res.sensa_user_profile?.globalSettings?.theme === "dark") setUserThemePref(true)
      if (typeof res.sensa_auditory_caption_language === "string") setCaptionLanguage(res.sensa_auditory_caption_language)
      if (typeof res.sensa_auditory_text_size === "number") setTextSize(res.sensa_auditory_text_size)
      if (typeof res.sensa_auditory_caption_transparency === "number") setCaptionTransparency(res.sensa_auditory_caption_transparency)
      if (typeof res.sensa_auditory_focus_mode === "boolean") setIsFocusMode(res.sensa_auditory_focus_mode)
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
      if (changes.sensa_auditory_active !== undefined) {
        setAuditoryActive(changes.sensa_auditory_active.newValue)
        if (!changes.sensa_auditory_active.newValue) {
          setIsAuditorySettingsOpen(false)
          setIsCaptionLanguageOpen(false)
          setIsTextSizeOpen(false)
          setIsCaptionTransparencyOpen(false)
        }
      }
      if (changes.sensa_auditory_caption_language !== undefined && typeof changes.sensa_auditory_caption_language.newValue === "string") {
        setCaptionLanguage(changes.sensa_auditory_caption_language.newValue)
      }
      if (changes.sensa_auditory_text_size !== undefined && typeof changes.sensa_auditory_text_size.newValue === "number") {
        setTextSize(changes.sensa_auditory_text_size.newValue)
      }
      if (changes.sensa_auditory_caption_transparency !== undefined && typeof changes.sensa_auditory_caption_transparency.newValue === "number") {
        setCaptionTransparency(changes.sensa_auditory_caption_transparency.newValue)
      }
      if (changes.sensa_auditory_focus_mode !== undefined && typeof changes.sensa_auditory_focus_mode.newValue === "boolean") {
        setIsFocusMode(changes.sensa_auditory_focus_mode.newValue)
      }
      if (changes.sensa_user_profile !== undefined) {
        const nextProfile = changes.sensa_user_profile.newValue as SensaUserProfile
        setUserThemePref(nextProfile.globalSettings.theme === "dark")

        const nextMode = nextProfile.globalSettings.activeMode
        if (nextMode === "visual") {
          setAuditoryActive(false)
          setIsAuditorySettingsOpen(false)
          setIsCaptionLanguageOpen(false)
          setIsTextSizeOpen(false)
          setIsCaptionTransparencyOpen(false)
          chrome.storage.local.set({ sensa_auditory_active: false })
        } else if (nextMode === "auditory") {
          setVisualActive(false)
          setIsVisualSettingsOpen(false)
          setIsReadingSpeedOpen(false)
          chrome.storage.local.set({ sensa_visual_active: false })
        } else {
          setVisualActive(false)
          setAuditoryActive(false)
          setIsVisualSettingsOpen(false)
          setIsAuditorySettingsOpen(false)
          setIsCaptionLanguageOpen(false)
          setIsTextSizeOpen(false)
          setIsCaptionTransparencyOpen(false)
          setIsReadingSpeedOpen(false)
          chrome.storage.local.set({ sensa_visual_active: false, sensa_auditory_active: false })
        }
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

      {isAuditorySettingsOpen && (
        <AuditorySettingsModal
          isDark={isDark}
          onClose={() => setIsAuditorySettingsOpen(false)}
        />
      )}

      {isCaptionLanguageOpen && (
        <CaptionLanguageOverlay
          isDark={isDark}
          initialLanguage={captionLanguage}
          onLanguageChange={(language) => {
            setCaptionLanguage(language)
            chrome.storage.local.set({ sensa_auditory_caption_language: language })
          }}
          onClose={() => setIsCaptionLanguageOpen(false)}
        />
      )}

      {isTextSizeOpen && (
        <TextSizeOverlay
          isDark={isDark}
          initialSize={textSize}
          onSizeChange={(size) => {
            setTextSize(size)
            chrome.storage.local.set({ sensa_auditory_text_size: size })
          }}
          onClose={() => setIsTextSizeOpen(false)}
        />
      )}

      {isCaptionTransparencyOpen && (
        <CaptionTransparencyOverlay
          isDark={isDark}
          initialTransparency={captionTransparency}
          onTransparencyChange={(value) => {
            setCaptionTransparency(value)
            chrome.storage.local.set({ sensa_auditory_caption_transparency: value })
          }}
          onClose={() => setIsCaptionTransparencyOpen(false)}
        />
      )}

      {auditoryActive && !visualActive && isFocusMode && <FocusModeOverlay intensity={0.7} />}

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
            onOpenCaptionLanguage={() => setIsCaptionLanguageOpen(true)}
            onOpenTextSize={() => setIsTextSizeOpen(true)}
            onOpenCaptionTransparency={() => setIsCaptionTransparencyOpen(true)}
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => {
              const next = !isFocusMode
              setIsFocusMode(next)
              chrome.storage.local.set({ sensa_auditory_focus_mode: next })
            }}
            onOpenSettings={() => setIsAuditorySettingsOpen(true)}
            onClose={() => {
              setAuditoryActive(false)
              setIsCaptionLanguageOpen(false)
              setIsTextSizeOpen(false)
              setIsCaptionTransparencyOpen(false)
              chrome.storage.local.set({ sensa_auditory_active: false })
            }} 
          />
        )}
      </div>
    </>
  )
}