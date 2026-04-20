import { useCallback, useEffect, useRef, useState } from "react";

const READABLE_SELECTOR = "h1, h2, h3, h4, h5, h6, p, li, blockquote, pre";
const EXCLUDED_ANCESTOR_SELECTOR =
  "nav, header, footer, aside, form, button, [aria-hidden='true'], [role='navigation']";
const SENTENCE_END_RE = /[.!?。！？]/;

const isVisible = (el: HTMLElement) => {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
  return true;
};

const isReadable = (el: HTMLElement) => {
  const text = el.innerText?.trim() ?? "";
  if (!text) return false;
  if (el.closest(EXCLUDED_ANCESTOR_SELECTOR)) return false;

  if (/^H[1-6]$/.test(el.tagName)) return text.length >= 4;
  return text.length >= 25;
};

const getTextNodes = (el: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    if (textNode.nodeValue && textNode.nodeValue.length > 0) {
      nodes.push(textNode);
    }
    node = walker.nextNode();
  }

  return nodes;
};

const resolveTextOffset = (nodes: Text[], absoluteOffset: number) => {
  let remaining = Math.max(0, absoluteOffset);

  for (const node of nodes) {
    const value = node.nodeValue ?? "";
    if (remaining <= value.length) {
      return { node, offset: remaining };
    }
    remaining -= value.length;
  }

  const fallbackNode = nodes[nodes.length - 1];
  const fallbackLength = (fallbackNode?.nodeValue ?? "").length;
  return { node: fallbackNode, offset: fallbackLength };
};

const findSentenceBounds = (text: string, charIndex: number) => {
  if (!text) return null;

  let cursor = Math.min(Math.max(0, charIndex), Math.max(0, text.length - 1));
  while (cursor > 0 && /\s/.test(text[cursor])) cursor -= 1;
  if (/\s/.test(text[cursor] ?? "")) return null;

  let start = 0;
  for (let i = cursor; i >= 0; i -= 1) {
    if (SENTENCE_END_RE.test(text[i])) {
      start = i + 1;
      break;
    }
  }

  while (start < text.length && /[\s\"'“”‘’([{]/.test(text[start])) start += 1;

  let end = text.length;
  for (let i = cursor; i < text.length; i += 1) {
    if (SENTENCE_END_RE.test(text[i])) {
      end = i + 1;
      break;
    }
  }

  while (end < text.length && /[\"'”’\])}\s]/.test(text[end])) end += 1;

  if (start >= end) return null;
  return { start, end };
};

export function useSpeech(readingSpeed: number, highlightColor: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const elementsRef = useRef<HTMLElement[]>([]);
  const currentIndexRef = useRef(0);
  const speechSessionRef = useRef(0);

  const activeElementRef = useRef<HTMLElement | null>(null);
  const activeStyleRef = useRef({
    outline: "",
    transition: ""
  });

  const sentenceOverlayRootRef = useRef<HTMLDivElement | null>(null);
  const speechTextRef = useRef("");
  const speechNodesRef = useRef<Text[]>([]);
  const activeSentenceCharIndexRef = useRef(0);

  const clearSentenceOverlay = useCallback(() => {
    const root = sentenceOverlayRootRef.current;
    if (!root) return;
    root.replaceChildren();
  }, []);

  const showSentenceOverlayForChar = useCallback(
    (charIndex: number) => {
      const root = sentenceOverlayRootRef.current;
      const text = speechTextRef.current;
      const nodes = speechNodesRef.current;

      if (!root || !text || !nodes.length) {
        clearSentenceOverlay();
        return;
      }

      const bounds = findSentenceBounds(text, charIndex);
      if (!bounds) {
        clearSentenceOverlay();
        return;
      }

      activeSentenceCharIndexRef.current = charIndex;

      const startPos = resolveTextOffset(nodes, bounds.start);
      const endPos = resolveTextOffset(nodes, bounds.end);
      if (!startPos.node || !endPos.node) {
        clearSentenceOverlay();
        return;
      }

      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);

      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
      if (!rects.length) {
        clearSentenceOverlay();
        return;
      }

      const fragments = rects.map((rect) => {
        const part = document.createElement("div");
        part.style.position = "absolute";
        part.style.left = `${Math.round(rect.left + window.scrollX)}px`;
        part.style.top = `${Math.round(rect.top + window.scrollY)}px`;
        part.style.width = `${Math.ceil(rect.width)}px`;
        part.style.height = `${Math.ceil(rect.height)}px`;
        part.style.backgroundColor = highlightColor;
        part.style.opacity = "0.12";
        part.style.borderRadius = "0px";
        part.style.mixBlendMode = "normal";
        part.style.zIndex = "0";
        return part;
      });

      root.replaceChildren(...fragments);
    },
    [clearSentenceOverlay, highlightColor]
  );

  const clearHighlight = useCallback(() => {
    const active = activeElementRef.current;
    if (active) {
      active.style.outline = activeStyleRef.current.outline;
      active.style.transition = activeStyleRef.current.transition;
      activeElementRef.current = null;
    }

    clearSentenceOverlay();
  }, [clearSentenceOverlay]);

  const applyParagraphFocus = useCallback(
    (el: HTMLElement) => {
      clearHighlight();

      activeStyleRef.current = {
        outline: el.style.outline,
        transition: el.style.transition
      };

      activeElementRef.current = el;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [clearHighlight, highlightColor]
  );

  const extractReadableContent = useCallback(() => {
    const root =
      (document.querySelector("main, article, [role='main']") as HTMLElement | null) ?? document.body;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>(READABLE_SELECTOR)).filter(
      (el) => isVisible(el) && isReadable(el)
    );

    elementsRef.current = nodes;
    if (currentIndexRef.current >= nodes.length) {
      currentIndexRef.current = Math.max(0, nodes.length - 1);
    }
  }, []);

  const speakAtIndex = useCallback(
    (index: number) => {
      if (!elementsRef.current.length) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const safeIndex = Math.min(Math.max(index, 0), elementsRef.current.length - 1);
      const target = elementsRef.current[safeIndex];
      const textNodes = getTextNodes(target);
      const textToRead = textNodes.map((n) => n.nodeValue ?? "").join("");

      if (!textToRead.trim()) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const sessionId = ++speechSessionRef.current;
      currentIndexRef.current = safeIndex;
      speechNodesRef.current = textNodes;
      speechTextRef.current = textToRead;

      window.speechSynthesis.cancel();
      applyParagraphFocus(target);

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = readingSpeed;

      utterance.onstart = () => {
        if (sessionId !== speechSessionRef.current) return;
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onboundary = (event) => {
        if (sessionId !== speechSessionRef.current) return;
        showSentenceOverlayForChar(event.charIndex ?? 0);
      };

      utterance.onend = () => {
        if (sessionId !== speechSessionRef.current) return;
        clearSentenceOverlay();

        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < elementsRef.current.length) {
          speakAtIndex(nextIndex);
          return;
        }

        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        if (sessionId !== speechSessionRef.current) return;
        clearSentenceOverlay();

        if (e.error !== "canceled") {
          console.error("Speech error:", e);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [applyParagraphFocus, clearSentenceOverlay, readingSpeed, showSentenceOverlayForChar]
  );

  useEffect(() => {
    const timeout = window.setTimeout(extractReadableContent, 600);

    const overlayRoot = document.createElement("div");
    overlayRoot.id = "sensa-sentence-highlight-overlay";
    overlayRoot.style.position = "fixed";
    overlayRoot.style.left = "0";
    overlayRoot.style.top = "0";
    overlayRoot.style.width = "100vw";
    overlayRoot.style.height = "100vh";
    overlayRoot.style.pointerEvents = "none";
    overlayRoot.style.zIndex = "2147483647";
    overlayRoot.style.overflow = "visible";
    overlayRoot.style.position = "absolute";
    sentenceOverlayRootRef.current = overlayRoot;
    document.body.appendChild(overlayRoot);

    const repaintActiveSentence = () => {
      if (!speechTextRef.current || !speechNodesRef.current.length) return;
      showSentenceOverlayForChar(activeSentenceCharIndexRef.current);
    };

    window.addEventListener("scroll", repaintActiveSentence, true);
    window.addEventListener("resize", repaintActiveSentence);

    return () => {
      window.clearTimeout(timeout);
      speechSessionRef.current += 1;
      window.speechSynthesis.cancel();
      clearHighlight();

      window.removeEventListener("scroll", repaintActiveSentence, true);
      window.removeEventListener("resize", repaintActiveSentence);

      if (overlayRoot.parentNode) {
        overlayRoot.parentNode.removeChild(overlayRoot);
      }
      sentenceOverlayRootRef.current = null;
    };
  }, [clearHighlight, extractReadableContent]);

  const togglePlayPause = useCallback(() => {
    if (!elementsRef.current.length) extractReadableContent();
    if (!elementsRef.current.length) return;

    if (isPlaying && !isPaused) {
      speechSessionRef.current += 1;
      window.speechSynthesis.cancel();
      clearSentenceOverlay();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      speakAtIndex(currentIndexRef.current);
      return;
    }

    speakAtIndex(currentIndexRef.current);
  }, [clearSentenceOverlay, extractReadableContent, isPaused, isPlaying, speakAtIndex]);

  const next = useCallback(() => {
    if (!elementsRef.current.length) extractReadableContent();
    if (!elementsRef.current.length) return;

    speakAtIndex(currentIndexRef.current + 1);
  }, [extractReadableContent, speakAtIndex]);

  const prev = useCallback(() => {
    if (!elementsRef.current.length) extractReadableContent();
    if (!elementsRef.current.length) return;

    speakAtIndex(currentIndexRef.current - 1);
  }, [extractReadableContent, speakAtIndex]);

  return { isPlaying, isPaused, togglePlayPause, next, prev };
}
