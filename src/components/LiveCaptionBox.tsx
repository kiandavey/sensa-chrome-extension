import React, { useEffect, useRef, useState } from "react"

interface CaptionOffset {
  x: number
  y: number
}

interface LiveCaptionBoxProps {
  captions: string[]
  error?: string | null
  fontSize: number
  textColor: string
  bgColor: string
}

export default function LiveCaptionBox({
  captions,
  error,
  fontSize,
  textColor,
  bgColor
}: LiveCaptionBoxProps) {
  const [offset, setOffset] = useState<CaptionOffset>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef(offset)

  useEffect(() => {
    chrome.storage.local.get(["sensa_live_caption_offset"], (result) => {
      const savedOffset = result.sensa_live_caption_offset as Partial<CaptionOffset> | undefined

      if (typeof savedOffset?.x === "number" && typeof savedOffset?.y === "number") {
        const nextOffset = { x: savedOffset.x, y: savedOffset.y }
        offsetRef.current = nextOffset
        setOffset(nextOffset)
      }
    })
  }, [])

  useEffect(() => {
    offsetRef.current = offset
  }, [offset])

  const updateOffset = (nextOffset: CaptionOffset) => {
    offsetRef.current = nextOffset
    setOffset(nextOffset)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (event: MouseEvent) => {
      updateOffset({
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      chrome.storage.local.set({ sensa_live_caption_offset: offsetRef.current })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const total = captions.length

  return (
    <div
      role="log"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
        width: "min(90vw, 720px)",
        padding: "12px 16px",
        borderRadius: "12px",
        backgroundColor: bgColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        userSelect: "none",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: 999999
      }}
      onMouseDown={handleMouseDown}
    >
      {error ? (
        <div style={{ color: "#FCA5A5", textAlign: "center", fontSize: "0.85em" }}>{error}</div>
      ) : captions.length === 0 ? (
        <div style={{ opacity: 0.75, textAlign: "center" }}>Listening for speech...</div>
      ) : (
        captions.map((line, index) => {
          const age = total - 1 - index
          const opacity = Math.max(0.45, 1 - age * 0.2)

          return (
            <div
              key={`${index}-${line.slice(0, 18)}`}
              style={{
                opacity,
                lineHeight: 1.35,
                marginTop: index === 0 ? 0 : 6,
                transition: "opacity 180ms ease"
              }}
            >
              {line}
            </div>
          )
        })
      )}
    </div>
  )
}
