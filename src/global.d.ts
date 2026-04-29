/// <reference types="chrome" />

declare module "*.css" {
	const css: string
	export default css
}

declare global {
	interface ImportMetaEnv {
		readonly VITE_GOOGLE_FONTS_API_KEY?: string
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv
	}

	interface SpeechRecognitionConstructor {
		new (): SpeechRecognition
	}

	interface SpeechRecognitionAlternative {
		transcript: string
		confidence: number
	}

	interface SpeechRecognitionResult {
		readonly length: number
		readonly isFinal: boolean
		item(index: number): SpeechRecognitionAlternative
		[index: number]: SpeechRecognitionAlternative
	}

	interface SpeechRecognitionResultList {
		readonly length: number
		item(index: number): SpeechRecognitionResult
		[index: number]: SpeechRecognitionResult
	}

	interface SpeechRecognitionEvent extends Event {
		readonly resultIndex: number
		readonly results: SpeechRecognitionResultList
	}

	interface SpeechRecognitionErrorEvent extends Event {
		readonly error: string
		readonly message: string
	}

	interface SpeechRecognition extends EventTarget {
		continuous: boolean
		interimResults: boolean
		lang: string
		onend: ((this: SpeechRecognition, ev: Event) => unknown) | null
		onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null
		onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
		start(): void
		stop(): void
		abort(): void
	}

	interface Window {
		SpeechRecognition?: SpeechRecognitionConstructor
		webkitSpeechRecognition?: SpeechRecognitionConstructor
	}
}

export {}