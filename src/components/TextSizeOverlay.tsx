import { useEffect, useState } from "react"

interface TextSizeOverlayProps {
	isDark: boolean
	onClose: () => void
	initialSize?: number
	onSizeChange?: (size: number) => void
}

export default function TextSizeOverlay({ isDark, onClose, initialSize = 32, onSizeChange }: TextSizeOverlayProps) {
	const [fontSize, setFontSize] = useState(initialSize)
	const [sizeInput, setSizeInput] = useState(String(initialSize))

	useEffect(() => {
		setFontSize(initialSize)
		setSizeInput(String(initialSize))
	}, [initialSize])

	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) onClose()
	}

	const decrease = () => {
		setFontSize((prev) => {
			const next = Math.max(12, prev - 2)
			setSizeInput(String(next))
			return next
		})
	}

	const increase = () => {
		setFontSize((prev) => {
			const next = Math.min(72, prev + 2)
			setSizeInput(String(next))
			return next
		})
	}

	const handleInputChange = (value: string) => {
		if (!/^\d{0,2}$/.test(value)) return
		if (value !== "" && Number.parseInt(value, 10) > 72) return

		setSizeInput(value)
		if (value === "") return
		setFontSize(Number.parseInt(value, 10))
	}

	const normalizeInput = () => {
		if (sizeInput === "") {
			setFontSize(12)
			setSizeInput("12")
			return
		}

		const parsed = Number.parseInt(sizeInput, 10)
		const normalized = Math.min(72, Math.max(12, parsed))
		setFontSize(normalized)
		setSizeInput(String(normalized))
	}

	const panelClass = isDark
		? "bg-gray-950 text-gray-100 border-[#FF7A2F]"
		: "bg-white text-black border-[#FF7A2F]"

	return (
		<div onClick={handleBackdropClick} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 backdrop-blur-sm font-sans px-4">
			<div className={`relative w-full max-w-[420px] rounded-[34px] border-[3px] p-7 shadow-2xl ${panelClass}`}>
				<h2 className="text-[38px] leading-none font-bold mb-7 tracking-tight">Font Size</h2>

				<button
					onClick={onClose}
					className={`absolute top-6 right-6 transition-colors focus:outline-none ${isDark ? "text-gray-100 hover:text-gray-300" : "text-black hover:text-gray-500"}`}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>

				<div className={`rounded-[12px] border px-4 h-[140px] flex items-center justify-center mb-8 ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}`}>
					<span style={{ fontSize: `${fontSize}px` }} className={`leading-none transition-all ${isDark ? "text-gray-300" : "text-gray-500"}`}>
						Resize Me
					</span>
				</div>

				<div className="flex items-center justify-center gap-5">
					<button
						onClick={decrease}
						className="w-12 h-12 rounded-full bg-[#F6A52D] hover:bg-[#EA981E] text-white text-[34px] leading-none flex items-center justify-center pb-[2px] transition-colors"
					>
						-
					</button>

					<div className={`w-[120px] h-[92px] rounded-[12px] border flex items-center justify-center px-2 ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}`}>
						<input
							type="text"
							inputMode="numeric"
							value={sizeInput}
							onChange={(event) => handleInputChange(event.target.value)}
							onBlur={normalizeInput}
							className={`w-full bg-transparent text-center text-[48px] leading-none font-medium outline-none ${isDark ? "text-gray-100" : "text-black"}`}
							aria-label="Text size"
						/>
					</div>

					<button
						onClick={increase}
						className="w-12 h-12 rounded-full bg-[#F6A52D] hover:bg-[#EA981E] text-white text-[34px] leading-none flex items-center justify-center pb-[2px] transition-colors"
					>
						+
					</button>
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<button
						onClick={onClose}
						className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
					>
						Cancel
					</button>
					<button
						onClick={() => {
							normalizeInput()
							const normalized = sizeInput === ""
								? 12
								: Math.min(72, Math.max(12, Number.parseInt(sizeInput, 10)))
							onSizeChange?.(normalized)
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
