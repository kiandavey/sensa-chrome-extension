// Background service worker entry for live caption tab audio capture and translation.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true, background: true })
    return
  }

  if (message?.type === "TRANSLATE_TEXT") {
    ;(async () => {
      try {
        const text = typeof message?.text === "string" ? message.text : ""
        const targetLang = typeof message?.targetLang === "string" ? message.targetLang : "EN"

        if (!text.trim()) {
          sendResponse({ ok: true, translated: "" })
          return
        }

        const params = new URLSearchParams()
        params.append("text", text)
        params.append("target_lang", targetLang)

        const response = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            Authorization: "DeepL-Auth-Key cd0619de-9ed9-4d6c-ab2c-1d9e84dce95e:fx",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        })

        if (!response.ok) {
          throw new Error(`DeepL request failed: ${response.status}`)
        }

        const payload = await response.json()
        const translated = payload?.translations?.[0]?.text

        if (typeof translated !== "string") {
          throw new Error("DeepL response did not include translated text.")
        }

        sendResponse({ ok: true, translated })
      } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error)
        sendResponse({ ok: false, error: messageText })
      }
    })()

    return true
  }

  if (message?.type !== "START_CAPTURE") {
    return
  }

  const senderTabId = sender.tab?.id
  if (typeof senderTabId !== "number") {
    sendResponse({ ok: false, error: "Missing sender tab id." })
    return
  }

  chrome.tabCapture.getMediaStreamId(
    {
      consumerTabId: senderTabId,
      targetTabId: senderTabId
    },
    (streamId) => {
      const lastError = chrome.runtime.lastError
      if (lastError) {
        sendResponse({ ok: false, error: lastError.message })
        return
      }

      if (!streamId) {
        sendResponse({ ok: false, error: "Failed to get media stream ID" })
        return
      }

      sendResponse({ ok: true, streamId })
    }
  )

  return true
})


