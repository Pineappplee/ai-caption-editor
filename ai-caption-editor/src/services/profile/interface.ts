import type { UserProfile, Workspace, ConnectedDevice, AIProvider, StorageUsage, ActivityItem, ProjectStats, BackupInfo } from './types'

export interface IProfileService {
  getProfile(): Promise<UserProfile>
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile>
  getWorkspace(): Promise<Workspace>
  updateWorkspace(data: Partial<Workspace>): Promise<Workspace>
  getDevices(): Promise<ConnectedDevice[]>
  removeDevice(id: string): Promise<void>
  getAIProviders(): Promise<AIProvider[]>
  toggleAIProvider(id: string, enabled: boolean): Promise<AIProvider>
  getStorageUsage(): Promise<StorageUsage>
  getRecentActivity(): Promise<ActivityItem[]>
  getProjectStats(): Promise<ProjectStats>
  getBackupInfo(): Promise<BackupInfo>
  triggerBackup(): Promise<BackupInfo>
  signOut(): Promise<void>
}
