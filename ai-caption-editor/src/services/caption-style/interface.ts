import type { StylePreset } from './types'

export interface ICaptionStyleService {
  getPresets(): Promise<StylePreset[]>
  getDefaultPreset(): Promise<StylePreset>
}
