export type ThemeMode = 'light' | 'dark' | 'system'

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'

export type AutosaveInterval = 30 | 60 | 120 | 300 | 0

export type DefaultExportFormat = 'mp4' | 'srt' | 'vtt'

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2

export type GridSnapBehavior = 'none' | 'caption' | 'marker' | 'both'

export type AIDefaultModel = 'FLUX.2' | 'DALL-E 3' | 'Stable Diffusion' | 'Pika 2.2'

export interface GeneralSettings {
  language: Language
  autosaveInterval: AutosaveInterval
  telemetry: boolean
}

export interface AppearanceSettings {
  theme: ThemeMode
  sidebarCollapsed: boolean
  editorFontSize: number
  reducedMotion: boolean
  highContrast: boolean
}

export interface EditorSettings {
  defaultFontSize: number
  defaultFontFamily: string
  defaultTextAlign: 'left' | 'center' | 'right'
  showGrid: boolean
  snapToGrid: boolean
  gridSnapBehavior: GridSnapBehavior
  showSafeMargins: boolean
  autoSelectNewCaptions: boolean
  wordLevelEditing: boolean
}

export interface TimelineSettings {
  defaultZoom: number
  showWaveform: boolean
  showKeyframes: boolean
  snapToEdges: boolean
  scrollBehavior: 'smooth' | 'instant'
  trackHeight: 'compact' | 'normal' | 'comfortable'
  showThumbnails: boolean
  minClipDuration: number
}

export interface PlaybackSettings {
  defaultSpeed: PlaybackSpeed
  skipForwardInterval: number
  skipBackInterval: number
  loopSegment: boolean
  volumeBoost: boolean
  showFrameCounter: boolean
}

export interface AISettings {
  defaultModel: AIDefaultModel
  apiEndpoint: string
  streamingEnabled: boolean
  autoSuggestCaptions: boolean
  autoTranslate: boolean
  maxTokens: number
  temperature: number
}

export interface ExportSettings {
  defaultFormat: DefaultExportFormat
  defaultResolution: string
  includeCaptions: boolean
  burnCaptions: boolean
  applyStyle: boolean
  namingConvention: '{project}-{format}' | '{project}-captions' | '{project}-{date}'
  openFolderOnComplete: boolean
}

export interface PerformanceSettings {
  gpuAcceleration: boolean
  hardwareEncoding: boolean
  parallelProcessing: boolean
  previewQuality: 'highest' | 'balanced' | 'performance'
  maxUndoLevels: number
  cacheEnabled: boolean
  cacheSize: number
}

export interface StorageSettings {
  localCacheSize: number
  autoCleanCache: boolean
  cleanupInterval: number
  storageQuota: string
  projectBackup: boolean
  backupInterval: number
}

export interface KeyboardShortcut {
  id: string
  label: string
  keys: string
  category: string
}

export interface AppSettings {
  general: GeneralSettings
  appearance: AppearanceSettings
  editor: EditorSettings
  timeline: TimelineSettings
  playback: PlaybackSettings
  ai: AISettings
  exportCfg: ExportSettings
  performance: PerformanceSettings
  storage: StorageSettings
  keyboardShortcuts: KeyboardShortcut[]
}

export type SettingsCategory =
  | 'general'
  | 'appearance'
  | 'editor'
  | 'timeline'
  | 'playback'
  | 'keyboard'
  | 'ai'
  | 'export'
  | 'performance'
  | 'accessibility'
  | 'storage'
  | 'about'

export const SETTINGS_CATEGORIES: { id: SettingsCategory; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'Settings' },
  { id: 'appearance', label: 'Appearance', icon: 'Palette' },
  { id: 'editor', label: 'Editor', icon: 'FileEdit' },
  { id: 'timeline', label: 'Timeline', icon: 'AlignLeft' },
  { id: 'playback', label: 'Playback', icon: 'PlayCircle' },
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: 'Keyboard' },
  { id: 'ai', label: 'AI', icon: 'Sparkles' },
  { id: 'export', label: 'Export', icon: 'Download' },
  { id: 'performance', label: 'Performance', icon: 'Zap' },
  { id: 'accessibility', label: 'Accessibility', icon: 'Accessibility' },
  { id: 'storage', label: 'Storage', icon: 'HardDrive' },
  { id: 'about', label: 'About', icon: 'Info' },
]

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'play-pause', label: 'Play / Pause', keys: 'Space', category: 'Playback' },
  { id: 'skip-forward', label: 'Skip Forward', keys: '→', category: 'Playback' },
  { id: 'skip-back', label: 'Skip Back', keys: '←', category: 'Playback' },
  { id: 'split-clip', label: 'Split Clip', keys: 'S', category: 'Editing' },
  { id: 'delete-clip', label: 'Delete', keys: 'Delete', category: 'Editing' },
  { id: 'undo', label: 'Undo', keys: '⌘Z', category: 'Editing' },
  { id: 'redo', label: 'Redo', keys: '⌘⇧Z', category: 'Editing' },
  { id: 'zoom-in', label: 'Zoom In', keys: '⌘+', category: 'Timeline' },
  { id: 'zoom-out', label: 'Zoom Out', keys: '⌘−', category: 'Timeline' },
  { id: 'fit-timeline', label: 'Fit Timeline', keys: '⌘0', category: 'Timeline' },
  { id: 'save', label: 'Save', keys: '⌘S', category: 'General' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', keys: '⌘B', category: 'General' },
  { id: 'toggle-timeline', label: 'Toggle Timeline', keys: '⌘T', category: 'Timeline' },
  { id: 'export', label: 'Export', keys: '⌘E', category: 'Export' },
  { id: 'search', label: 'Search', keys: '⌘F', category: 'General' },
]

export function defaultAppSettings(): AppSettings {
  return {
    general: { language: 'en', autosaveInterval: 60, telemetry: true },
    appearance: { theme: 'dark', sidebarCollapsed: false, editorFontSize: 14, reducedMotion: false, highContrast: false },
    editor: {
      defaultFontSize: 24, defaultFontFamily: 'Inter', defaultTextAlign: 'center',
      showGrid: true, snapToGrid: true, gridSnapBehavior: 'both', showSafeMargins: true,
      autoSelectNewCaptions: true, wordLevelEditing: true,
    },
    timeline: {
      defaultZoom: 1, showWaveform: true, showKeyframes: false, snapToEdges: true,
      scrollBehavior: 'smooth', trackHeight: 'normal', showThumbnails: true, minClipDuration: 0.5,
    },
    playback: { defaultSpeed: 1, skipForwardInterval: 5, skipBackInterval: 5, loopSegment: false, volumeBoost: false, showFrameCounter: false },
    ai: { defaultModel: 'FLUX.2', apiEndpoint: '', streamingEnabled: true, autoSuggestCaptions: true, autoTranslate: false, maxTokens: 2048, temperature: 0.7 },
    exportCfg: { defaultFormat: 'mp4', defaultResolution: '1920x1080', includeCaptions: true, burnCaptions: true, applyStyle: true, namingConvention: '{project}-captions', openFolderOnComplete: true },
    performance: { gpuAcceleration: true, hardwareEncoding: true, parallelProcessing: false, previewQuality: 'balanced', maxUndoLevels: 50, cacheEnabled: true, cacheSize: 2048 },
    storage: { localCacheSize: 0, autoCleanCache: false, cleanupInterval: 7, storageQuota: '5 GB', projectBackup: true, backupInterval: 24 },
    keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
  }
}
