interface VisualModeProps {
  onReset: () => void
}

export default function VisualMode({ onReset }: VisualModeProps) {
  return (
    <div className="w-[350px] h-[550px] p-6 bg-slate-50 flex flex-col font-sans relative">
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-xl font-bold text-blue-700">Visual Mode</h1>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Text-to-Speech and screen navigation controls.
      </p>

      <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-6 bg-white">
        <p className="text-slate-400 text-sm">Web Speech API Controls Pending</p>
      </div>

      <button 
        onClick={onReset}
        className="w-full py-3 bg-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-300 transition-colors mt-auto"
      >
        Switch Accessibility Mode
      </button>
    </div>
  )
}