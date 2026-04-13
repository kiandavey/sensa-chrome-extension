import sensaLogo from "data-base64:../../assets/sensa-logo.png"

interface WelcomeOverlayProps {
  onGetStarted: () => void
}

export default function WelcomeOverlay({ onGetStarted }: WelcomeOverlayProps) {
  return (
    <div className="w-[350px] h-[550px] p-8 bg-white flex flex-col items-center justify-center font-sans">
      <img src={sensaLogo} alt="Sensa Logo" className="w-24 h-24 mb-6 drop-shadow-sm" />
      <h1 className="text-3xl font-extrabold text-black mb-3 tracking-tight">
        Welcome to Sensa
      </h1>
      <p className="text-sm text-slate-700 text-center mb-10 px-2 leading-relaxed">
        Your intelligent accessibility assistant<br/>for a better web experience
      </p>
      <button
        onClick={onGetStarted}
        className="bg-[#8A2BE2] text-white font-bold py-3 px-8 rounded-full shadow-[0_10px_40px_-10px_rgba(138,43,226,0.8)] hover:bg-[#7a20c9] hover:-translate-y-0.5 transition-all duration-200"
      >
        Get Started
      </button>
    </div>
  )
}