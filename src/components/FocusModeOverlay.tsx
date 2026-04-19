import { useEffect, useId, useState } from "react"

interface FocusModeOverlayProps {
  intensity?: number
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const clampRectToViewport = (rect: Rect, vw: number, vh: number): Rect => {
  const x = Math.max(0, Math.min(rect.x, vw))
  const y = Math.max(0, Math.min(rect.y, vh))
  const width = Math.max(0, Math.min(rect.width, vw - x))
  const height = Math.max(0, Math.min(rect.height, vh - y))
  return { x, y, width, height }
}

const getLargestVisibleRect = (selectors: string[]): Rect | null => {
  let bestRect: Rect | null = null
  let bestArea = 0

  const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)))

  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    const area = rect.width * rect.height
    if (rect.width < 140 || rect.height < 90) continue
    if (area <= bestArea) continue

    const style = window.getComputedStyle(element)
    if (style.visibility === "hidden" || style.display === "none") continue

    bestArea = area
    bestRect = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  }

  return bestRect
}

export default function FocusModeOverlay({ intensity = 0.7 }: FocusModeOverlayProps) {
  const [mainRect, setMainRect] = useState<Rect | null>(null)
  const [captionRect, setCaptionRect] = useState<Rect | null>(null)
  const maskId = useId().replace(/:/g, "")

  useEffect(() => {
    const computeRects = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      const largestVideo = getLargestVisibleRect(["video"])
      const mainContent = getLargestVisibleRect(["main", "article", "[role='main']"])

      const contentRect = largestVideo ?? mainContent ?? {
        x: vw * 0.16,
        y: vh * 0.14,
        width: vw * 0.68,
        height: vh * 0.54
      }

      // Keep a little breathing room around primary content.
      const paddedContentRect = clampRectToViewport(
        {
          x: contentRect.x - 14,
          y: contentRect.y - 14,
          width: contentRect.width + 28,
          height: contentRect.height + 28
        },
        vw,
        vh
      )

      // Reserve a bottom-center strip where captions usually render.
      const capHeight = Math.min(120, Math.max(70, vh * 0.11))
      const capWidth = Math.min(920, Math.max(520, vw * 0.8))
      const capRect = clampRectToViewport(
        {
          x: (vw - capWidth) / 2,
          y: vh - capHeight - 24,
          width: capWidth,
          height: capHeight
        },
        vw,
        vh
      )

      setMainRect(paddedContentRect)
      setCaptionRect(capRect)
    }

    computeRects()

    const handleRecalc = () => computeRects()
    window.addEventListener("resize", handleRecalc)
    window.addEventListener("scroll", handleRecalc, { passive: true })

    const intervalId = window.setInterval(computeRects, 800)

    return () => {
      window.removeEventListener("resize", handleRecalc)
      window.removeEventListener("scroll", handleRecalc)
      window.clearInterval(intervalId)
    }
  }, [])

  if (!mainRect || !captionRect) return null

  return (
    <svg
      className="fixed inset-0 z-[99998] pointer-events-none"
      width="100%"
      height="100%"
      viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect x={mainRect.x} y={mainRect.y} width={mainRect.width} height={mainRect.height} rx="16" fill="black" />
          <rect x={captionRect.x} y={captionRect.y} width={captionRect.width} height={captionRect.height} rx="16" fill="black" />
        </mask>
      </defs>

      <rect x="0" y="0" width="100%" height="100%" fill="black" fillOpacity={intensity} mask={`url(#${maskId})`} />
    </svg>
  )
}
