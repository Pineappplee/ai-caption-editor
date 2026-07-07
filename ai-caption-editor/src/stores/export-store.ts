import { create } from 'zustand'
import { services } from '@/services'
import { defaultExportSettings } from '@/services/export'
import type { ExportSettings, ExportJob, ExportFormat } from '@/services/export'

const service = services.export

interface ExportState {
  isOpen: boolean
  settings: ExportSettings
  currentJob: ExportJob | null
  isExporting: boolean
  history: ExportJob[]

  openExportCenter: (projectTitle?: string) => void
  closeExportCenter: () => void
  setFormat: (format: ExportFormat) => void
  updateSettings: (partial: Partial<ExportSettings>) => void
  startExport: (projectId: string) => Promise<void>
  cancelExport: () => void
  loadHistory: (projectId: string) => Promise<void>
  clearJob: () => void
}

export const useExportStore = create<ExportState>((set, get) => ({
  isOpen: false,
  settings: defaultExportSettings(),
  currentJob: null,
  isExporting: false,
  history: [],

  openExportCenter: (projectTitle?: string) => {
    set({ isOpen: true, settings: defaultExportSettings(projectTitle), currentJob: null })
  },

  closeExportCenter: () => {
    set({ isOpen: false })
  },

  setFormat: (format: ExportFormat) => {
    set((s) => ({
      settings: { ...s.settings, format },
    }))
  },

  updateSettings: (partial: Partial<ExportSettings>) => {
    set((s) => ({
      settings: { ...s.settings, ...partial },
    }))
  },

  startExport: async (projectId: string) => {
    const { settings } = get()
    set({ isExporting: true, currentJob: null })
    try {
      for await (const job of service.startExport(projectId, settings)) {
        set({ currentJob: job })
      }
      const finalJob = get().currentJob
      if (finalJob && finalJob.status === 'complete') {
        set((s) => ({ history: [finalJob, ...s.history] }))
      }
    } catch {
      set((s) => ({
        currentJob: s.currentJob ? { ...s.currentJob, status: 'error', error: 'Export failed' } : null,
      }))
    } finally {
      set({ isExporting: false })
    }
  },

  cancelExport: async () => {
    const job = get().currentJob
    if (job && (job.status === 'queued' || job.status === 'exporting' || job.status === 'processing')) {
      await service.cancelExport(job.id)
    }
    set({ isExporting: false })
  },

  loadHistory: async (projectId: string) => {
    const history = await service.getExportHistory(projectId)
    set({ history })
  },

  clearJob: () => set({ currentJob: null }),
}))
