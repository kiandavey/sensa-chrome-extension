import { useEffect, useRef, useState } from "react"
import { setupSTTWebSocket, translateText, type STTConnection } from "../lib/api"

type CaptureResponse = {
  ok: boolean
  streamId?: string
  error?: string
}

function sendMessageWithTimeout<T>(message: unknown, timeoutMs = 4000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Background service worker did not respond in time."))
    }, timeoutMs)

    chrome.runtime.sendMessage(message, (response) => {
      window.clearTimeout(timeoutId)
      const lastError = chrome.runtime.lastError
      if (lastError) {
        reject(new Error(lastError.message))
        return
      }
      resolve(response as T)
    })
  })
}

export function useLiveCaptions(isActive: boolean, targetLanguage: string) {
  const [captions, setCaptions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const streamRef = useRef<MediaStream | null>(null)
  const sttConnectionRef = useRef<STTConnection | null>(null)
  const retryTimerRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let isCancelled = false

    const cleanup = () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }

      sttConnectionRef.current?.close()
      sttConnectionRef.current = null

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {})
      }
      audioCtxRef.current = null

      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (!isActive) {
      setError(null)
      cleanup()
      return
    }

    const start = async () => {
      try {
        setError(null)
        console.log("[useLiveCaptions] Requesting tab audio capture...")

        const captureResponse = await requestCaptureWithRetry(2)

        if (!captureResponse?.ok || !captureResponse.streamId) {
          throw new Error(captureResponse?.error ?? "Failed to receive tab stream id.")
        }

        console.log("[useLiveCaptions] Got stream ID, requesting audio track...")

        const tabAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: "tab",
              chromeMediaSourceId: captureResponse.streamId
            }
          } as MediaTrackConstraints
        })

        if (isCancelled) {
          tabAudioStream.getTracks().forEach((track) => track.stop())
          return
        }

        console.log("[useLiveCaptions] Stream obtained. Tracks:", tabAudioStream.getAudioTracks().length)
        streamRef.current = tabAudioStream

        // --- THE SILENCE FIX: FORCE AUDIO CONTEXT TO WAKE UP ---
        const audioCtx = new AudioContext()
        await audioCtx.resume() // Use the CC button click to bypass Chrome's autoplay block
        console.log("[useLiveCaptions] AudioContext state:", audioCtx.state) // MUST say 'running'
        
        const source = audioCtx.createMediaStreamSource(tabAudioStream)
        source.connect(audioCtx.destination)
        audioCtxRef.current = audioCtx
        // -------------------------------------------------------

        const connection = setupSTTWebSocket(tabAudioStream, async (transcript) => {
          try {
            const translated = await translateText(transcript, targetLanguage)
            if (isCancelled || !translated.trim()) return
            setCaptions((prev) => [...prev, translated].slice(-4))
            setError(null)
          } catch (error) {
            console.error("Caption translation failed:", error)
            if (!isCancelled && transcript.trim()) {
              setCaptions((prev) => [...prev, transcript.trim()].slice(-4))
            }
            const message = error instanceof Error ? error.message : String(error)
            setError(`Translation failed: ${message}`)
          }
        })

        sttConnectionRef.current = connection
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setError(message)
        console.error("Live caption startup failed:", message, error)

        retryTimerRef.current = window.setTimeout(() => {
          if (!isCancelled && isActive) {
            console.log("[useLiveCaptions] Retrying after 1.5s...")
            start()
          }
        }, 1500)
      }
    }

    start()

    return () => {
      isCancelled = true
      cleanup()
    }
  }, [isActive, targetLanguage])

  return { captions, error }
}

async function requestCaptureWithRetry(retries = 2): Promise<CaptureResponse> {
  let lastError: unknown = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await sendMessageWithTimeout<CaptureResponse>({ type: "START_CAPTURE" }, 10000)
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => window.setTimeout(resolve, 700))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Background service worker did not respond in time.")
}