import { useState, useRef, useEffect, useCallback } from 'react'
import { Check } from 'lucide-react'

const SWATCHES = [
  '#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333', '#000000',
  '#FF6B6B', '#E74C3C', '#C0392B', '#FF8C94', '#FFB8D0',
  '#FFD93D', '#F39C12', '#E67E22', '#FFE66D',
  '#6BCB77', '#27AE60', '#1E8449', '#96CEB4',
  '#4ECDC4', '#1ABC9C', '#16A085',
  '#45B7D1', '#3498DB', '#2980B9',
  '#6C5CE7', '#8E44AD', '#9B59B6',
]

const TRANSPARENT = 'transparent'

interface Props {
  value: string
  onChange: (value: string) => void
  showTransparent?: boolean
  label?: string
}

export function ColorPicker({ value, onChange, showTransparent = false, label }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [customHex, setCustomHex] = useState(value === TRANSPARENT ? '#000000' : value)
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value !== TRANSPARENT) setCustomHex(value)
  }, [value])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleCustomHex = useCallback(() => {
    const hex = customHex.replace('#', '')
    if (/^[0-9A-Fa-f]{6}$/.test(hex) || /^[0-9A-Fa-f]{3}$/.test(hex)) {
      onChange('#' + hex.toLowerCase())
    }
    setIsOpen(false)
  }, [customHex, onChange])

  const isTransparent = value === TRANSPARENT || value.endsWith('00')

  return (
    <div className="relative">
      {label && <p className="mb-1 text-[10px] text-zinc-500">{label}</p>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-full items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 hover:border-zinc-600 transition-colors"
      >
        <div
          className="size-4 shrink-0 rounded border border-zinc-600"
          style={{
            backgroundColor: isTransparent ? TRANSPARENT : value,
            backgroundImage: isTransparent
              ? 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%) 50% / 5px 5px'
              : 'none',
          }}
        />
        <span className="truncate text-[10px] text-zinc-300 font-mono">
          {isTransparent ? 'None' : value}
        </span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-1 w-[196px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl"
        >
          <div className="mb-1.5 flex flex-wrap gap-1">
            {SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setIsOpen(false) }}
                className={`size-5 rounded border transition-all ${
                  value === color
                    ? 'border-blue-500 ring-1 ring-blue-500/50'
                    : 'border-zinc-600 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            {showTransparent && (
              <button
                type="button"
                onClick={() => { onChange(TRANSPARENT); setIsOpen(false) }}
                className={`size-5 rounded border transition-all ${
                  isTransparent
                    ? 'border-blue-500 ring-1 ring-blue-500/50'
                    : 'border-zinc-600 hover:border-zinc-400'
                }`}
                style={{
                  backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, transparent 0% 50%) 50% / 5px 5px',
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-1 border-t border-zinc-800 pt-1.5">
            <span className="text-[9px] text-zinc-500">#</span>
            <input
              ref={inputRef}
              type="text"
              value={customHex.replace('#', '')}
              onChange={(e) => setCustomHex('#' + e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCustomHex() }}
              className="h-6 flex-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 text-[10px] text-zinc-200 font-mono outline-none focus:border-blue-500/50"
              maxLength={6}
              placeholder="000000"
            />
            <button
              type="button"
              onClick={handleCustomHex}
              className="flex size-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <Check className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
