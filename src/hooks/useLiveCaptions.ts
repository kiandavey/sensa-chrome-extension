import { useEffect, useState } from "react"

export function useLiveCaptions(isActive: boolean, targetLanguage: string) {
  const [captions, setCaptions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive) {
      chrome.runtime.sendMessage({ type: "STOP_CAPTURE" })
      return
    }

    setError(null)
    setCaptions([])

    chrome.runtime.sendMessage({ type: "START_CAPTURE", targetLang: targetLanguage }, (res) => {
      if (!res?.ok) setError(res?.error || "Failed to start capture.")
    })

    const handleMessage = (msg: any) => {
      if (msg.type === "CAPTION_UPDATE" && msg.text) {
        setCaptions((prev) => [...prev, msg.text].slice(-4))
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      chrome.runtime.sendMessage({ type: "STOP_CAPTURE" })
    }
  }, [isActive, targetLanguage])

  return { captions, error }
}