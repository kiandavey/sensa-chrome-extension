import { Tooltip } from "./Tooltip"

interface AuditoryDockProps {
  isDark: boolean
  isMinimized: boolean
  onMinimizeToggle: () => void
  onOpenCaptionLanguage: () => void
  onOpenTextSize: () => void
  onOpenCaptionTransparency: () => void
  isFocusMode: boolean
  onToggleFocusMode: () => void
  onOpenSettings: () => void
  onClose: () => void
}

export default function AuditoryDock({ isDark, isMinimized, onMinimizeToggle, onOpenCaptionLanguage, onOpenTextSize, onOpenCaptionTransparency, isFocusMode, onToggleFocusMode, onOpenSettings, onClose }: AuditoryDockProps) {
  const pillBg = isDark ? "bg-gray-900" : "bg-white"
  const iconColorInactive = isDark ? "text-gray-300" : "text-black"
  const hoverInactive = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"

  return (
    <div className="flex flex-col gap-3">
      {/* TOP PILL */}
      <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#FF7A2F] shadow-lg gap-2`}>
        <button className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}>
          <Tooltip label="Audio Visualizer" isDark={isDark} />
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <rect x="5" y="9" width="2" height="6" rx="1" />
            <rect x="9" y="6" width="2" height="12" rx="1" />
            <rect x="13" y="3" width="2" height="18" rx="1" />
            <rect x="17" y="8" width="2" height="8" rx="1" />
          </svg>
        </button>

        <button className="relative group w-10 h-10 flex items-center justify-center rounded-full bg-[#FF7A2F] text-white shadow-md hover:bg-[#E86A25] transition-colors">
          <Tooltip label="Turn On Caption" isDark={isDark} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M10 10.5a2.5 2.5 0 0 0-3.5 0" />
            <path d="M10 13.5a2.5 2.5 0 0 1-3.5 0" />
            <path d="M17.5 10.5a2.5 2.5 0 0 0-3.5 0" />
            <path d="M17.5 13.5a2.5 2.5 0 0 1-3.5 0" />
          </svg>
        </button>
      </div>

      {/* MIDDLE PILL */}
      {!isMinimized && (
        <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#FF7A2F] shadow-lg gap-1.5`}>
          <button
            onClick={onOpenCaptionLanguage}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          >
            <Tooltip label="Caption Language" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </button>
          <button
            onClick={onOpenTextSize}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          >
            <Tooltip label="Text Size" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="12" y1="4" x2="12" y2="20" />
              <line x1="8" y1="20" x2="16" y2="20" />
            </svg>
          </button>
          <button
            onClick={onOpenCaptionTransparency}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          >
            <Tooltip label="Caption Transparency" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <rect x="7" y="13" width="10" height="4" rx="1" />
            </svg>
          </button>
          <button
            onClick={onToggleFocusMode}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isFocusMode ? "bg-[#FF7A2F] text-white shadow-md hover:bg-[#E86A25]" : `${hoverInactive} ${iconColorInactive}`}`}
          >
            <Tooltip label="Focus Mode" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
          >
            <Tooltip label="Settings" isDark={isDark} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      )}

      {/* BOTTOM PILL */}
      <div className={`flex flex-col items-center ${pillBg} rounded-full p-1.5 border-2 border-[#FF7A2F] shadow-lg gap-2`}>
        <button 
          onClick={onMinimizeToggle}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
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
          onClick={onClose}
          className={`relative group w-10 h-10 flex items-center justify-center rounded-full ${hoverInactive} transition-colors ${iconColorInactive}`}
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