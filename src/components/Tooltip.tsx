export const Tooltip = ({ label, isRed = false, isDark = false }: { label: string, isRed?: boolean, isDark?: boolean }) => {
  const bgClass = isDark ? "bg-gray-800" : "bg-[#D1D5DB]"
  const textClass = isRed ? "text-[#CC0000]" : (isDark ? "text-gray-100" : "text-black")
  const arrowBorderClass = isDark ? "border-l-gray-800" : "border-l-[#D1D5DB]"

  return (
    <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center z-50">
      <div className={`${bgClass} px-3 py-1.5 rounded-md shadow-md font-bold text-sm whitespace-nowrap tracking-tight ${textClass}`}>
        {label}
      </div>
      <div className={`w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] ${arrowBorderClass}`}></div>
    </div>
  )
}