import { apiClient } from '@/lib/api-client'
import type { IProfileService } from './interface'
import type {
  UserProfile, Workspace, ConnectedDevice, AIProvider, StorageUsage,
  ActivityItem, ProjectStats, BackupInfo,
} from './types'
import {
  defaultUserProfile, defaultWorkspace, MOCK_DEVICES, MOCK_AI_PROVIDERS,
  defaultStorageUsage, MOCK_ACTIVITY, defaultProjectStats, defaultBackupInfo,
} from './types'

export class HttpProfileService implements IProfileService {
  private workspace: Workspace = { ...defaultWorkspace() }
  private devices: ConnectedDevice[] = [...MOCK_DEVICES]
  private aiProviders: AIProvider[] = [...MOCK_AI_PROVIDERS]
  private storage: StorageUsage = defaultStorageUsage()
  private activity: ActivityItem[] = [...MOCK_ACTIVITY]
  private stats: ProjectStats = defaultProjectStats()
  private backup: BackupInfo = defaultBackupInfo()

  private mapProfile(u: any): UserProfile {
    return {
      ...defaultUserProfile(),
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      bio: u.bio || '',
      plan: u.plan === 'pro' ? 'pro' : 'free',
      createdAt: u.createdAt || new Date().toISOString(),
      lastLoginAt: u.updatedAt || new Date().toISOString(),
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const data = await apiClient.get<any>('/api/v1/users/me')
      return this.mapProfile(data)
    } catch (err) {
      console.warn('Failed to load profile, using default', err)
      return defaultUserProfile()
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl
    if (data.bio !== undefined) payload.bio = data.bio

    try {
      const response = await apiClient.patch<any>('/api/v1/users/me', payload)
      return this.mapProfile(response)
    } catch (err) {
      console.warn('Failed to update profile on backend', err)
      throw err
    }
  }

  async getWorkspace(): Promise<Workspace> {
    return { ...this.workspace }
  }

  async updateWorkspace(data: Partial<Workspace>): Promise<Workspace> {
    this.workspace = { ...this.workspace, ...data }
    return { ...this.workspace }
  }

  async getDevices(): Promise<ConnectedDevice[]> {
    return [...this.devices]
  }

  async removeDevice(id: string): Promise<void> {
    this.devices = this.devices.filter((d) => d.id !== id)
  }

  async getAIProviders(): Promise<AIProvider[]> {
    return [...this.aiProviders]
  }

  async toggleAIProvider(id: string, enabled: boolean): Promise<AIProvider> {
    const idx = this.aiProviders.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Provider not found')
    this.aiProviders[idx] = { ...this.aiProviders[idx], enabled }
    return { ...this.aiProviders[idx] }
  }

  async getStorageUsage(): Promise<StorageUsage> {
    return { ...this.storage, breakdown: [...this.storage.breakdown] }
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    return [...this.activity]
  }

  async getProjectStats(): Promise<ProjectStats> {
    return { ...this.stats }
  }

  async getBackupInfo(): Promise<BackupInfo> {
    return { ...this.backup }
  }

  async triggerBackup(): Promise<BackupInfo> {
    // Trigger mock backup (since there is no backup endpoint in backend)
    await new Promise((r) => setTimeout(r, 600))
    this.backup = {
      ...this.backup,
      lastBackupAt: new Date().toISOString(),
      lastBackupSize: Math.round(40 + Math.random() * 20) * 1024 * 1024,
      totalBackups: this.backup.totalBackups + 1,
    }
    return { ...this.backup }
  }

  async signOut(): Promise<void> {
    // Handled centrally by auth service
  }
}
