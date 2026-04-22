import React from "react"
import { Tooltip } from "./Tooltip"
import { useUIHoverAudio } from "../hooks/useUIHoverAudio"

interface VisualDockProps {
  isDark: boolean
  isMinimized: boolean
  readingSpeed: number
  isPlaying: boolean
  isPaused: boolean
  isVoiceCommandActive: boolean
  canRestart: boolean
  onTogglePlay: () => void
  onToggleVoiceCommand: () => void
  onNext: () => void
  onPrev: () => void
  onRestart: () => void
  onMinimizeToggle: () => void
  onOpenReadingSpeed: () => void
  onOpenSettings: () => void
  onClose: () => void
}

export default function VisualDock({
  isDark,
  isMinimized,
  readingSpeed,
  isPlaying,
  isPaused,
  isVoiceCommandActive,
  canRestart,
  onTogglePlay,
  onToggleVoiceCommand,
  onNext,
  onPrev,
  onRestart,
  onMinimizeToggle,
  onOpenReadingSpeed,
  onOpenSettings,
  onClose,
}: VisualDockProps) {
  const { playHoverAudio, cancelHoverAudio } = useUIHoverAudio()
  const pillBg = isDark ? "bg-gray-900" : "bg-white"
  const iconColorInactive = isDark ? "text-gray-300" : "text-black"
  const hoverInactive = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
  const readingSpeedLabel = `${readingSpeed.toFixed(2).replace(/\.00$/, "")}X`
  const getHoverHandlers = (label: string) => ({
    onMouseEnter: () => playHoverAudio(label),
    onMouseLeave: cancelHoverAudio
  })

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#0A44FF] shadow-lg gap-2`}>
        <button type="button" className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`} {...getHoverHandlers("Audio Visualizer")}>
          <Tooltip label="Audio Visualizer" isDark={isDark} />
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <rect x="5" y="9" width="2" height="6" rx="1" />
            <rect x="9" y="6" width="2" height="12" rx="1" />
            <rect x="13" y="3" width="2" height="18" rx="1" />
            <rect x="17" y="8" width="2" height="8" rx="1" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleVoiceCommand}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md transition-colors ${isVoiceCommandActive ? "bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" : "bg-[#0A44FF] hover:bg-blue-700"}`}
          aria-label="Speak"
          {...getHoverHandlers(isVoiceCommandActive ? "Stop Listening" : "Speak")}
        >
          <Tooltip label={isVoiceCommandActive ? "Stop Listening" : "Speak"} isDark={isDark} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>
      </div>

      {!isMinimized && (
        <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#0A44FF] shadow-lg gap-1.5`}>
          <button
            type="button"
            onClick={onTogglePlay}
            className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-[#0A44FF] text-white shadow-md hover:bg-blue-700 transition-colors"
            aria-label={isPlaying && !isPaused ? "Pause speech" : "Play speech"}
            {...getHoverHandlers(isPlaying && !isPaused ? "Pause" : "Play")}
          >
            <Tooltip label={isPlaying && !isPaused ? "Pause" : "Play"} isDark={isDark} />
            {isPlaying && !isPaused ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <rect x="7" y="5" width="4" height="14" rx="1" />
                <rect x="13" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
            aria-label="Next segment"
            {...getHoverHandlers("Next")}
          >
            <Tooltip label="Next" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onPrev}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
            aria-label="Previous segment"
            {...getHoverHandlers("Previous")}
          >
            <Tooltip label="Previous" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onRestart}
            disabled={!canRestart}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive} ${canRestart ? "" : "opacity-40 cursor-not-allowed hover:bg-transparent"}`}
            aria-label="Restart from beginning"
            {...getHoverHandlers("Restart")}
          >
            <Tooltip label="Restart" isDark={isDark} />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <polyline points="21 3 21 8 16 8" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onOpenReadingSpeed}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive} font-extrabold text-sm`}
            {...getHoverHandlers("Reading Speed")}
          >
            <Tooltip label="Reading Speed" isDark={isDark} />
            {readingSpeedLabel}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
            {...getHoverHandlers("Settings")}
          >
            <Tooltip label="Settings" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#0A44FF] shadow-lg gap-2`}>
        <button
          type="button"
          onClick={onMinimizeToggle}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          {...getHoverHandlers(isMinimized ? "Expand" : "Minimize")}
        >
          <Tooltip label={isMinimized ? "Expand" : "Minimize"} isDark={isDark} />
          {isMinimized ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="7 15 12 10 17 15" />
              <polyline points="7 9 12 4 17 9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="7 9 12 14 17 9" />
              <polyline points="7 15 12 20 17 15" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          {...getHoverHandlers("Close")}
        >
          <Tooltip label="Close" isRed isDark={isDark} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
