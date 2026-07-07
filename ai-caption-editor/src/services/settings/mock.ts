import type { AppSettings, SettingsCategory } from './types'
import { defaultAppSettings } from './types'
import type { ISettingsService } from './interface'
import { StorageRegistry } from '../storage/storage-provider'

const STORAGE_KEY = 'ai-caption-editor-settings'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export class MockSettingsService implements ISettingsService {
  async load(): Promise<AppSettings> {
    await sleep(80)
    try {
      const stored = await StorageRegistry.getProvider().getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>
        return { ...defaultAppSettings(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return defaultAppSettings()
  }

  async save(settings: AppSettings): Promise<void> {
    await sleep(50)
    await StorageRegistry.getProvider().setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  async resetCategory(category: SettingsCategory): Promise<AppSettings> {
    await sleep(50)
    const defaults = defaultAppSettings()
    const current = await this.load()
    let key: keyof AppSettings
    switch (category) {
      case 'general': key = 'general'; break
      case 'appearance': key = 'appearance'; break
      case 'accessibility': key = 'appearance'; break
      case 'editor': key = 'editor'; break
      case 'timeline': key = 'timeline'; break
      case 'playback': key = 'playback'; break
      case 'ai': key = 'ai'; break
      case 'export': key = 'exportCfg'; break
      case 'performance': key = 'performance'; break
      case 'storage': key = 'storage'; break
      case 'keyboard': return current // no reset for shortcuts
      case 'about': return current
    }
    const merged = { ...current, [key]: { ...defaults[key] } }
    await this.save(merged)
    return merged
  }

  async resetAll(): Promise<AppSettings> {
    await sleep(100)
    const defaults = defaultAppSettings()
    await StorageRegistry.getProvider().removeItem(STORAGE_KEY)
    return defaults
  }
}
