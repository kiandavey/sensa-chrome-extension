import { useEffect, useRef, useState } from "react"

export function useVoiceNavigation(isActive: boolean, preferredInputDeviceId = "default") {
  const [lastCommand, setLastCommand] = useState("")
  const recognitionRef = useRef<any>(null)
  const isActiveRef = useRef(isActive)
  const lastCommandAtRef = useRef(0)
  const restartTimerRef = useRef<number | null>(null)
  const inputStreamRef = useRef<MediaStream | null>(null)

  const COMMAND_COOLDOWN_MS = 700

  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      console.warn("Speech Recognition not supported in this browser.")
      return
    }

    // Stop engine if toggled off
    if (!isActive) {
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      recognitionRef.current?.stop()
      recognitionRef.current = null
      if (inputStreamRef.current) {
        inputStreamRef.current.getTracks().forEach((track) => track.stop())
        inputStreamRef.current = null
      }
      return
    }
    const ensurePreferredInputStream = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return
      if (!preferredInputDeviceId || preferredInputDeviceId === "default") return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: preferredInputDeviceId } }
        })
        inputStreamRef.current = stream
      } catch (error) {
        console.warn("Unable to access preferred input device, falling back to browser default mic.", error)
      }
    }


    const recognition = new SpeechRecognitionCtor()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true // We want instant, real-time reactions
    recognition.lang = "en-US"

    const scheduleRestart = (delay = 120) => {
      if (!isActiveRef.current) return
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current)
      }

      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null
        if (!isActiveRef.current || recognitionRef.current !== recognition) return
        try {
          recognition.start()
        } catch {
          // If start is rejected due to transient engine state, retry shortly.
          scheduleRestart(250)
        }
      }, delay)
    }

    recognition.onresult = (event: any) => {
      const now = Date.now()
      if (now - lastCommandAtRef.current < COMMAND_COOLDOWN_MS) {
        return
      }

      const currentResult = event.results[event.resultIndex]
      if (!currentResult) return

      const transcript = currentResult[0]?.transcript?.toLowerCase().trim() ?? ""
      if (!transcript) return

      setLastCommand(transcript)

      let commandExecuted = false

      // 1. Check for TOP (includes common misheard words from the Web Speech API)
      if (["top", "tap", "stop", "pop", "to up"].some(w => transcript.includes(w))) {
        window.scrollTo({ top: 0, behavior: "smooth" })
        commandExecuted = true
      }
      // 2. Check for BOTTOM
      else if (["bottom", "button", "down below"].some(w => transcript.includes(w))) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
        commandExecuted = true
      }
      // 3. Check for UP
      else if (transcript.includes("up")) {
        window.scrollBy({ top: -600, behavior: "smooth" })
        commandExecuted = true
      }
      // 4. Check for DOWN
      else if (transcript.includes("down")) {
        window.scrollBy({ top: 600, behavior: "smooth" })
        commandExecuted = true
      }

      // THE SECRET SAUCE FOR RESPONSIVENESS:
      // Keep recognition running; cooldown prevents duplicate commands from interim results.
      if (commandExecuted) {
        lastCommandAtRef.current = now
      }
    }

    recognition.onerror = (event: any) => {
      // Recover automatically from transient errors so user doesn't need to retoggle listening.
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error)
      }

      // Do not auto-retry permission errors; user action is required there.
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        return
      }

      scheduleRestart(180)
    }

    recognition.onend = () => {
      // Auto-restart if listening is still active.
      scheduleRestart(120)
    }

    ;(async () => {
      await ensurePreferredInputStream()
      try {
        recognition.start()
      } catch (error) {
        console.error("Unable to start speech recognition:", error)
      }
    })()

    // Cleanup when component unmounts
    return () => {
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.stop()
      } catch (e) {}
      if (inputStreamRef.current) {
        inputStreamRef.current.getTracks().forEach((track) => track.stop())
        inputStreamRef.current = null
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
    }
  }, [isActive, preferredInputDeviceId])

  return { lastCommand }
}