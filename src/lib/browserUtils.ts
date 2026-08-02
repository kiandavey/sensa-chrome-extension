export const isBraveBrowser = async (): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
      return await (navigator as any).brave.isBrave();
    }
    return false;
  } catch (e) {
    return false;
  }
};
