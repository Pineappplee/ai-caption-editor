import type { ProjectConfig } from '@/services/wizard'

interface ProjectFormProps {
  config: ProjectConfig
  onChange: (config: ProjectConfig) => void
}

const LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'FR', label: 'French' },
  { value: 'ES', label: 'Spanish' },
  { value: 'DE', label: 'German' },
  { value: 'JP', label: 'Japanese' },
  { value: 'PT', label: 'Portuguese' },
  { value: 'IT', label: 'Italian' },
  { value: 'ZH', label: 'Chinese' },
]

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Standard)' },
]

const FRAME_RATES = [23.976, 24, 25, 29.97, 30, 48, 50, 60]

const RESOLUTIONS = [
  { value: '3840x2160', label: '4K (3840×2160)' },
  { value: '2560x1440', label: '2K (2560×1440)' },
  { value: '1920x1080', label: '1080p (1920×1080)' },
  { value: '1280x720', label: '720p (1280×720)' },
  { value: '854x480', label: '480p (854×480)' },
]

export function ProjectForm({ config, onChange }: ProjectFormProps) {
  const update = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Project Name
        </label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Enter project name..."
          className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Language
        </label>
        <select
          value={config.language}
          onChange={(e) => update('language', e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Aspect Ratio
          </label>
          <select
            value={config.aspectRatio}
            onChange={(e) => update('aspectRatio', e.target.value)}
            className="h-10 w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {ASPECT_RATIOS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Frame Rate
          </label>
          <select
            value={config.frameRate}
            onChange={(e) => update('frameRate', Number(e.target.value))}
            className="h-10 w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {FRAME_RATES.map((f) => (
              <option key={f} value={f}>
                {f} fps
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Output Resolution
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => update('outputResolution', r.value)}
              className={`rounded-lg border px-4 py-2 text-left text-sm transition-colors ${
                config.outputResolution === r.value
                  ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                  : 'border-zinc-700 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
