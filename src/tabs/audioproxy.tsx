import { useEffect } from "react"

export default function AudioProxy() {
  useEffect(() => {
    let socket: WebSocket | null = null
    let processor: ScriptProcessorNode | null = null
    let audioCtx: AudioContext | null = null
    let audioEl: HTMLAudioElement | null = null
    let currentTargetLang = "EN"

    const stopCapture = () => {
      try {
        if (processor) {
          processor.disconnect()
          processor.onaudioprocess = null
          processor = null
        }

        if (audioCtx) {
          audioCtx.close().catch(() => {})
          audioCtx = null
        }

        if (audioEl) {
          const stream = audioEl.srcObject as MediaStream | null
          stream?.getTracks().forEach((track) => track.stop())
          audioEl.pause()
          audioEl.srcObject = null
          audioEl = null
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close()
        }
        socket = null
      } catch (err) {
        console.error("Failed to stop offscreen capture cleanly:", err)
      }
    }

    const handleMessage = async (msg: any) => {
      if (msg.type === "STOP_OFFSCREEN_CAPTURE") {
        stopCapture()
        return
      }

      if (msg.type === "EXECUTE_OFFSCREEN_CAPTURE") {
        const { streamId, targetLang, targetTabId } = msg
        currentTargetLang = targetLang || "EN"

        try {
          // Restart cleanly if a previous capture session exists.
          stopCapture()

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } } as any
          })

          audioEl = new Audio()
          audioEl.srcObject = stream
          // Apply configured output device if set
          chrome.storage.local.get(["sensa_auditory_settings"], async (res) => {
            try {
              const cfg = res?.sensa_auditory_settings
              const deviceId = cfg?.outputDevice
              if (deviceId && deviceId !== "default" && typeof (audioEl as any).setSinkId === "function") {
                await (audioEl as any).setSinkId(deviceId)
              }
            } catch (err) {
              // ignore setSinkId failures
            }
            await audioEl!.play()
          })

          socket = new WebSocket("ws://localhost:3000")
          
          socket.onopen = async () => {
            audioCtx = new window.AudioContext({ sampleRate: 16000 })
            await audioCtx.resume()

            const source = audioCtx.createMediaStreamSource(stream)
            processor = audioCtx.createScriptProcessor(4096, 1, 1)
            
            source.connect(processor)
            processor.connect(audioCtx.destination) 

            processor.onaudioprocess = (e) => {
              if (socket?.readyState !== WebSocket.OPEN) return
              const float32Array = e.inputBuffer.getChannelData(0)
              const int16Array = new Int16Array(float32Array.length)
              for (let i = 0; i < float32Array.length; i++) {
                let s = Math.max(-1, Math.min(1, float32Array[i]))
                int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff
              }
              socket.send(int16Array.buffer)
            }
          }

          socket.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data)
              if (payload.type === "TRANSCRIPT" && payload.text) {
                const rawText = payload.text
                
                // 🚨 THE BRIDGE: Hand the English text to the Background Worker to deliver to the UI!
                chrome.runtime.sendMessage({ 
                  type: "FORWARD_TO_TAB", 
                  tabId: targetTabId, 
                  payload: { type: "CAPTION_UPDATE", text: rawText, source: "original" } 
                })

                // Request translation
                chrome.runtime.sendMessage(
                  { type: "TRANSLATE_TEXT", text: rawText, targetLang: currentTargetLang },
                  (res) => {
                    if (res?.ok && res.translated && res.translated !== rawText) {
                      // 🚨 THE BRIDGE: Hand the translated text to the Background Worker to deliver!
                      chrome.runtime.sendMessage({ 
                        type: "FORWARD_TO_TAB", 
                        tabId: targetTabId, 
                        payload: { type: "CAPTION_UPDATE", text: res.translated, source: "translated" } 
                      })
                    }
                  }
                )
              }
            } catch (err) {}
          }
        } catch (err) {
          console.error("Offscreen capture failed:", err)
        }
      }

      if (msg.type === "UPDATE_CAPTION_LANGUAGE_OFFSCREEN") {
        currentTargetLang = msg.targetLang || "EN"
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      stopCapture()
    }
  }, [])

  return <div>Sensa Offscreen Audio Relay</div>
}