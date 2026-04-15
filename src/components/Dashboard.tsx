import { useState, useEffect } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import VisualMode from "./VisualMode"
import AuditoryMode from "./AuditoryMode"

interface DashboardProps {
  selectedMode: "visual" | "auditory" | null
  theme: "light" | "dark"
  onModeChange: (mode: "visual" | "auditory") => void // For persistence
  onThemeChange: (newTheme: "light" | "dark") => void // Persistent theme change
  onReset: () => void
}

// Internal state to manage view swap and direction
interface DashboardState {
  currentViewMode: "visual" | "auditory"
  previousViewMode: "visual" | "auditory" | null
  transitionClassName: string
}

export default function Dashboard({ selectedMode, theme, onModeChange, onThemeChange, onReset }: DashboardProps) {
  // 1. Local state derived from prop, managing animating view
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentViewMode: selectedMode || "visual", // Default if persistent fails
    previousViewMode: null,
    transitionClassName: "dashboard-slide-visual-to-auditory" // Default
  })

  // Handle local mode swap and call persistent update in popup.tsx
  const handleViewSwap = (newMode: "visual" | "auditory") => {
    // Determine the direction for the horizontal slide
    let animationClass = "dashboard-slide-visual-to-auditory" // Default to right-to-left
    if (newMode === "visual" && dashboardState.currentViewMode === "auditory") {
      animationClass = "dashboard-slide-auditory-to-visual" // Left-to-right
    }

    // Trigger local swap animation
    setDashboardState({
      previousViewMode: dashboardState.currentViewMode,
      currentViewMode: newMode,
      transitionClassName: animationClass
    })

    // Update persistent state in popup.tsx
    onModeChange(newMode)
  }

  // Act as a layout wrapper passing theme and reset handlers down
  return (
    <div className={`w-[350px] h-[550px] relative overflow-hidden flex flex-col items-center justify-center font-sans ${theme === "dark" ? 'bg-gray-950 text-gray-200' : 'bg-white text-black'}`}>
      
      {/* Error handling fallback */}
      {!selectedMode && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 dark:bg-gray-950 dark:text-gray-300">
          <p className="text-red-500 mb-4">Error: No mode selected.</p>
          <button onClick={onReset} className="px-4 py-2 bg-slate-200 rounded text-black hover:bg-slate-300">Go Back</button>
        </div>
      )}

      {/* -- Animating View Swapper -- */}
      <TransitionGroup className="w-full flex-1 relative">
        <CSSTransition
          key={dashboardState.currentViewMode} // Component to animate
          timeout={300} // Matches CSS transition duration
          classNames={dashboardState.transitionClassName} // CSS animation to apply
          unmountOnExit
        >
          {/* Absolutely positioned animating child views */}
          <div className="absolute inset-0 flex-1 flex flex-col">
            {dashboardState.currentViewMode === "visual" && (
              <VisualMode 
                theme={theme}
                onModeChange={handleViewSwap} // New view swap logic
                onReset={onReset} 
              />
            )}
            {dashboardState.currentViewMode === "auditory" && (
              <AuditoryMode 
                theme={theme}
                onThemeChange={onThemeChange} // Passing persistent theme handler
                onModeChange={handleViewSwap} // New view swap logic
                onReset={onReset} 
              />
            )}
          </div>
        </CSSTransition>
      </TransitionGroup>

    </div>
  )
}