import React, { useEffect, useState, useRef } from "react"
import ColorPickerPopup from "./ColorPickerPopup"

interface AuditorySettingsModalProps {
	isDark: boolean
	onClose: () => void
}

interface AuditorySettingsState {
	fontFamily: string
	showOriginalText: boolean
	textColor: string
	captionBgColor: string
	outputDevice: string
}

const DEFAULT_SETTINGS: AuditorySettingsState = {
	fontFamily: "Arial",
	showOriginalText: true,
	textColor: "#000000",
	captionBgColor: "#FFFFFF",
	outputDevice: "Default - Speaker"
}

export default function AuditorySettingsModal({ isDark, onClose }: AuditorySettingsModalProps) {
	const [settings, setSettings] = useState<AuditorySettingsState>(DEFAULT_SETTINGS)
	const [activeColorPicker, setActiveColorPicker] = useState<"text" | "bg" | null>(null)

	// Draggable/persisted position
	const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [initialOffsetLoaded, setInitialOffsetLoaded] = useState(false)
	const offsetRef = useRef(offset)
	const draggingRef = useRef(false)
	const dragStartRef = useRef({ x: 0, y: 0 })
	const offsetStartRef = useRef({ x: 0, y: 0 })

	useEffect(() => {
		offsetRef.current = offset
	}, [offset])

	useEffect(() => {
		chrome.storage.local.get(["sensa_auditory_settings_offset"], (result) => {
			if (result.sensa_auditory_settings_offset) {
				setOffset(result.sensa_auditory_settings_offset)
			}
			setInitialOffsetLoaded(true)
		})
	}, [])

	useEffect(() => {
		const onMove = (ev: MouseEvent) => {
			if (!draggingRef.current) return
			const dx = ev.clientX - dragStartRef.current.x
			const dy = ev.clientY - dragStartRef.current.y
			setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy })
		}

		const onUp = () => {
			if (!draggingRef.current) return
			draggingRef.current = false
			chrome.storage.local.set({ sensa_auditory_settings_offset: offsetRef.current })
		}

		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
		return () => {
			window.removeEventListener("mousemove", onMove)
			window.removeEventListener("mouseup", onUp)
		}
	}, [])

	const onHeaderMouseDown = (e: React.MouseEvent) => {
		// Prevent starting drag when interacting with form controls
		const target = e.target as HTMLElement
		if (target.closest("button, input, select, textarea")) return
		e.preventDefault()
		draggingRef.current = true
		dragStartRef.current = { x: e.clientX, y: e.clientY }
		offsetStartRef.current = { x: offsetRef.current.x, y: offsetRef.current.y }
	}

	useEffect(() => {
		chrome.storage.local.get(["sensa_auditory_settings"], (result) => {
			if (result.sensa_auditory_settings) {
				setSettings({ ...DEFAULT_SETTINGS, ...result.sensa_auditory_settings })
			}
		})
	}, [])

	const persistSettings = (updates: Partial<AuditorySettingsState>) => {
		setSettings((current) => {
			const next = { ...current, ...updates }
			chrome.storage.local.set({ sensa_auditory_settings: next })
			return next
		})
	}

	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) onClose()
	}

	const panelClass = isDark
		? "bg-gray-950 text-gray-100 border-[#FF7A2F]"
		: "bg-white text-black border-[#FF7A2F]"

	const fieldClass = isDark
		? "bg-gray-900 border-gray-700 text-gray-100"
		: "bg-white border-gray-300 text-gray-800"
	const selectChevronClass = isDark ? "text-gray-400" : "text-gray-500"

	return (
		<div onClick={handleBackdropClick} className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 backdrop-blur-sm font-sans px-[16px]">
			<div
				className={`relative w-full max-w-[420px] rounded-[34px] border-[3px] p-[28px] shadow-2xl ${panelClass}`}
				onMouseDown={onHeaderMouseDown}
				style={{
					transform: `translate(${offset.x}px, ${offset.y}px)`,
					cursor: "grab",
					visibility: initialOffsetLoaded ? "visible" : "hidden"
				}}
			>
				<h2 className="text-[28px] font-bold mb-[28px] tracking-tight">Settings</h2>

				<button
					onClick={onClose}
					className={`absolute top-[24px] right-[24px] transition-colors focus:outline-none ${isDark ? "text-gray-100 hover:text-gray-300" : "text-black hover:text-gray-500"}`}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px]">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>

				<div className="flex flex-col gap-[20px]">
					<div className="flex items-center justify-between gap-[16px]">
						<span className="text-[17px] font-medium">Font</span>
						<div className="relative w-[150px]">
							<select
								value={settings.fontFamily}
								onChange={(event) => persistSettings({ fontFamily: event.target.value })}
								className={`appearance-none w-full border rounded-xl text-[14px] px-[12px] py-[8px] pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#FF7A2F] ${fieldClass}`}
							>
								<option>Arial</option>
								<option>Helvetica</option>
								<option>Georgia</option>
								<option>Times New Roman</option>
								<option>Verdana</option>
							</select>
							<div className={`pointer-events-none absolute inset-y-0 right-[12px] flex items-center ${selectChevronClass}`}>
								<svg className="fill-current h-[16px] w-[16px]" viewBox="0 0 20 20"><path d="M5.23 7.21L10 11.98l4.77-4.77 1.06 1.06L10 14.11 4.17 8.27z" /></svg>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between gap-[16px]">
						<span className="text-[17px] font-medium">Show Original Text</span>
						<div className="w-[150px] flex justify-start pl-1">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={settings.showOriginalText}
									onChange={(event) => persistSettings({ showOriginalText: event.target.checked })}
								/>
								<div className="w-[48px] h-[24px] bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#FF7A2F] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-[26px]"></div>
							</label>
						</div>
					</div>

					<div className="flex items-center justify-between gap-[16px]">
						<span className="text-[17px] font-medium">Text Color</span>
						<div className="w-[150px] flex justify-start pl-1 relative">
							<div className="relative h-[32px] w-[32px] flex items-center justify-center">
								<button
									type="button"
									onMouseDown={(event) => event.stopPropagation()}
									onClick={(event) => {
										event.stopPropagation()
										setActiveColorPicker((current) => (current === "text" ? null : "text"))
									}}
									className={`h-[32px] w-[32px] rounded-full border shadow-sm ${isDark ? "border-gray-500" : "border-black"}`}
									style={{ backgroundColor: settings.textColor }}
									aria-label="Pick text color"
								/>
								{activeColorPicker === "text" && (
									<ColorPickerPopup
										isDark={isDark}
										accent="orange"
										initialColor={settings.textColor}
										onColorChange={(color) => persistSettings({ textColor: color })}
										onClose={() => setActiveColorPicker(null)}
									/>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between gap-[16px]">
						<span className="text-[17px] font-medium">Caption BG Color</span>
						<div className="w-[150px] flex justify-start pl-1 relative">
							<div className="relative h-[32px] w-[32px] flex items-center justify-center">
								<button
									type="button"
									onMouseDown={(event) => event.stopPropagation()}
									onClick={(event) => {
										event.stopPropagation()
										setActiveColorPicker((current) => (current === "bg" ? null : "bg"))
									}}
									className={`h-[32px] w-[32px] rounded-full border shadow-sm ${isDark ? "border-gray-500" : "border-black"}`}
									style={{ backgroundColor: settings.captionBgColor }}
									aria-label="Pick caption background color"
								/>
								{activeColorPicker === "bg" && (
									<ColorPickerPopup
										isDark={isDark}
										accent="orange"
										initialColor={settings.captionBgColor}
										onColorChange={(color) => persistSettings({ captionBgColor: color })}
										onClose={() => setActiveColorPicker(null)}
									/>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between gap-[16px]">
						<span className="text-[17px] font-medium">Output Device</span>
						<div className="relative w-[150px]">
							<select
								value={settings.outputDevice}
								onChange={(event) => persistSettings({ outputDevice: event.target.value })}
								className={`appearance-none w-full border rounded-xl text-[12px] px-[12px] py-[8px] pr-[40px] focus:outline-none focus:ring-2 focus:ring-[#FF7A2F] ${fieldClass}`}
							>
								<option>Default - Speaker</option>
								<option>Bluetooth Headset</option>
								<option>External Speaker</option>
							</select>
							<div className={`pointer-events-none absolute inset-y-0 right-[12px] flex items-center ${selectChevronClass}`}>
								<svg className="fill-current h-[16px] w-[16px]" viewBox="0 0 20 20"><path d="M5.23 7.21L10 11.98l4.77-4.77 1.06 1.06L10 14.11 4.17 8.27z" /></svg>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-[40px] flex justify-center">
					<button
						onClick={() => {
							chrome.storage.local.set({ sensa_auditory_settings: DEFAULT_SETTINGS })
							setSettings(DEFAULT_SETTINGS)
						}}
						className="bg-[#FF7A2F] hover:bg-[#F26A1B] text-white font-bold py-[12px] px-[32px] rounded-full transition-colors shadow-md text-[14px]"
					>
						Reset to default
					</button>
				</div>
			</div>
		</div>
	)
}
