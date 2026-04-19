import { useEffect, useMemo, useState } from "react"

interface CaptionLanguageOverlayProps {
	isDark: boolean
	onClose: () => void
	initialLanguage?: string
	onLanguageChange?: (language: string) => void
}

const LANGUAGE_OPTIONS = [
	{ code: "en-US", label: "English (US)" },
	{ code: "en-GB", label: "English (UK)" },
	{ code: "fil-PH", label: "Filipino (PH)" },
	{ code: "es-ES", label: "Spanish" },
	{ code: "fr-FR", label: "French" },
	{ code: "de-DE", label: "German" },
	{ code: "ja-JP", label: "Japanese" },
	{ code: "ko-KR", label: "Korean" }
]

export default function CaptionLanguageOverlay({
	isDark,
	onClose,
	initialLanguage = "en-US",
	onLanguageChange
}: CaptionLanguageOverlayProps) {
	const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage)
	const [searchTerm, setSearchTerm] = useState("")

	useEffect(() => {
		setSelectedLanguage(initialLanguage)
	}, [initialLanguage])

	const filteredLanguages = useMemo(() => {
		const needle = searchTerm.trim().toLowerCase()
		if (!needle) return LANGUAGE_OPTIONS
		return LANGUAGE_OPTIONS.filter((item) => {
			return item.label.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle)
		})
	}, [searchTerm])

	const activeLabel = useMemo(() => {
		const match = LANGUAGE_OPTIONS.find((item) => item.code === selectedLanguage)
		return match?.label ?? selectedLanguage
	}, [selectedLanguage])

	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) onClose()
	}

	const panelClass = isDark
		? "bg-gray-950 text-gray-100 border-[#FF7A2F]"
		: "bg-white text-black border-[#FF7A2F]"
	const inputClass = isDark
		? "bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500"
		: "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"

	return (
		<div onClick={handleBackdropClick} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 backdrop-blur-sm font-sans px-4">
			<div className={`relative w-full max-w-[420px] rounded-[34px] border-[3px] p-7 shadow-2xl ${panelClass}`}>
				<h2 className="text-[28px] font-bold mb-2 tracking-tight">Caption Language</h2>
				<p className={`text-sm mb-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Current: {activeLabel}</p>

				<button
					onClick={onClose}
					className={`absolute top-6 right-6 transition-colors focus:outline-none ${isDark ? "text-gray-100 hover:text-gray-300" : "text-black hover:text-gray-500"}`}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>

				<div className="mb-4">
					<input
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search language"
						className={`w-full border rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A2F] ${inputClass}`}
					/>
				</div>

				<div className={`border rounded-2xl overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
					<div className="max-h-[220px] overflow-y-auto">
						{filteredLanguages.map((language) => {
							const isSelected = language.code === selectedLanguage
							return (
								<button
									key={language.code}
									type="button"
									onClick={() => setSelectedLanguage(language.code)}
									className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
										isSelected
											? "bg-[#FF7A2F] text-white"
											: isDark
												? "bg-gray-900 text-gray-200 hover:bg-gray-800"
												: "bg-white text-gray-800 hover:bg-orange-50"
									}`}
								>
									<span className="font-medium text-sm">{language.label}</span>
									<span className={`text-xs ${isSelected ? "text-white/90" : isDark ? "text-gray-400" : "text-gray-500"}`}>{language.code}</span>
								</button>
							)
						})}

						{filteredLanguages.length === 0 && (
							<div className={`px-4 py-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								No language found.
							</div>
						)}
					</div>
				</div>

				<div className="mt-7 flex justify-end gap-3">
					<button
						onClick={onClose}
						className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
					>
						Cancel
					</button>
					<button
						onClick={() => {
							onLanguageChange?.(selectedLanguage)
							onClose()
						}}
						className="px-5 py-2 rounded-full bg-[#FF7A2F] text-sm font-semibold text-white hover:bg-[#F26A1B] transition-colors"
					>
						Apply
					</button>
				</div>
			</div>
		</div>
	)
}
