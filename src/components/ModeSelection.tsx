interface ModeSelectionProps {
  onSelectMode: (mode: string) => void
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="w-[350px] h-[550px] p-6 bg-white flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Choose your mode:</h1>
      <button
        onClick={() => onSelectMode("visual")}
        className="w-full py-3 px-4 mb-3 rounded-lg font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-blue-400"
      >
        Visual Mode
      </button>
      <button
        onClick={() => onSelectMode("auditory")}
        className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-emerald-400"
      >
        Auditory Mode
      </button>
    </div>
  )
}