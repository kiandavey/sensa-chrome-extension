import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ColorPickerPopupProps {
  onClose: () => void
  initialColor?: string
  onColorChange?: (color: string) => void
}

// Math helpers for color conversion
const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  let r = 0, g = 0, b = 0;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - (f * s));
  let t = v * (1 - ((1 - f) * s));
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  const cleaned = hex.trim().replace(/^#/, "")
  if (!/^([A-Fa-f0-9]{6})$/.test(cleaned)) return null
  const value = Number.parseInt(cleaned, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const rgbToHsv = (r: number, g: number, b: number) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h /= 6
    if (h < 0) h += 1
  }

  const s = max === 0 ? 0 : delta / max
  return { h, s, v: max }
}

export default function ColorPickerPopup({ onClose, initialColor = "#FFFE00", onColorChange }: ColorPickerPopupProps) {
  // State: Hue (0-1), Saturation (0-1), Value/Brightness (0-1)
  const [hsv, setHsv] = useState(() => {
    const parsed = hexToRgb(initialColor)
    if (!parsed) return { h: 0.16, s: 1, v: 1 }
    return rgbToHsv(parsed[0], parsed[1], parsed[2])
  });
  
  const popupRef = useRef<HTMLDivElement>(null)
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingMain = useRef(false);
  const isDraggingHue = useRef(false);

  // Derived colors for UI
  const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hex = rgbToHex(r, g, b);
  const [hr, hg, hb] = hsvToRgb(hsv.h, 1, 1)
  const baseHueColor = rgbToHex(hr, hg, hb); // The top-right color of the box

  useEffect(() => {
    onColorChange?.(hex)
  }, [hex, onColorChange])

  useEffect(() => {
    const handleDocumentPointerDown = (event: MouseEvent) => {
      if (!popupRef.current) return
      if (isDraggingMain.current || isDraggingHue.current) return
      const target = event.target as Node
      if (!popupRef.current.contains(target)) onClose()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("mousedown", handleDocumentPointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("mousedown", handleDocumentPointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  // --- DRAG LOGIC FOR MAIN AREA (Saturation / Brightness) ---
  const handleMainDrag = useCallback((clientX: number, clientY: number) => {
    if (!mainAreaRef.current) return;
    const rect = mainAreaRef.current.getBoundingClientRect();
    
    // Calculate percentages (0 to 1) and clamp them
    let s = (clientX - rect.left) / rect.width;
    let v = 1 - ((clientY - rect.top) / rect.height);
    
    s = Math.max(0, Math.min(1, s));
    v = Math.max(0, Math.min(1, v));
    
    setHsv(prev => ({ ...prev, s, v }));
  }, []);

  // --- DRAG LOGIC FOR HUE SLIDER ---
  const handleHueDrag = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    
    let h = (clientX - rect.left) / rect.width;
    h = Math.max(0, Math.min(1, h));
    
    setHsv(prev => ({ ...prev, h }));
  }, []);

  // --- WINDOW EVENT LISTENERS ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingMain.current) handleMainDrag(e.clientX, e.clientY);
      if (isDraggingHue.current) handleHueDrag(e.clientX);
    };

    const handleMouseUp = () => {
      isDraggingMain.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMainDrag, handleHueDrag]);

  return (
    <div
      ref={popupRef}
      className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 z-[100000] w-[320px] bg-white rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 p-4 font-sans select-none cursor-default"
    >
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-[14px] h-[14px] bg-white rotate-45 border-b border-r border-gray-100 pointer-events-none"></div>
      
      {/* 1. Main Gradient Area (Saturation/Brightness) */}
      <div 
        ref={mainAreaRef}
        onMouseDown={(e) => { isDraggingMain.current = true; handleMainDrag(e.clientX, e.clientY); }}
        className="w-full h-[220px] rounded-lg relative overflow-hidden shadow-[inset_0_0_2px_rgba(0,0,0,0.1)] cursor-crosshair"
        style={{ backgroundColor: baseHueColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
        
        {/* Picker Thumb */}
        <div 
          className="absolute w-[24px] h-[24px] border-[3px] border-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.3)] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${hsv.s * 100}%`, 
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: hex
          }}
        ></div>
      </div>

      {/* 2. Hue Slider */}
      <div 
        ref={hueSliderRef}
        onMouseDown={(e) => { isDraggingHue.current = true; handleHueDrag(e.clientX); }}
        className="mt-5 relative w-full h-[14px] rounded-full shadow-[inset_0_0_2px_rgba(0,0,0,0.2)] cursor-pointer" 
        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
      >
        {/* Slider Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-[26px] h-[26px] border-[4px] border-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.3)] pointer-events-none transform -translate-x-1/2"
          style={{ 
            left: `${hsv.h * 100}%`,
            backgroundColor: baseHueColor
          }}
        ></div>
      </div>

      {/* 3. Hex & RGB Inputs */}
      <div className="mt-5 flex gap-3">
        <div className="flex flex-col gap-1.5 flex-[2]">
          <label className="text-[12px] font-bold text-black tracking-wide">Hex</label>
          <input readOnly value={hex} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] text-gray-800 outline-none bg-gray-50" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[12px] font-bold text-black tracking-wide">R</label>
          <input readOnly value={r} className="w-full border border-gray-200 rounded-lg px-1 py-2.5 text-[14px] text-center text-gray-800 outline-none bg-gray-50" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[12px] font-bold text-black tracking-wide">G</label>
          <input readOnly value={g} className="w-full border border-gray-200 rounded-lg px-1 py-2.5 text-[14px] text-center text-gray-800 outline-none bg-gray-50" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[12px] font-bold text-black tracking-wide">B</label>
          <input readOnly value={b} className="w-full border border-gray-200 rounded-lg px-1 py-2.5 text-[14px] text-center text-gray-800 outline-none bg-gray-50" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-[#3B82F6] text-white hover:bg-blue-600 transition-colors"
        >
          Done
        </button>
      </div>

    </div>
  )
}