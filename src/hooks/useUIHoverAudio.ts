import { useCallback, useEffect, useRef } from "react"

export function useUIHoverAudio() {
	const hoverTimeoutRef = useRef<number | null>(null)
	const isHoverSpeakingRef = useRef(false)

	const clearHoverTimeout = useCallback(() => {
		if (hoverTimeoutRef.current !== null) {
			window.clearTimeout(hoverTimeoutRef.current)
			hoverTimeoutRef.current = null
		}
	}, [])

	const cancelHoverAudio = useCallback(() => {
		clearHoverTimeout()

		// Do not cancel global speech unless the current voice is hover-owned.
		if (isHoverSpeakingRef.current) {
			window.speechSynthesis.cancel()
			isHoverSpeakingRef.current = false
		}
	}, [clearHoverTimeout])

	const playHoverAudio = useCallback(
		(text: string) => {
			if (!text.trim()) return

			clearHoverTimeout()

			hoverTimeoutRef.current = window.setTimeout(() => {
				// If another speech flow (e.g., reader playback) is active, skip hover audio.
				if ((window.speechSynthesis.speaking || window.speechSynthesis.pending) && !isHoverSpeakingRef.current) {
					hoverTimeoutRef.current = null
					return
				}

				// Stop any previous hover announcement before speaking the next one.
				window.speechSynthesis.cancel()

				const utterance = new SpeechSynthesisUtterance(text)
				utterance.onstart = () => {
					isHoverSpeakingRef.current = true
				}
				utterance.onend = () => {
					isHoverSpeakingRef.current = false
				}
				utterance.onerror = () => {
					isHoverSpeakingRef.current = false
				}

				isHoverSpeakingRef.current = true
				window.speechSynthesis.speak(utterance)
				hoverTimeoutRef.current = null
			}, 150)
		},
		[clearHoverTimeout]
	)

	useEffect(() => {
		const handlePointerDown = () => {
			clearHoverTimeout()
		}

		window.addEventListener("pointerdown", handlePointerDown, true)

		return () => {
			window.removeEventListener("pointerdown", handlePointerDown, true)
			clearHoverTimeout()
			if (isHoverSpeakingRef.current) {
				window.speechSynthesis.cancel()
				isHoverSpeakingRef.current = false
			}
		}
	}, [clearHoverTimeout])

	return { playHoverAudio, cancelHoverAudio }
}
