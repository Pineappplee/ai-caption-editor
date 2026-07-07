import { create } from 'zustand'
import type { CaptionStyle } from '@/services/editor'
import type { StylePreset, StyleClipboard } from '@/services/caption-style'
import { services } from '@/services'

const service = services.captionStyle

const DEFAULT_STYLE: CaptionStyle = {
  fontSize: 24,
  fontFamily: 'Inter',
  fontWeight: '600',
  fontStyle: 'normal',
  textDecoration: 'none',
  fontColor: '#FFFFFF',
  backgroundColor: '#00000080',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  opacity: 1,
  lineHeight: 1.4,
  letterSpacing: 0,
  textAlign: 'center',
  position: 'bottom',
  positionX: 50,
  positionY: 90,
  rotation: 0,
  scale: 1,
  animationPreset: null,
}

interface StyleStoreState {
  presets: StylePreset[]
  activePresetId: string | null
  clipboard: StyleClipboard | null
  isMultiSelection: boolean
  selectedCount: number

  loadPresets: () => Promise<void>
  applyPreset: (presetId: string) => StylePreset | undefined
  copyStyle: (style: CaptionStyle, captionIds: string[]) => void
  pasteStyle: () => StyleClipboard | null
  resetStyle: () => CaptionStyle
  getDefaultStyle: () => CaptionStyle
}

export const useStyleStore = create<StyleStoreState>((set, get) => ({
  presets: [],
  activePresetId: null,
  clipboard: null,
  isMultiSelection: false,
  selectedCount: 0,

  loadPresets: async () => {
    const presets = await service.getPresets()
    set({ presets })
  },

  applyPreset: (presetId: string) => {
    const preset = get().presets.find((p) => p.id === presetId)
    if (preset) set({ activePresetId: presetId })
    return preset
  },

  copyStyle: (style: CaptionStyle, captionIds: string[]) => {
    set({ clipboard: { style: { ...style }, captionIds: [...captionIds] } })
  },

  pasteStyle: () => {
    return get().clipboard ? { ...get().clipboard!, style: { ...get().clipboard!.style } } : null
  },

  resetStyle: () => {
    set({ activePresetId: null })
    return { ...DEFAULT_STYLE }
  },

  getDefaultStyle: () => ({ ...DEFAULT_STYLE }),
}))
