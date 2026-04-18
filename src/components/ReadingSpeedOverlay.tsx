import { useState } from "react"

interface ReadingSpeedOverlayProps {
  onClose: () => void
  initialSpeed?: number
  onSpeedChange?: (speed: number) => void
}

export default function ReadingSpeedOverlay({ onClose, initialSpeed = 1, onSpeedChange }: ReadingSpeedOverlayProps) {
  const [speed, setSpeed] = useState(initialSpeed)

  // Pre-defined speed stops for the pill buttons
  const speedStops = [1, 1.25, 1.5, 1.75, 2]

  const handleDecrease = () => {
    setSpeed((prev) => Math.max(0.5, prev - 0.25)) // Minimum speed 0.5x
  }

  const handleIncrease = () => {
    setSpeed((prev) => Math.min(3, prev + 0.25)) // Maximum speed 3x
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value))
  }

  const formattedSpeed = speed.toFixed(2).replace(/\.00$/, '')

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  const commitSpeed = () => {
    onSpeedChange?.(speed)
  }

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm font-sans">
      
      {/* Modal Container */}
      <div className="relative w-[400px] bg-white rounded-[40px] border-[3px] border-[#0A44FF] p-8 shadow-2xl text-black">
        
        {/* Header */}
        <h2 className="text-[28px] font-bold mb-6 tracking-tight">Reading Speed</h2>
        
        {/* Close Button (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:text-gray-500 transition-colors focus:outline-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Large Speed Display */}
        <div className="text-center mb-6">
          <span className="text-[56px] font-black tracking-tighter leading-none">
            {formattedSpeed}x
          </span>
        </div>

        {/* Main Slider Controls */}
        <div className="flex items-center gap-4 mb-10 px-2">
          {/* Minus Button */}
          <button 
            onClick={handleDecrease}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#3B82F6] hover:bg-blue-600 text-white rounded-full transition-colors focus:outline-none shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Slider */}
          <div className="flex-1 relative flex items-center">
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.05"
              value={speed}
              onChange={(e) => {
                handleSliderChange(e)
                onSpeedChange?.(parseFloat(e.target.value))
              }}
              className="reading-speed-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none"
              style={{
                // Dynamically fill the track blue before the thumb
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((speed - 0.5) / (3 - 0.5)) * 100}%, #e5e7eb ${((speed - 0.5) / (3 - 0.5)) * 100}%, #e5e7eb 100%)`
              }}
            />
            {/* Custom thumb styling using Tailwind arbitrary variants (works in most modern setups, otherwise rely on standard input styling) */}
            <style dangerouslySetInnerHTML={{ __html: `
              .reading-speed-slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                background: #3B82F6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              }
              .reading-speed-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #3B82F6;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              }
            `}} />
          </div>

          {/* Plus Button */}
          <button 
            onClick={handleIncrease}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#3B82F6] hover:bg-blue-600 text-white rounded-full transition-colors focus:outline-none shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Quick Select Pills */}
        <div className="flex justify-between gap-2">
          {speedStops.map((stop) => (
            <button
              key={stop}
              onClick={() => {
                setSpeed(stop)
                onSpeedChange?.(stop)
              }}
              className={`flex-1 py-2 rounded-full text-[15px] font-bold transition-all duration-200 ${
                speed === stop 
                  ? "bg-[#3B82F6] text-white shadow-md scale-105" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {stop}x
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              commitSpeed()
              onClose()
            }}
            className="px-5 py-2 rounded-full bg-[#3B82F6] text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  )
}