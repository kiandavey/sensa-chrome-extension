export const isBraveBrowser = async (): Promise<boolean> => {
  try {
    // 1. Direct check (works in main world, popup, and background SW)
    if (typeof navigator !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
      const isBrave = await (navigator as any).brave.isBrave();
      if (isBrave) return true;
    }
    
    // 2. Fallback check for Content Scripts (isolated world) via background script executeScript MAIN world
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return new Promise<boolean>((resolve) => {
        chrome.runtime.sendMessage({ type: "CHECK_BRAVE" }, (response) => {
          if (chrome.runtime.lastError || !response) {
            // Fallback to storage if message fails
            chrome.storage.local.get(["is_brave"], (res) => resolve(!!res?.is_brave));
            return;
          }
          resolve(!!response.isBrave);
        });
      });
    }

    return false;
  } catch (e) {
    return false;
  }
};
