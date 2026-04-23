export interface STTConnection {
  socket: WebSocket | null
  mediaRecorder: MediaRecorder | null
  close: () => void
}

export function setupSTTWebSocket(
  mediaStream: MediaStream,
  onTranscript: (text: string) => void
): STTConnection {
  const DEEPGRAM_API_KEY = "e9820d72b678d0b7f709e2ceb7ce7260e488bf90" // <--- PASTE KEY HERE

  let isClosed = false

  const mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: "audio/webm;codecs=opus" 
  })

  const REAL_ENDPOINT = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true"
  const socket = new WebSocket(REAL_ENDPOINT, ["token", DEEPGRAM_API_KEY])

  socket.addEventListener("open", () => {
    console.log("[useLiveCaptions] Deepgram connected! Starting media capture...")
    mediaRecorder.start(250)
  })

  mediaRecorder.addEventListener("dataavailable", async (event) => {
    if (!event.data || event.data.size === 0 || isClosed) return
    if (socket.readyState === WebSocket.OPEN) {
      console.log(`[STT] Sending chunk: ${event.data.size} bytes`)
      const arrayBuffer = await event.data.arrayBuffer()
      socket.send(arrayBuffer)
    }
  })

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data as string)
      if (payload.type === "Metadata") return

      // See exactly what Deepgram returns:
      console.log("[Deepgram Raw]:", payload)

      const transcript = payload?.channel?.alternatives?.[0]?.transcript ?? ""
      const isFinal = payload?.is_final

      if (typeof transcript === "string" && transcript.trim() && isFinal) {
        onTranscript(transcript.trim())
      }
    } catch {
      // Ignore
    }
  })

  socket.addEventListener("error", (event) => {
    console.error("[useLiveCaptions] Deepgram WebSocket error:", event)
  })

  socket.addEventListener("close", (event) => {
    console.warn(`[useLiveCaptions] Deepgram closed. Code: ${event.code}. Reason: ${event.reason}`)
  })

  return {
    socket,
    mediaRecorder,
    close: () => {
      isClosed = true
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop()
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
    }
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) {
    return ""
  }

  const response = (await chrome.runtime.sendMessage({
    type: "TRANSLATE_TEXT",
    text,
    targetLang
  })) as { ok?: boolean; translated?: string; error?: string }

  if (!response?.ok || typeof response.translated !== "string") {
    throw new Error(response?.error ?? "DeepL translation failed.")
  }

  return response.translated
}