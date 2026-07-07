import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Monitor, Smartphone, Globe, Sparkles, Volume2, HardDrive,
  Activity, BarChart3, Keyboard, RefreshCw, LogOut, ChevronRight, Calendar,
  Clock, Edit2, Check, X, Users as UsersIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfileStore } from '@/stores/profile-store'
import { DEFAULT_KEYBOARD_SHORTCUTS } from '@/services/settings'
import { SettingsToggle } from '@/components/settings/settings-toggle'

const SECTION_NAV = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: UsersIcon },
  { id: 'preferences', label: 'Preferences', icon: User },
  { id: 'devices', label: 'Devices', icon: Monitor },
  { id: 'ai-providers', label: 'AI Providers', icon: Sparkles },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'backup', label: 'Backup & Restore', icon: RefreshCw },
] as const

type SectionId = (typeof SECTION_NAV)[number]['id']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function SectionCard({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function ProfileSection() {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const editing = useProfileStore((s) => s.editing)
  const setEditing = useProfileStore((s) => s.setEditing)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')

  if (!profile) return null

  const handleStartEdit = () => {
    setEditName(profile.name)
    setEditBio(profile.bio)
    setEditing(true)
  }

  const handleSave = async () => {
    await updateProfile({ name: editName, bio: editBio })
    setEditing(false)
  }

  const handleCancel = () => setEditing(false)

  return (
    <SectionCard>
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="size-20 rounded-xl object-cover ring-2 ring-zinc-700"
          />
          <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-zinc-900 bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
            {profile.plan}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
                >
                  <Check className="size-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="size-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-zinc-100">{profile.name}</h2>
              <p className="text-sm text-zinc-500">{profile.email}</p>
              <p className="mt-1.5 text-sm text-zinc-400">{profile.bio}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Last login {relativeTime(profile.lastLoginAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartEdit}
                className="mt-3 flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Edit2 className="size-3" />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

function WorkspaceSection() {
  const workspace = useProfileStore((s) => s.workspace)
  if (!workspace) return null

  return (
    <SectionCard title="Workspace" description="Your workspace and team information.">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-zinc-500">Workspace Name</p>
          <p className="text-sm font-medium text-zinc-200">{workspace.name}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Slug</p>
          <p className="text-sm font-mono text-zinc-400">{workspace.slug}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Owner</p>
          <p className="text-sm font-medium text-zinc-200">{workspace.ownerName}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Members</p>
          <p className="text-sm font-medium text-zinc-200">{workspace.memberCount} / {workspace.maxMembers}</p>
          <div className="mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${(workspace.memberCount / workspace.maxMembers) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 uppercase">
            {workspace.plan}
          </span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
            Created {new Date(workspace.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </SectionCard>
  )
}

function AccountPreferencesSection() {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  if (!profile) return null

  return (
    <SectionCard title="Account Preferences" description="Timezone, date format, and notification preferences.">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Timezone</label>
          <select
            value={profile.timezone}
            onChange={(e) => updateProfile({ timezone: e.target.value })}
            className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
          >
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Chicago">America/Chicago (CST)</option>
            <option value="America/Denver">America/Denver (MST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Date Format</label>
          <select
            value={profile.dateFormat}
            onChange={(e) => updateProfile({ dateFormat: e.target.value })}
            className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <SettingsToggle
          label="Email Notifications"
          description="Receive email updates about your projects"
          checked={profile.emailNotifications}
          onChange={(v) => updateProfile({ emailNotifications: v })}
        />
        <SettingsToggle
          label="Push Notifications"
          description="Receive push notifications in the browser"
          checked={profile.pushNotifications}
          onChange={(v) => updateProfile({ pushNotifications: v })}
        />
        <SettingsToggle
          label="In-App Notifications"
          description="Show notifications within the application"
          checked={profile.inAppNotifications}
          onChange={(v) => updateProfile({ inAppNotifications: v })}
        />
      </div>
    </SectionCard>
  )
}

function DevicesSection() {
  const devices = useProfileStore((s) => s.devices)
  const removeDevice = useProfileStore((s) => s.removeDevice)

  const typeIcon = {
    desktop: Monitor,
    mobile: Smartphone,
    web: Globe,
  }

  return (
    <SectionCard title="Connected Devices" description="Devices that have accessed your account.">
      {devices.length === 0 ? (
        <p className="text-sm text-zinc-500">No devices connected.</p>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => {
            const Icon = typeIcon[device.type]
            return (
              <div key={device.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-200">{device.name}</p>
                    {device.current && (
                      <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {device.type.charAt(0).toUpperCase() + device.type.slice(1)} &middot; Active {relativeTime(device.lastActive)}
                  </p>
                </div>
                {!device.current && (
                  <button
                    type="button"
                    onClick={() => removeDevice(device.id)}
                    className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

function AIProvidersSection() {
  const aiProviders = useProfileStore((s) => s.aiProviders)
  const toggleAIProvider = useProfileStore((s) => s.toggleAIProvider)

  const iconMap: Record<string, typeof Sparkles> = { Sparkles, Volume2 }

  return (
    <SectionCard title="Connected AI Providers" description="Manage AI service integrations. (UI only)">
      <div className="space-y-2">
        {aiProviders.map((provider) => {
          const Icon = iconMap[provider.icon] ?? Sparkles
          return (
            <div key={provider.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
              <div className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                provider.enabled ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-600',
              )}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', provider.enabled ? 'text-zinc-200' : 'text-zinc-500')}>{provider.name}</p>
                <p className="text-xs text-zinc-500">{provider.modelCount} models available</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAIProvider(provider.id, !provider.enabled)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                  provider.enabled ? 'bg-purple-600' : 'bg-zinc-700',
                )}
              >
                <span className={cn(
                  'inline-block size-4 transform rounded-full bg-white transition-transform',
                  provider.enabled ? 'translate-x-[18px]' : 'translate-x-0.5',
                )} />
              </button>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

function StorageSection() {
  const storage = useProfileStore((s) => s.storage)
  if (!storage) return null

  return (
    <SectionCard title="Storage Usage" description="Track your storage consumption across projects and assets.">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-200">{formatBytes(storage.used)}</span>
          <span className="text-sm text-zinc-500">of {formatBytes(storage.total)}</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div className="flex h-full">
            {storage.breakdown.map((item) => (
              <div
                key={item.label}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(item.bytes / storage.total) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-600">{((storage.used / storage.total) * 100).toFixed(0)}% used</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {storage.breakdown.map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-lg bg-zinc-800/30 px-3 py-2">
            <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="min-w-0">
              <p className="truncate text-xs text-zinc-400">{item.label}</p>
              <p className="text-xs font-medium text-zinc-200">{formatBytes(item.bytes)}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function ActivitySection() {
  const activity = useProfileStore((s) => s.activity)

  const typeIcon: Record<string, typeof Activity> = {
    export_completed: ChevronRight,
    caption_edited: Edit2,
    ai_generated: Sparkles,
    project_created: User,
    project_shared: UsersIcon,
    member_added: UsersIcon,
  }

  return (
    <SectionCard title="Recent Activity" description="Your latest actions across all projects.">
      {activity.length === 0 ? (
        <p className="text-sm text-zinc-500">No recent activity.</p>
      ) : (
        <div className="space-y-1">
          {activity.map((item) => {
            const Icon = typeIcon[item.type] ?? Activity
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800/30 transition-colors">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                  <Icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300">{item.description}</p>
                  <p className="text-xs text-zinc-600">{relativeTime(item.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

function StatsSection() {
  const stats = useProfileStore((s) => s.stats)
  if (!stats) return null

  return (
    <SectionCard title="Project Statistics" description="Overall usage and project metrics.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Total Projects" value={String(stats.totalProjects)} />
        <StatBox label="Total Captions" value={String(stats.totalCaptions)} />
        <StatBox label="Total Exports" value={String(stats.totalExports)} />
        <StatBox label="AI Generations" value={String(stats.totalAIGenerations)} />
        <StatBox label="Total Duration" value={formatDuration(stats.totalDuration)} />
        <StatBox label="Storage Used" value={formatBytes(stats.storageUsed)} />
        <StatBox label="Projects This Month" value={String(stats.projectsThisMonth)} />
      </div>
    </SectionCard>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  )
}

function ShortcutsSection() {
  const grouped = DEFAULT_KEYBOARD_SHORTCUTS.reduce<Record<string, typeof DEFAULT_KEYBOARD_SHORTCUTS>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <SectionCard title="Keyboard Shortcuts" description="Reference of available keyboard shortcuts.">
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{category}</h4>
            <div className="space-y-1">
              {items.map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2">
                  <span className="text-sm text-zinc-300">{shortcut.label}</span>
                  <kbd className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400 shadow-sm">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function BackupSection() {
  const backup = useProfileStore((s) => s.backup)
  const triggerBackup = useProfileStore((s) => s.triggerBackup)
  const [backingUp, setBackingUp] = useState(false)

  if (!backup) return null

  const handleBackup = async () => {
    setBackingUp(true)
    await triggerBackup()
    setBackingUp(false)
  }

  return (
    <SectionCard title="Backup & Restore" description="Manage project backups. (UI only)">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
            <p className="text-xs text-zinc-500">Last Backup</p>
            <p className="text-sm font-medium text-zinc-200">
              {backup.lastBackupAt ? relativeTime(backup.lastBackupAt) : 'Never'}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
            <p className="text-xs text-zinc-500">Total Backups</p>
            <p className="text-sm font-medium text-zinc-200">{backup.totalBackups}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
            <p className="text-xs text-zinc-500">Last Backup Size</p>
            <p className="text-sm font-medium text-zinc-200">{formatBytes(backup.lastBackupSize)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-2.5">
            <p className="text-xs text-zinc-500">Auto Backup</p>
            <p className="text-sm font-medium text-zinc-200">Every {backup.backupInterval}h</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBackup}
            disabled={backingUp}
            className="flex items-center gap-1.5 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('size-4', backingUp && 'animate-spin')} />
            {backingUp ? 'Backing up...' : 'Backup Now'}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="size-4" />
            Restore
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

function SignOutSection() {
  const navigate = useNavigate()
  const signOut = useProfileStore((s) => s.signOut)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <SectionCard title="Sign Out" description="Sign out of your account on this device.">
      <p className="mb-3 text-sm text-zinc-400">
        You will be redirected to the landing page. Your projects and settings will be saved.
      </p>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-lg bg-red-600/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
      >
        <LogOut className="size-4" />
        Sign Out
      </button>
    </SectionCard>
  )
}

const SECTION_RENDERERS: Record<SectionId, () => React.ReactNode> = {
  profile: ProfileSection,
  workspace: WorkspaceSection,
  preferences: AccountPreferencesSection,
  devices: DevicesSection,
  'ai-providers': AIProvidersSection,
  storage: StorageSection,
  activity: ActivitySection,
  stats: StatsSection,
  shortcuts: ShortcutsSection,
  backup: BackupSection,
}

// Account preferences integrated into Profile section

export function ProfilePage() {
  const loading = useProfileStore((s) => s.loading)
  const profile = useProfileStore((s) => s.profile)
  const loadAll = useProfileStore((s) => s.loadAll)
  const [activeSection, setActiveSection] = useState<SectionId>('profile')

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (loading || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
      </div>
    )
  }

  const Renderer = SECTION_RENDERERS[activeSection]

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar navigation */}
      <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/30">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Profile</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {SECTION_NAV.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="border-t border-zinc-800 px-3 py-3">
          <button
            type="button"
            onClick={() => {
              useProfileStore.getState().signOut()
              window.location.href = '/'
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-2xl space-y-5">
          <Renderer />

          {/* Sign Out at bottom when viewing other sections */}
          {activeSection !== 'profile' && (
            <div className="pt-2">
              <SignOutSection />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
