import React, { useState } from "react"
import ColorPickerPopup from "./ColorPickerPopup"
import { useUIHoverAudio } from "../hooks/useUIHoverAudio"

interface VisualSettingsModalProps {
  onClose: () => void
}

export default function VisualSettingsModal({ onClose }: VisualSettingsModalProps) {
  const { playHoverAudio, cancelHoverAudio } = useUIHoverAudio()
  // State to track if the color picker bubble is visible
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [highlightColor, setHighlightColor] = useState("#FFFE00")
  const getHoverHandlers = (label: string) => ({
    onMouseEnter: () => playHoverAudio(label),
    onMouseLeave: cancelHoverAudio
  })

  React.useEffect(() => {
    chrome.storage.local.get(["sensa_visual_highlight_color"], (res) => {
      if (typeof res.sensa_visual_highlight_color === "string") {
        setHighlightColor(res.sensa_visual_highlight_color)
      }
    })
  }, [])

  const handleHighlightChange = (color: string) => {
    setHighlightColor(color)
    chrome.storage.local.set({ sensa_visual_highlight_color: color })
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans">
      
      {/* Modal Container */}
      <div className="relative w-[440px] bg-white rounded-[40px] border-[3px] border-[#0A44FF] p-8 shadow-2xl text-black">
        
        {/* Header */}
        <h2 className="text-[28px] font-bold mb-8 tracking-tight">Settings</h2>
        
        {/* Close Button (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:text-gray-500 transition-colors focus:outline-none"
          {...getHoverHandlers("Close")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Settings List */}
        <div className="flex flex-col gap-5">
          
          {/* Voice Guide Toggle (Left Aligned, Adjusted Circle) */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Voice Guide</span>
            <div className="w-[190px] flex justify-start pl-1">
              <label className="relative inline-flex items-center cursor-pointer" {...getHoverHandlers("Voice Guide")}>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                {/* Adjusted the after:translate-x to move the circle further right */}
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[26px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
              </label>
            </div>
          </div>

          {/* Voice Selection Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Voice Selection</span>
            <div className="relative w-[190px]">
              <select className="appearance-none w-full border border-gray-300 text-gray-700 py-2 px-3 rounded-xl text-sm focus:outline-none focus:border-[#3B82F6] cursor-pointer bg-white" {...getHoverHandlers("Voice Selection")}> 
                <option>Google US English</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Wake Word Input */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Wake Word</span>
            <div className="relative w-[190px]">
              <input 
                type="text" 
                defaultValue="Sensa" 
                className="w-full border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-xl text-sm focus:outline-none focus:border-[#3B82F6]"
                {...getHoverHandlers("Wake Word")}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
            </div>
          </div>

          {/* Highlight Color Picker (Wrapped in a relative div for the popup) */}
          <div className="flex items-center justify-between relative">
            <span className="text-[17px] font-medium">Highlight color</span>
            
            <div className="w-[190px] flex justify-start pl-1">
              {/* WRAPPER: This ensures the popup arrow perfectly aligns with the center of the button */}
              <div className="relative flex items-center justify-center">
                {/* The Color Circle Button */}
                <button 
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onMouseEnter={() => playHoverAudio("Highlight color")}
                  onMouseLeave={cancelHoverAudio}
                  onClick={(event) => {
                    event.stopPropagation()
                    setShowColorPicker((prev) => !prev)
                  }}
                  className="w-6 h-6 border border-black rounded-full cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                  style={{ backgroundColor: highlightColor }}
                  aria-label="Pick highlight color"
                />
                
                {/* The Floating Bubble (Renders if showColorPicker is true) */}
                {showColorPicker && (
                  <ColorPickerPopup
                    isDark={false}
                    initialColor={highlightColor}
                    onColorChange={handleHighlightChange}
                    onClose={() => setShowColorPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Autoscroll Reading Toggle (Left Aligned, Adjusted Circle) */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Autoscroll reading</span>
            <div className="w-[190px] flex justify-start pl-1">
              <label className="relative inline-flex items-center cursor-pointer" {...getHoverHandlers("Autoscroll reading")}>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                 {/* Adjusted the after:translate-x to move the circle further right */}
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[26px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
              </label>
            </div>
          </div>

          {/* Input Device Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Input Device</span>
            <div className="relative w-[190px]">
              <select className="appearance-none w-full border border-gray-300 text-gray-700 py-2 px-3 rounded-xl text-xs focus:outline-none focus:border-[#3B82F6] cursor-pointer bg-white" {...getHoverHandlers("Input Device")}> 
                <option>Default - Microphone</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Output Device Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-medium">Output Device</span>
            <div className="relative w-[190px]">
              <select className="appearance-none w-full border border-gray-300 text-gray-700 py-2 px-3 rounded-xl text-xs focus:outline-none focus:border-[#3B82F6] cursor-pointer bg-white" {...getHoverHandlers("Output Device")}> 
                <option>Default - Speaker</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Button */}
        <div className="mt-10 flex justify-center">
          <button className="bg-[#4338CA] hover:bg-[#3730A3] text-white font-bold py-3 px-10 rounded-full transition-colors shadow-md text-sm" {...getHoverHandlers("Reset to default")}>
            Reset to default
          </button>
        </div>

      </div>
    </div>
  )
}