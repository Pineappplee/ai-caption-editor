import { useEffect, type ReactNode } from 'react'
import {
  Settings, Palette, FileEdit, AlignLeft, PlayCircle, Keyboard, Sparkles,
  Download, Zap, Accessibility, HardDrive, Info, Search, RotateCcw, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings-store'
import { SETTINGS_CATEGORIES } from '@/services/settings'
import type { SettingsCategory, Language, AutosaveInterval, ExportSettings as ExportCfgSettings, ThemeMode, PlaybackSpeed, GridSnapBehavior, AIDefaultModel } from '@/services/settings'
import { SettingsToggle } from '@/components/settings/settings-toggle'
import { SettingsSelect } from '@/components/settings/settings-select'
import { SettingsInput } from '@/components/settings/settings-input'
import { SettingsSlider } from '@/components/settings/settings-slider'

const iconMap: Record<string, typeof Settings> = {
  Settings, Palette, FileEdit, AlignLeft, PlayCircle, Keyboard, Sparkles,
  Download, Zap, Accessibility, HardDrive, Info,
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function GeneralSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { general } = settings

  return (
    <SettingsSection title="General" description="Application-wide preferences and behavior.">
      <SettingsSelect
        label="Language"
        description="Interface language"
        value={general.language}
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'zh', label: 'Chinese' },
          { value: 'ja', label: 'Japanese' },
        ]}
        onChange={(v) => update('general.language', v as Language)}
      />
      <SettingsSelect
        label="Autosave Interval"
        description="How often to automatically save your project"
        value={String(general.autosaveInterval)}
        options={[
          { value: '30', label: 'Every 30 seconds' },
          { value: '60', label: 'Every minute' },
          { value: '120', label: 'Every 2 minutes' },
          { value: '300', label: 'Every 5 minutes' },
          { value: '0', label: 'Disabled' },
        ]}
        onChange={(v) => update('general.autosaveInterval', Number(v) as AutosaveInterval)}
      />
      <SettingsToggle
        label="Telemetry"
        description="Help improve the app by sending anonymous usage data"
        checked={general.telemetry}
        onChange={(v) => update('general.telemetry', v)}
      />
    </SettingsSection>
  )
}

function AppearanceSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { appearance } = settings

  return (
    <SettingsSection title="Appearance" description="Customize the look and feel of the editor.">
      <SettingsSelect
        label="Theme"
        description="Choose between light, dark, or system theme"
        value={appearance.theme}
        options={[
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
          { value: 'system', label: 'System' },
        ]}
        onChange={(v) => update('appearance.theme', v as ThemeMode)}
      />
      <SettingsSlider
        label="Editor Font Size"
        description="Base font size for the editor interface"
        value={appearance.editorFontSize}
        min={12}
        max={20}
        step={1}
        onChange={(v) => update('appearance.editorFontSize', v)}
        suffix="px"
      />
      <SettingsToggle
        label="Sidebar Collapsed"
        description="Start with the sidebar collapsed by default"
        checked={appearance.sidebarCollapsed}
        onChange={(v) => update('appearance.sidebarCollapsed', v)}
      />
    </SettingsSection>
  )
}

function EditorSettingsSection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { editor } = settings

  return (
    <SettingsSection title="Editor" description="Configure caption editing behavior and defaults.">
      <SettingsSlider
        label="Default Font Size"
        description="Font size for new captions"
        value={editor.defaultFontSize}
        min={12}
        max={72}
        step={1}
        onChange={(v) => update('editor.defaultFontSize', v)}
        suffix="px"
      />
      <SettingsInput
        label="Default Font Family"
        description="Font family for new captions"
        value={editor.defaultFontFamily}
        onChange={(v) => update('editor.defaultFontFamily', v)}
      />
      <SettingsSelect
        label="Default Text Alignment"
        value={editor.defaultTextAlign}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        onChange={(v) => update('editor.defaultTextAlign', v as 'left' | 'center' | 'right')}
      />
      <SettingsToggle
        label="Show Grid"
        description="Display alignment grid in the preview area"
        checked={editor.showGrid}
        onChange={(v) => update('editor.showGrid', v)}
      />
      <SettingsToggle
        label="Snap to Grid"
        description="Snap captions to grid lines"
        checked={editor.snapToGrid}
        onChange={(v) => update('editor.snapToGrid', v)}
      />
      <SettingsSelect
        label="Grid Snap Behavior"
        description="What elements snap to the grid"
        value={editor.gridSnapBehavior}
        options={[
          { value: 'none', label: 'None' },
          { value: 'caption', label: 'Captions only' },
          { value: 'marker', label: 'Markers only' },
          { value: 'both', label: 'Both captions and markers' },
        ]}
        onChange={(v) => update('editor.gridSnapBehavior', v as GridSnapBehavior)}
      />
      <SettingsToggle
        label="Safe Margins"
        description="Show safe title and action margins"
        checked={editor.showSafeMargins}
        onChange={(v) => update('editor.showSafeMargins', v)}
      />
      <SettingsToggle
        label="Auto-Select New Captions"
        description="Automatically select newly created captions"
        checked={editor.autoSelectNewCaptions}
        onChange={(v) => update('editor.autoSelectNewCaptions', v)}
      />
      <SettingsToggle
        label="Word-Level Editing"
        description="Edit individual words within captions"
        checked={editor.wordLevelEditing}
        onChange={(v) => update('editor.wordLevelEditing', v)}
      />
    </SettingsSection>
  )
}

function TimelineSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { timeline } = settings

  return (
    <SettingsSection title="Timeline" description="Configure timeline appearance and behavior.">
      <SettingsSlider
        label="Default Zoom"
        description="Default zoom level when opening a project"
        value={timeline.defaultZoom}
        min={0.1}
        max={5}
        step={0.1}
        onChange={(v) => update('timeline.defaultZoom', v)}
        suffix="×"
      />
      <SettingsToggle
        label="Show Waveform"
        description="Display audio waveform on the timeline"
        checked={timeline.showWaveform}
        onChange={(v) => update('timeline.showWaveform', v)}
      />
      <SettingsToggle
        label="Show Keyframes"
        description="Display keyframe markers on clips"
        checked={timeline.showKeyframes}
        onChange={(v) => update('timeline.showKeyframes', v)}
      />
      <SettingsToggle
        label="Snap to Edges"
        description="Snap clips to edges and markers"
        checked={timeline.snapToEdges}
        onChange={(v) => update('timeline.snapToEdges', v)}
      />
      <SettingsSelect
        label="Scroll Behavior"
        value={timeline.scrollBehavior}
        options={[
          { value: 'smooth', label: 'Smooth' },
          { value: 'instant', label: 'Instant' },
        ]}
        onChange={(v) => update('timeline.scrollBehavior', v as 'smooth' | 'instant')}
      />
      <SettingsSelect
        label="Track Height"
        value={timeline.trackHeight}
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'normal', label: 'Normal' },
          { value: 'comfortable', label: 'Comfortable' },
        ]}
        onChange={(v) => update('timeline.trackHeight', v as 'compact' | 'normal' | 'comfortable')}
      />
      <SettingsToggle
        label="Show Thumbnails"
        description="Display video thumbnails on timeline clips"
        checked={timeline.showThumbnails}
        onChange={(v) => update('timeline.showThumbnails', v)}
      />
      <SettingsSlider
        label="Minimum Clip Duration"
        description="Minimum duration for new clips (seconds)"
        value={timeline.minClipDuration}
        min={0.1}
        max={2}
        step={0.1}
        onChange={(v) => update('timeline.minClipDuration', v)}
        suffix="s"
      />
    </SettingsSection>
  )
}

function PlaybackSettings() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { playback } = settings

  return (
    <SettingsSection title="Playback" description="Configure video playback preferences.">
      <SettingsSelect
        label="Default Speed"
        description="Default playback speed"
        value={String(playback.defaultSpeed)}
        options={[
          { value: '0.25', label: '0.25×' },
          { value: '0.5', label: '0.5×' },
          { value: '0.75', label: '0.75×' },
          { value: '1', label: '1× (Normal)' },
          { value: '1.25', label: '1.25×' },
          { value: '1.5', label: '1.5×' },
          { value: '2', label: '2×' },
        ]}
        onChange={(v) => update('playback.defaultSpeed', Number(v) as PlaybackSpeed)}
      />
      <SettingsSlider
        label="Skip Forward Interval"
        description="Seconds to skip forward with keyboard shortcut"
        value={playback.skipForwardInterval}
        min={1}
        max={30}
        step={1}
        onChange={(v) => update('playback.skipForwardInterval', v)}
        suffix="s"
      />
      <SettingsSlider
        label="Skip Back Interval"
        description="Seconds to skip back with keyboard shortcut"
        value={playback.skipBackInterval}
        min={1}
        max={30}
        step={1}
        onChange={(v) => update('playback.skipBackInterval', v)}
        suffix="s"
      />
      <SettingsToggle
        label="Loop Segment"
        description="Automatically loop the selected segment"
        checked={playback.loopSegment}
        onChange={(v) => update('playback.loopSegment', v)}
      />
      <SettingsToggle
        label="Volume Boost"
        description="Boost audio volume beyond 100%"
        checked={playback.volumeBoost}
        onChange={(v) => update('playback.volumeBoost', v)}
      />
      <SettingsToggle
        label="Show Frame Counter"
        description="Display the current frame number"
        checked={playback.showFrameCounter}
        onChange={(v) => update('playback.showFrameCounter', v)}
      />
    </SettingsSection>
  )
}

function KeyboardShortcutsSection() {
  const settings = useSettingsStore((s) => s.settings)
  if (!settings) return null
  const shortcuts = settings.keyboardShortcuts

  const grouped = shortcuts.reduce<Record<string, typeof shortcuts>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <SettingsSection title="Keyboard Shortcuts" description="All available keyboard shortcuts for the editor.">
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
      <p className="mt-4 text-xs text-zinc-600">Keyboard shortcuts are not customizable in this version.</p>
    </SettingsSection>
  )
}

function AISettings() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { ai } = settings

  return (
    <SettingsSection title="AI" description="Configure AI model preferences and features.">
      <SettingsSelect
        label="Default Model"
        description="AI model to use for generation"
        value={ai.defaultModel}
        options={[
          { value: 'FLUX.2', label: 'FLUX.2' },
          { value: 'DALL-E 3', label: 'DALL-E 3' },
          { value: 'Stable Diffusion', label: 'Stable Diffusion' },
          { value: 'Pika 2.2', label: 'Pika 2.2' },
        ]}
        onChange={(v) => update('ai.defaultModel', v as AIDefaultModel)}
      />
      <SettingsInput
        label="API Endpoint"
        description="Custom API endpoint URL (leave blank for default)"
        value={ai.apiEndpoint}
        onChange={(v) => update('ai.apiEndpoint', v)}
      />
      <SettingsToggle
        label="Streaming"
        description="Enable streaming for real-time AI responses"
        checked={ai.streamingEnabled}
        onChange={(v) => update('ai.streamingEnabled', v)}
      />
      <SettingsToggle
        label="Auto-Suggest Captions"
        description="Automatically suggest caption improvements"
        checked={ai.autoSuggestCaptions}
        onChange={(v) => update('ai.autoSuggestCaptions', v)}
      />
      <SettingsToggle
        label="Auto-Translate"
        description="Automatically translate captions when language changes"
        checked={ai.autoTranslate}
        onChange={(v) => update('ai.autoTranslate', v)}
      />
      <SettingsSlider
        label="Max Tokens"
        description="Maximum tokens for AI responses"
        value={ai.maxTokens}
        min={256}
        max={8192}
        step={256}
        onChange={(v) => update('ai.maxTokens', v)}
      />
      <SettingsSlider
        label="Temperature"
        description="AI response creativity (0 = deterministic, 2 = creative)"
        value={ai.temperature}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => update('ai.temperature', v)}
      />
    </SettingsSection>
  )
}

function ExportSettingsSection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { exportCfg } = settings

  return (
    <SettingsSection title="Export" description="Default export preferences.">
      <SettingsSelect
        label="Default Format"
        description="Default export format when opening the Export Center"
        value={exportCfg.defaultFormat}
        options={[
          { value: 'mp4', label: 'MP4 Video' },
          { value: 'srt', label: 'SRT Subtitles' },
          { value: 'vtt', label: 'VTT Subtitles' },
        ]}
        onChange={(v) => update('exportCfg.defaultFormat', v as ExportCfgSettings['defaultFormat'])}
      />
      <SettingsSelect
        label="Default Resolution"
        description="Default video resolution for exports"
        value={exportCfg.defaultResolution}
        options={[
          { value: '3840x2160', label: '4K (3840×2160)' },
          { value: '1920x1080', label: '1080p (1920×1080)' },
          { value: '1280x720', label: '720p (1280×720)' },
          { value: '854x480', label: '480p (854×480)' },
          { value: '640x360', label: '360p (640×360)' },
        ]}
        onChange={(v) => update('exportCfg.defaultResolution', v)}
      />
      <SettingsToggle
        label="Include Captions"
        description="Include captions by default in exports"
        checked={exportCfg.includeCaptions}
        onChange={(v) => update('exportCfg.includeCaptions', v)}
      />
      <SettingsToggle
        label="Burn Captions"
        description="Burn captions into video by default"
        checked={exportCfg.burnCaptions}
        onChange={(v) => update('exportCfg.burnCaptions', v)}
      />
      <SettingsToggle
        label="Apply Style"
        description="Apply current caption style in exports"
        checked={exportCfg.applyStyle}
        onChange={(v) => update('exportCfg.applyStyle', v)}
      />
      <SettingsSelect
        label="Naming Convention"
        description="Default file naming pattern"
        value={exportCfg.namingConvention}
        options={[
          { value: '{project}-captions', label: '{project}-captions' },
          { value: '{project}-{format}', label: '{project}-{format}' },
          { value: '{project}-{date}', label: '{project}-{date}' },
        ]}
        onChange={(v) => update('exportCfg.namingConvention', v as ExportCfgSettings['namingConvention'])}
      />
      <SettingsToggle
        label="Open Folder on Complete"
        description="Open output folder after export completes"
        checked={exportCfg.openFolderOnComplete}
        onChange={(v) => update('exportCfg.openFolderOnComplete', v)}
      />
    </SettingsSection>
  )
}

function PerformanceSettingsSection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { performance } = settings

  return (
    <SettingsSection title="Performance" description="Configure performance and rendering options.">
      <SettingsToggle
        label="GPU Acceleration"
        description="Use GPU for video rendering and effects"
        checked={performance.gpuAcceleration}
        onChange={(v) => update('performance.gpuAcceleration', v)}
      />
      <SettingsToggle
        label="Hardware Encoding"
        description="Use hardware encoder for faster exports"
        checked={performance.hardwareEncoding}
        onChange={(v) => update('performance.hardwareEncoding', v)}
      />
      <SettingsToggle
        label="Parallel Processing"
        description="Process multiple tasks simultaneously"
        checked={performance.parallelProcessing}
        onChange={(v) => update('performance.parallelProcessing', v)}
      />
      <SettingsSelect
        label="Preview Quality"
        description="Quality of the video preview during editing"
        value={performance.previewQuality}
        options={[
          { value: 'highest', label: 'Highest Quality' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'performance', label: 'Performance' },
        ]}
        onChange={(v) => update('performance.previewQuality', v as 'highest' | 'balanced' | 'performance')}
      />
      <SettingsSlider
        label="Max Undo Levels"
        description="Maximum number of undo steps"
        value={performance.maxUndoLevels}
        min={10}
        max={200}
        step={10}
        onChange={(v) => update('performance.maxUndoLevels', v)}
      />
      <SettingsToggle
        label="Cache Enabled"
        description="Cache rendered frames for faster playback"
        checked={performance.cacheEnabled}
        onChange={(v) => update('performance.cacheEnabled', v)}
      />
      <SettingsSlider
        label="Cache Size"
        description="Maximum disk cache size for rendered frames"
        value={performance.cacheSize}
        min={256}
        max={16384}
        step={256}
        onChange={(v) => update('performance.cacheSize', v)}
        suffix=" MB"
      />
    </SettingsSection>
  )
}

function AccessibilitySection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { appearance } = settings

  return (
    <SettingsSection title="Accessibility" description="Accessibility and display preferences.">
      <SettingsToggle
        label="Reduced Motion"
        description="Minimize animations and transitions"
        checked={appearance.reducedMotion}
        onChange={(v) => update('appearance.reducedMotion', v)}
      />
      <SettingsToggle
        label="High Contrast"
        description="Increase contrast for better readability"
        checked={appearance.highContrast}
        onChange={(v) => update('appearance.highContrast', v)}
      />
      <SettingsSlider
        label="Editor Font Size"
        description="Interface font size for readability"
        value={appearance.editorFontSize}
        min={12}
        max={24}
        step={1}
        onChange={(v) => update('appearance.editorFontSize', v)}
        suffix="px"
      />
      <p className="mt-4 text-xs text-zinc-600">
        Additional accessibility features are available through your operating system's accessibility settings.
      </p>
    </SettingsSection>
  )
}

function StorageSection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.updateSettings)
  if (!settings) return null
  const { storage } = settings

  const handleClearCache = () => {
    useSettingsStore.setState((s) => ({
      settings: s.settings ? { ...s.settings, storage: { ...s.settings.storage, localCacheSize: 0 } } : s.settings,
    }))
  }

  return (
    <SettingsSection title="Storage" description="Manage local storage and cache.">
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">Local Cache</p>
            <p className="text-xs text-zinc-500">{formatBytes(storage.localCacheSize)} used</p>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="size-3" />
            Clear Cache
          </button>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/4 rounded-full bg-purple-500" />
        </div>
        <p className="mt-1 text-[10px] text-zinc-600">Storage Quota: {storage.storageQuota}</p>
      </div>

      <SettingsToggle
        label="Auto-Clean Cache"
        description="Automatically clear cache when it exceeds the limit"
        checked={storage.autoCleanCache}
        onChange={(v) => update('storage.autoCleanCache', v)}
      />
      <SettingsSlider
        label="Cleanup Interval"
        description="Days between automatic cache cleanups"
        value={storage.cleanupInterval}
        min={1}
        max={30}
        step={1}
        onChange={(v) => update('storage.cleanupInterval', v)}
        suffix=" days"
      />
      <SettingsToggle
        label="Project Backup"
        description="Create automatic backups of your projects"
        checked={storage.projectBackup}
        onChange={(v) => update('storage.projectBackup', v)}
      />
      <SettingsSlider
        label="Backup Interval"
        description="Hours between automatic project backups"
        value={storage.backupInterval}
        min={1}
        max={72}
        step={1}
        onChange={(v) => update('storage.backupInterval', v)}
        suffix=" hours"
      />
    </SettingsSection>
  )
}

function AboutSection() {
  return (
    <SettingsSection title="About" description="Application information.">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-purple-600">
            <span className="text-2xl font-bold text-white">AC</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">AI Caption Editor</h3>
            <p className="text-sm text-zinc-500">Version 1.0.0</p>
            <p className="text-xs text-zinc-600">Build 2026.07.01</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
            <p className="text-xs text-zinc-500">Engine</p>
            <p className="text-sm font-medium text-zinc-200">React + Vite + TypeScript</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
            <p className="text-xs text-zinc-500">Styling</p>
            <p className="text-sm font-medium text-zinc-200">Tailwind CSS + shadcn/ui</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
            <p className="text-xs text-zinc-500">State Management</p>
            <p className="text-sm font-medium text-zinc-200">Zustand</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
            <p className="text-xs text-zinc-500">Routing</p>
            <p className="text-sm font-medium text-zinc-200">React Router v7</p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
          <p className="text-xs text-zinc-500">Licenses</p>
          <p className="mt-1 text-xs text-zinc-600">
            This application uses open-source components. All licenses are available in the source repository.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
          <p className="text-xs text-zinc-500">Acknowledgments</p>
          <p className="mt-1 text-xs text-zinc-600">
            Built with React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Lucide Icons, and Radix UI.
          </p>
        </div>
      </div>
    </SettingsSection>
  )
}

const CATEGORY_RENDERERS: Record<SettingsCategory, () => ReactNode> = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  editor: EditorSettingsSection,
  timeline: TimelineSettings,
  playback: PlaybackSettings,
  keyboard: KeyboardShortcutsSection,
  ai: AISettings,
  export: ExportSettingsSection,
  performance: PerformanceSettingsSection,
  accessibility: AccessibilitySection,
  storage: StorageSection,
  about: AboutSection,
}

function SettingsSection({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <div className="pb-6">
      {title && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
        </div>
      )}
      <div className="divide-y divide-zinc-800">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const loading = useSettingsStore((s) => s.loading)
  const settings = useSettingsStore((s) => s.settings)
  const selectedCategory = useSettingsStore((s) => s.selectedCategory)
  const searchQuery = useSettingsStore((s) => s.searchQuery)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const setSelectedCategory = useSettingsStore((s) => s.setSelectedCategory)
  const setSearchQuery = useSettingsStore((s) => s.setSearchQuery)
  const resetCategory = useSettingsStore((s) => s.resetCategory)
  const resetAll = useSettingsStore((s) => s.resetAll)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const Renderer = CATEGORY_RENDERERS[selectedCategory]

  const filteredCategories = searchQuery.trim()
    ? SETTINGS_CATEGORIES.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : SETTINGS_CATEGORIES

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar navigation */}
      <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/30">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 py-1.5 pl-8 pr-2 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {filteredCategories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Info
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{cat.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3 shrink-0">
          <h1 className="text-sm font-semibold text-zinc-100">
            {SETTINGS_CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? 'Settings'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => resetCategory(selectedCategory)}
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="size-3" />
              Reset Section
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="size-3" />
              Reset All
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {Renderer ? <Renderer /> : <SettingsSection><p className="text-sm text-zinc-500">Select a category from the sidebar.</p></SettingsSection>}
        </div>
      </div>
    </div>
  )
}
