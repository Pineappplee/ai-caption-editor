import { create } from 'zustand'
import { services } from '@/services'
import type { AppSettings, SettingsCategory } from '@/services/settings'

const service = services.settings

interface SettingsState {
  settings: AppSettings
  loading: boolean
  selectedCategory: SettingsCategory
  searchQuery: string
  dirty: boolean

  loadSettings: () => Promise<void>
  updateSettings: (path: string, value: unknown) => Promise<void>
  setSelectedCategory: (category: SettingsCategory) => void
  setSearchQuery: (query: string) => void
  resetCategory: (category: SettingsCategory) => Promise<void>
  resetAll: () => Promise<void>
}

function setNested(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.')
  const result = { ...obj }
  let current = result as Record<string, unknown>
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])) {
      current[key] = { ...(current[key] as Record<string, unknown>) }
    }
    current = current[key] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
  return result
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null as unknown as AppSettings,
  loading: true,
  selectedCategory: 'general',
  searchQuery: '',
  dirty: false,

  loadSettings: async () => {
    set({ loading: true })
    const settings = await service.load()
    set({ settings, loading: false })
  },

  updateSettings: async (path: string, value: unknown) => {
    const current = get().settings
    if (!current) return
    const updated = setNested(current as unknown as Record<string, unknown>, path, value) as unknown as AppSettings
    set({ settings: updated, dirty: true })
    await service.save(updated)
  },

  setSelectedCategory: (category: SettingsCategory) => set({ selectedCategory: category }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  resetCategory: async (category: SettingsCategory) => {
    const settings = await service.resetCategory(category)
    set({ settings, dirty: true })
  },

  resetAll: async () => {
    const settings = await service.resetAll()
    set({ settings, dirty: false })
  },
}))
