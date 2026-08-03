export const isBraveBrowser = async (): Promise<boolean> => {
  try {
    // 1. Direct check (works in main world, popup, and background SW if not hidden by shields)
    if (typeof navigator !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
      const isBrave = await (navigator as any).brave.isBrave();
      if (isBrave) return true;
    }
    
    // 2. Synchronous fallback using userAgentData Client Hints
    if (typeof navigator !== 'undefined' && (navigator as any).userAgentData && (navigator as any).userAgentData.brands) {
      const brands = (navigator as any).userAgentData.brands;
      if (brands.some((b: any) => b.brand === 'Brave')) {
        return true;
      }
    }

    // 3. Content Script context (Ask Background Script)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return new Promise<boolean>((resolve) => {
        chrome.runtime.sendMessage({ type: "CHECK_BRAVE" }, (response) => {
          if (chrome.runtime.lastError || !response) {
            chrome.storage.local.get(["is_brave"], (res) => resolve(!!res?.is_brave));
          } else {
            resolve(!!response.isBrave);
          }
        });
      });
    }

    // 4. Background service worker context (fallback to cached storage)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise<boolean>((resolve) => {
        chrome.storage.local.get(["is_brave"], (res) => resolve(!!res?.is_brave));
      });
    }

    return false;
  } catch (e) {
    return false;
  }
};
