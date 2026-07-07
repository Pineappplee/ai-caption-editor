import { create } from 'zustand'
import { services } from '@/services'
import type { UserProfile, Workspace, ConnectedDevice, AIProvider, StorageUsage, ActivityItem, ProjectStats, BackupInfo } from '@/services/profile'

const service = services.profile

interface ProfileState {
  profile: UserProfile | null
  workspace: Workspace | null
  devices: ConnectedDevice[]
  aiProviders: AIProvider[]
  storage: StorageUsage | null
  activity: ActivityItem[]
  stats: ProjectStats | null
  backup: BackupInfo | null
  loading: boolean
  editing: boolean

  loadAll: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  updateWorkspace: (data: Partial<Workspace>) => Promise<void>
  removeDevice: (id: string) => Promise<void>
  toggleAIProvider: (id: string, enabled: boolean) => Promise<void>
  triggerBackup: () => Promise<void>
  signOut: () => Promise<void>
  setEditing: (editing: boolean) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  workspace: null,
  devices: [],
  aiProviders: [],
  storage: null,
  activity: [],
  stats: null,
  backup: null,
  loading: true,
  editing: false,

  loadAll: async () => {
    set({ loading: true })
    const [profile, workspace, devices, aiProviders, storage, activity, stats, backup] = await Promise.all([
      service.getProfile(),
      service.getWorkspace(),
      service.getDevices(),
      service.getAIProviders(),
      service.getStorageUsage(),
      service.getRecentActivity(),
      service.getProjectStats(),
      service.getBackupInfo(),
    ])
    set({ profile, workspace, devices, aiProviders, storage, activity, stats, backup, loading: false })
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const profile = await service.updateProfile(data)
    set({ profile })
  },

  updateWorkspace: async (data: Partial<Workspace>) => {
    const workspace = await service.updateWorkspace(data)
    set({ workspace })
  },

  removeDevice: async (id: string) => {
    await service.removeDevice(id)
    set((s) => ({ devices: s.devices.filter((d) => d.id !== id) }))
  },

  toggleAIProvider: async (id: string, enabled: boolean) => {
    await service.toggleAIProvider(id, enabled)
    set((s) => ({
      aiProviders: s.aiProviders.map((p) => (p.id === id ? { ...p, enabled } : p)),
    }))
  },

  triggerBackup: async () => {
    const backup = await service.triggerBackup()
    set({ backup })
  },

  signOut: async () => {
    await service.signOut()
  },

  setEditing: (editing: boolean) => set({ editing }),
}))
