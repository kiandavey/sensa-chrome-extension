chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message?.type === "START_CAPTURE") {
    const targetTabId = sender.tab?.id;
    if (!targetTabId) return sendResponse({ ok: false, error: "No Tab ID" });

    ;(async () => {
      try {
        if (chrome.offscreen && await chrome.offscreen.hasDocument()) {
          await chrome.offscreen.closeDocument()
        }

        await chrome.offscreen.createDocument({
          url: chrome.runtime.getURL("tabs/audioproxy.html"),
          reasons: ['USER_MEDIA', 'AUDIO_PLAYBACK'] as any[],
          justification: 'Capturing and playing tab audio'
        })
        
        await new Promise(resolve => setTimeout(resolve, 300))

        chrome.tabCapture.getMediaStreamId({ targetTabId }, (streamId) => {
          if (!streamId) throw new Error("Failed to get stream ID")
          chrome.runtime.sendMessage({
            type: "EXECUTE_OFFSCREEN_CAPTURE",
            streamId,
            targetLang: message.targetLang,
            targetTabId
          })
          sendResponse({ ok: true })
        })
      } catch (err) {
        sendResponse({ ok: false, error: String(err) })
      }
    })()
    return true
  }

  if (message?.type === "STOP_CAPTURE") {
    ;(async () => {
      if (chrome.offscreen && await chrome.offscreen.hasDocument()) {
        await chrome.offscreen.closeDocument()
      }
      sendResponse({ ok: true })
    })()
    return true
  }

  // --- DEEPL TRANSLATOR ---
  if (message?.type === "TRANSLATE_TEXT") {
    ;(async () => {
      try {
        const text = message.text || ""
        if (!text.trim()) return sendResponse({ ok: true, translated: "" })

        const params = new URLSearchParams()
        params.append("text", text)
        params.append("target_lang", message.targetLang || "EN")

        const response = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            Authorization: "DeepL-Auth-Key cd0619de-9ed9-4d6c-ab2c-1d9e84dce95e:fx",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        })

        if (!response.ok) throw new Error("DeepL failed")
        const payload = await response.json()
        sendResponse({ ok: true, translated: payload?.translations?.[0]?.text })
      } catch (error) {
        sendResponse({ ok: false, error: String(error) })
      }
    })()
    return true
  }

  // 🚨 THE BRIDGE: Receive from Offscreen, beam directly to YouTube!
  if (message?.type === "FORWARD_TO_TAB" && message.tabId) {
    chrome.tabs.sendMessage(message.tabId, message.payload).catch(() => {})
    return true
  }
})