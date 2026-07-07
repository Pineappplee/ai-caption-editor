import type { AppSettings, SettingsCategory } from './types'

export interface ISettingsService {
  load(): Promise<AppSettings>
  save(settings: AppSettings): Promise<void>
  resetCategory(category: SettingsCategory): Promise<AppSettings>
  resetAll(): Promise<AppSettings>
}
