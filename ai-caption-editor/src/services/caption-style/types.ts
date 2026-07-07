import type { CaptionStyle } from '@/services/editor'

export interface StylePreset {
  id: string
  name: string
  style: CaptionStyle
  category: 'modern' | 'classic' | 'minimal' | 'cinematic' | 'gaming'
}

export interface StyleClipboard {
  style: CaptionStyle
  captionIds: string[]
}
