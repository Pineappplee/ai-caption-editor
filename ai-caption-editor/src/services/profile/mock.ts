import type { UserProfile, Workspace, ConnectedDevice, AIProvider, StorageUsage, ActivityItem, ProjectStats, BackupInfo } from './types'
import {
  defaultUserProfile, defaultWorkspace, MOCK_DEVICES, MOCK_AI_PROVIDERS,
  defaultStorageUsage, MOCK_ACTIVITY, defaultProjectStats, defaultBackupInfo,
} from './types'
import type { IProfileService } from './interface'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export class MockProfileService implements IProfileService {
  private profile: UserProfile = { ...defaultUserProfile() }
  private workspace: Workspace = { ...defaultWorkspace() }
  private devices: ConnectedDevice[] = [...MOCK_DEVICES]
  private aiProviders: AIProvider[] = [...MOCK_AI_PROVIDERS]
  private storage: StorageUsage = defaultStorageUsage()
  private activity: ActivityItem[] = [...MOCK_ACTIVITY]
  private stats: ProjectStats = defaultProjectStats()
  private backup: BackupInfo = defaultBackupInfo()

  async getProfile(): Promise<UserProfile> {
    await sleep(100)
    return { ...this.profile }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    await sleep(150)
    this.profile = { ...this.profile, ...data }
    return { ...this.profile }
  }

  async getWorkspace(): Promise<Workspace> {
    await sleep(100)
    return { ...this.workspace }
  }

  async updateWorkspace(data: Partial<Workspace>): Promise<Workspace> {
    await sleep(150)
    this.workspace = { ...this.workspace, ...data }
    return { ...this.workspace }
  }

  async getDevices(): Promise<ConnectedDevice[]> {
    await sleep(80)
    return [...this.devices]
  }

  async removeDevice(id: string): Promise<void> {
    await sleep(100)
    this.devices = this.devices.filter((d) => d.id !== id)
  }

  async getAIProviders(): Promise<AIProvider[]> {
    await sleep(80)
    return [...this.aiProviders]
  }

  async toggleAIProvider(id: string, enabled: boolean): Promise<AIProvider> {
    await sleep(100)
    const idx = this.aiProviders.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Provider not found')
    this.aiProviders[idx] = { ...this.aiProviders[idx], enabled }
    return { ...this.aiProviders[idx] }
  }

  async getStorageUsage(): Promise<StorageUsage> {
    await sleep(80)
    return { ...this.storage, breakdown: [...this.storage.breakdown] }
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    await sleep(100)
    return [...this.activity]
  }

  async getProjectStats(): Promise<ProjectStats> {
    await sleep(80)
    return { ...this.stats }
  }

  async getBackupInfo(): Promise<BackupInfo> {
    await sleep(80)
    return { ...this.backup }
  }

  async triggerBackup(): Promise<BackupInfo> {
    await sleep(500)
    this.backup = { ...this.backup, lastBackupAt: new Date().toISOString(), lastBackupSize: Math.round(40 + Math.random() * 20) * 1024 * 1024, totalBackups: this.backup.totalBackups + 1 }
    return { ...this.backup }
  }

  async signOut(): Promise<void> {
    await sleep(100)
    // no-op in mock
  }
}
