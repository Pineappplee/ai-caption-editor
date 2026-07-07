import { useEffect, useCallback, useMemo } from 'react'
import { Copy, ClipboardPaste, RotateCcw } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { useStyleStore } from '@/stores/style-store'
import {
  ColorPicker,
  SliderInput,
  AlignmentPicker,
  PositionGrid,
  StyleSection,
  AnimationPresets,
  StylePresetsBar,
} from '@/components/ui/caption-style'

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
]

const WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
]

export function CaptionStylingPanel() {
  const style = useEditorStore((s) => s.captionStyle)
  const updateStyle = useEditorStore((s) => s.updateCaptionStyle)
  const selectedCaptionId = useEditorStore((s) => s.selectedCaptionId)
  const captions = useEditorStore((s) => s.captions)

  const presets = useStyleStore((s) => s.presets)
  const activePresetId = useStyleStore((s) => s.activePresetId)
  const loadPresets = useStyleStore((s) => s.loadPresets)
  const applyPreset = useStyleStore((s) => s.applyPreset)
  const copyStyle = useStyleStore((s) => s.copyStyle)
  const pasteStyle = useStyleStore((s) => s.pasteStyle)
  const resetStyle = useStyleStore((s) => s.resetStyle)

  const selectedCount = useMemo(() => {
    if (!selectedCaptionId) return 0
    return captions.filter((c) => c.id === selectedCaptionId).length
  }, [selectedCaptionId, captions])

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = applyPreset(presetId)
    if (preset) updateStyle(preset.style)
  }, [applyPreset, updateStyle])

  const handleCopy = useCallback(() => {
    if (selectedCaptionId) copyStyle(style, [selectedCaptionId])
  }, [selectedCaptionId, style, copyStyle])

  const handlePaste = useCallback(() => {
    const clip = pasteStyle()
    if (clip) updateStyle(clip.style)
  }, [pasteStyle, updateStyle])

  const handleReset = useCallback(() => {
    const defaultStyle = resetStyle()
    updateStyle(defaultStyle)
  }, [resetStyle, updateStyle])

  const clip = useStyleStore((s) => s.clipboard)

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4 min-w-0 max-w-full [&_*]:break-words [&_*]:overflow-hidden">
      {/* Multi-selection info */}
      {selectedCount > 1 && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-2 text-[10px] text-blue-300">
          Editing {selectedCount} captions
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800/60 pb-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!selectedCaptionId}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Copy style"
        >
          <Copy className="size-3" />
          Copy
        </button>
        <button
          type="button"
          onClick={handlePaste}
          disabled={!clip}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Paste style"
        >
          <ClipboardPaste className="size-3" />
          Paste
        </button>
        <div className="mx-1 h-4 w-px bg-zinc-800" />
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Reset style"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      {/* Style presets */}
      <StylePresetsBar presets={presets} activePresetId={activePresetId} onSelect={handlePresetSelect} />

      {/* Font */}
      <StyleSection title="Font">
        <select
          value={style.fontFamily}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
          className="h-7 w-full appearance-none rounded border border-zinc-700 bg-zinc-800 px-2 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SliderInput
              label="Size"
              value={style.fontSize}
              min={8}
              max={128}
              step={1}
              suffix="px"
              onChange={(v) => updateStyle({ fontSize: v })}
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-[10px] text-zinc-500">Weight</p>
            <select
              value={style.fontWeight}
              onChange={(e) => updateStyle({ fontWeight: e.target.value })}
              className="h-7 w-full appearance-none rounded border border-zinc-700 bg-zinc-800 px-2 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {WEIGHTS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={style.fontStyle === 'italic'}
              onChange={(e) => updateStyle({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
              className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-[10px] text-zinc-400">Italic</span>
          </label>
          <label className="flex flex-1 items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={style.textDecoration === 'underline'}
              onChange={(e) => updateStyle({ textDecoration: e.target.checked ? 'underline' : 'none' })}
              className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-[10px] text-zinc-400">Underline</span>
          </label>
        </div>

        <SliderInput
          label="Line Height"
          value={style.lineHeight}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(v) => updateStyle({ lineHeight: v })}
        />

        <SliderInput
          label="Letter Spacing"
          value={style.letterSpacing}
          min={-5}
          max={20}
          step={0.5}
          suffix="px"
          onChange={(v) => updateStyle({ letterSpacing: v })}
        />
      </StyleSection>

      {/* Color */}
      <StyleSection title="Color">
        <ColorPicker
          label="Text"
          value={style.fontColor}
          onChange={(v) => updateStyle({ fontColor: v })}
        />
        <ColorPicker
          label="Background"
          value={style.backgroundColor}
          onChange={(v) => updateStyle({ backgroundColor: v })}
          showTransparent
        />
      </StyleSection>

      {/* Stroke / Outline */}
      <StyleSection title="Stroke">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ColorPicker
              label="Color"
              value={style.strokeColor}
              onChange={(v) => updateStyle({ strokeColor: v })}
            />
          </div>
          <div className="w-20">
            <SliderInput
              label="Width"
              value={style.strokeWidth}
              min={0}
              max={10}
              step={0.5}
              suffix="px"
              onChange={(v) => updateStyle({ strokeWidth: v })}
            />
          </div>
        </div>
      </StyleSection>

      {/* Shadow */}
      <StyleSection title="Shadow">
        <ColorPicker
          label="Color"
          value={style.shadowColor}
          onChange={(v) => updateStyle({ shadowColor: v })}
        />
        <SliderInput
          label="Blur"
          value={style.shadowBlur}
          min={0}
          max={20}
          step={1}
          suffix="px"
          onChange={(v) => updateStyle({ shadowBlur: v })}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SliderInput
              label="Offset X"
              value={style.shadowOffsetX}
              min={-20}
              max={20}
              step={1}
              suffix="px"
              onChange={(v) => updateStyle({ shadowOffsetX: v })}
            />
          </div>
          <div className="flex-1">
            <SliderInput
              label="Offset Y"
              value={style.shadowOffsetY}
              min={-20}
              max={20}
              step={1}
              suffix="px"
              onChange={(v) => updateStyle({ shadowOffsetY: v })}
            />
          </div>
        </div>
      </StyleSection>

      {/* Opacity */}
      <StyleSection title="Opacity">
        <SliderInput
          label="Opacity"
          value={Math.round(style.opacity * 100)}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(v) => updateStyle({ opacity: v / 100 })}
        />
      </StyleSection>

      {/* Alignment */}
      <StyleSection title="Alignment">
        <AlignmentPicker
          value={style.textAlign}
          onChange={(v) => updateStyle({ textAlign: v })}
        />
      </StyleSection>

      {/* Position */}
      <StyleSection title="Position">
        <PositionGrid
          value={style.position}
          onChange={(v) => updateStyle({ position: v })}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SliderInput
              label="X"
              value={style.positionX}
              min={0}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => updateStyle({ positionX: v })}
            />
          </div>
          <div className="flex-1">
            <SliderInput
              label="Y"
              value={style.positionY}
              min={0}
              max={100}
              step={1}
              suffix="%"
              onChange={(v) => updateStyle({ positionY: v })}
            />
          </div>
        </div>
      </StyleSection>

      {/* Transform */}
      <StyleSection title="Transform">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SliderInput
              label="Rotation"
              value={style.rotation}
              min={-180}
              max={180}
              step={1}
              suffix="°"
              onChange={(v) => updateStyle({ rotation: v })}
            />
          </div>
          <div className="flex-1">
            <SliderInput
              label="Scale"
              value={Math.round(style.scale * 100)}
              min={10}
              max={500}
              step={5}
              suffix="%"
              onChange={(v) => updateStyle({ scale: v / 100 })}
            />
          </div>
        </div>
      </StyleSection>

      {/* Animation */}
      <StyleSection title="Animation">
        <AnimationPresets
          value={style.animationPreset}
          onChange={(v) => updateStyle({ animationPreset: v })}
        />
      </StyleSection>

      {/* No selection state */}
      {!selectedCaptionId && (
        <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-center">
          <p className="text-[10px] text-zinc-500">
            Select a caption to edit its style
          </p>
        </div>
      )}
    </div>
  )
}
