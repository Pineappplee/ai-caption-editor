export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string
  bio: string
  timezone: string
  dateFormat: string
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  lastLoginAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerName: string
  memberCount: number
  maxMembers: number
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface ConnectedDevice {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'web'
  lastActive: string
  current: boolean
}

export interface AIProvider {
  id: string
  name: string
  icon: string
  enabled: boolean
  modelCount: number
}

export interface StorageUsage {
  used: number
  total: number
  breakdown: { label: string; bytes: number; color: string }[]
}

export interface ActivityItem {
  id: string
  type: 'project_created' | 'caption_edited' | 'export_completed' | 'ai_generated' | 'project_shared' | 'member_added'
  description: string
  timestamp: string
  projectName?: string
}

export interface ProjectStats {
  totalProjects: number
  totalCaptions: number
  totalExports: number
  totalAIGenerations: number
  totalDuration: number
  storageUsed: number
  projectsThisMonth: number
}

export interface BackupInfo {
  lastBackupAt: string | null
  autoBackup: boolean
  backupInterval: number
  totalBackups: number
  lastBackupSize: number
}

export function defaultUserProfile(): UserProfile {
  return {
    id: 'user-1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: 'Video content creator and caption specialist. Making videos accessible for everyone.',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    plan: 'pro',
    createdAt: '2025-01-15T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
  }
}

export function defaultWorkspace(): Workspace {
  return {
    id: 'ws-1',
    name: 'Alex Rivera Productions',
    slug: 'alex-rivera-productions',
    ownerName: 'Alex Rivera',
    memberCount: 3,
    maxMembers: 10,
    plan: 'pro',
    createdAt: '2025-01-15T10:00:00Z',
  }
}

export const MOCK_DEVICES: ConnectedDevice[] = [
  { id: 'dev-1', name: 'MacBook Pro 16"', type: 'desktop', lastActive: new Date().toISOString(), current: true },
  { id: 'dev-2', name: 'iPhone 15 Pro', type: 'mobile', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false },
  { id: 'dev-3', name: 'Chrome (Windows)', type: 'web', lastActive: new Date(Date.now() - 172800000).toISOString(), current: false },
]

export const MOCK_AI_PROVIDERS: AIProvider[] = [
  { id: 'ai-1', name: 'OpenAI', icon: 'Sparkles', enabled: true, modelCount: 3 },
  { id: 'ai-2', name: 'Anthropic', icon: 'Sparkles', enabled: true, modelCount: 2 },
  { id: 'ai-3', name: 'Stability AI', icon: 'Sparkles', enabled: false, modelCount: 1 },
  { id: 'ai-4', name: 'ElevenLabs', icon: 'Volume2', enabled: true, modelCount: 2 },
]

export function defaultStorageUsage(): StorageUsage {
  return {
    used: 2_500_000_000,
    total: 10_000_000_000,
    breakdown: [
      { label: 'Video Projects', bytes: 1_500_000_000, color: '#6366f1' },
      { label: 'AI Generations', bytes: 600_000_000, color: '#ec4899' },
      { label: 'Subtitles & Text', bytes: 50_000_000, color: '#14b8a6' },
      { label: 'Cache & Temp', bytes: 350_000_000, color: '#f59e0b' },
    ],
  }
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act-1', type: 'export_completed', description: 'Exported "Interview Final" as MP4', timestamp: new Date(Date.now() - 3600000).toISOString(), projectName: 'Interview Final' },
  { id: 'act-2', type: 'caption_edited', description: 'Edited 12 captions in "Product Launch"', timestamp: new Date(Date.now() - 7200000).toISOString(), projectName: 'Product Launch' },
  { id: 'act-3', type: 'ai_generated', description: 'AI-generated 3 image assets', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 'act-4', type: 'project_created', description: 'Created "Travel Vlog" project', timestamp: new Date(Date.now() - 86400000).toISOString(), projectName: 'Travel Vlog' },
  { id: 'act-5', type: 'export_completed', description: 'Exported "Webinar Series" as SRT', timestamp: new Date(Date.now() - 172800000).toISOString(), projectName: 'Webinar Series' },
  { id: 'act-6', type: 'project_shared', description: 'Shared "Marketing Video" with team', timestamp: new Date(Date.now() - 259200000).toISOString(), projectName: 'Marketing Video' },
]

export function defaultProjectStats(): ProjectStats {
  return {
    totalProjects: 24,
    totalCaptions: 1872,
    totalExports: 156,
    totalAIGenerations: 89,
    totalDuration: 14400,
    storageUsed: 2_500_000_000,
    projectsThisMonth: 4,
  }
}

export function defaultBackupInfo(): BackupInfo {
  return {
    lastBackupAt: new Date(Date.now() - 86400000).toISOString(),
    autoBackup: true,
    backupInterval: 24,
    totalBackups: 47,
    lastBackupSize: 45_000_000,
  }
}
