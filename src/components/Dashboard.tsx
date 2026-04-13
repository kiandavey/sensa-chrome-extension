import VisualMode from "./VisualMode"
import AuditoryMode from "./AuditoryMode"

interface DashboardProps {
  selectedMode: string | null
  onReset: () => void
}

export default function Dashboard({ selectedMode, onReset }: DashboardProps) {
  if (selectedMode === "visual") {
    return <VisualMode onReset={onReset} />
  }

  if (selectedMode === "auditory") {
    return <AuditoryMode onReset={onReset} />
  }

  return (
    <div className="w-[350px] h-[550px] flex flex-col items-center justify-center">
      <p className="text-red-500 mb-4">Error: No mode selected.</p>
      <button onClick={onReset} className="px-4 py-2 bg-slate-200 rounded">Go Back</button>
    </div>
  )
}