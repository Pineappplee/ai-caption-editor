import { useEffect, useCallback, useState } from 'react'
import { X, Info, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExportStore } from '@/stores/export-store'
import { useEditorStore } from '@/stores/editor-store'
import { EXPORT_FORMATS, estimateFileSize, estimateExportTime } from '@/services/export'
import type { Resolution, FrameRate, Bitrate, Codec, QualityPreset, ExportRange } from '@/services/export'
import { ExportFormatCard } from './export-format-card'
import { ExportProgress } from './export-progress'

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: '3840x2160', label: '4K (3840×2160)' },
  { value: '1920x1080', label: '1080p (1920×1080)' },
  { value: '1280x720', label: '720p (1280×720)' },
  { value: '854x480', label: '480p (854×480)' },
  { value: '640x360', label: '360p (640×360)' },
]

const FRAME_RATES: { value: FrameRate; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: 60, label: '60 fps' },
  { value: 30, label: '30 fps' },
  { value: 24, label: '24 fps' },
]

const BITRATES: { value: Bitrate; label: string }[] = [
  { value: 'auto', label: 'Auto (recommended)' },
  { value: 20, label: 'High (20 Mbps)' },
  { value: 10, label: 'Medium (10 Mbps)' },
  { value: 5, label: 'Low (5 Mbps)' },
]

const CODECS: { value: Codec; label: string }[] = [
  { value: 'h264', label: 'H.264 (x264)' },
  { value: 'h265', label: 'H.265 (HEVC)' },
  { value: 'av1', label: 'AV1' },
]

const QUALITY_PRESETS: { value: QualityPreset; label: string }[] = [
  { value: 'high', label: 'High Quality' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'fast', label: 'Faster Export' },
]

export function ExportCenterModal() {
  const isOpen = useExportStore((s) => s.isOpen)
  const settings = useExportStore((s) => s.settings)
  const currentJob = useExportStore((s) => s.currentJob)
  const isExporting = useExportStore((s) => s.isExporting)
  const closeExportCenter = useExportStore((s) => s.closeExportCenter)
  const setFormat = useExportStore((s) => s.setFormat)
  const updateSettings = useExportStore((s) => s.updateSettings)
  const startExport = useExportStore((s) => s.startExport)
  const cancelExport = useExportStore((s) => s.cancelExport)
  const clearJob = useExportStore((s) => s.clearJob)

  const project = useEditorStore((s) => s.project)
  const projectDuration = project?.duration ?? 120
  const projectId = project?.id ?? ''

  const [activeSection, setActiveSection] = useState<'general' | 'progress'>('general')

  useEffect(() => {
    if (currentJob && (currentJob.status === 'exporting' || currentJob.status === 'processing' || currentJob.status === 'queued')) {
      setActiveSection('progress')
    }
    if (currentJob?.status === 'complete' || currentJob?.status === 'error') {
      setActiveSection('progress')
    }
  }, [currentJob])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) closeExportCenter()
  }, [isOpen, closeExportCenter])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setActiveSection('general')
      clearJob()
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown, clearJob])

  const handleExport = useCallback(() => {
    if (!projectId) return
    startExport(projectId)
  }, [projectId, startExport])

  const handleBack = useCallback(() => {
    setActiveSection('general')
    clearJob()
  }, [clearJob])

  const isMp4 = settings.format === 'mp4'
  const estimatedSize = estimateFileSize(settings.format, projectDuration, settings.resolution)
  const estimatedTime = estimateExportTime(settings.format, projectDuration)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeExportCenter() }}
    >
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Export Center</h2>
          </div>
          <button
            type="button"
            onClick={closeExportCenter}
            className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === 'general' && (
            <div className="space-y-5">
              {/* Back link when viewing progress */}
              {currentJob && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ← Back to settings
                </button>
              )}

              {/* Format Selection */}
              <div>
                <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Export As</h3>
                <div className="grid grid-cols-3 gap-2">
                  {EXPORT_FORMATS.map((info) => (
                    <ExportFormatCard
                      key={info.format}
                      info={info}
                      isSelected={settings.format === info.format}
                      onSelect={() => setFormat(info.format)}
                    />
                  ))}
                </div>
              </div>

              {/* Video Settings (MP4 only) */}
              {isMp4 && (
                <div>
                  <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Video Settings</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Resolution</label>
                      <select
                        value={settings.resolution}
                        onChange={(e) => updateSettings({ resolution: e.target.value as Resolution })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
                      >
                        {RESOLUTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Frame Rate</label>
                      <select
                        value={settings.frameRate}
                        onChange={(e) => updateSettings({ frameRate: e.target.value === 'original' ? 'original' : Number(e.target.value) as FrameRate })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
                      >
                        {FRAME_RATES.map((r) => (
                          <option key={String(r.value)} value={String(r.value)}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Bitrate</label>
                      <select
                        value={settings.bitrate}
                        onChange={(e) => updateSettings({ bitrate: e.target.value === 'auto' ? 'auto' : Number(e.target.value) as Bitrate })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
                      >
                        {BITRATES.map((b) => (
                          <option key={String(b.value)} value={String(b.value)}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Codec</label>
                      <select
                        value={settings.codec}
                        onChange={(e) => updateSettings({ codec: e.target.value as Codec })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
                      >
                        {CODECS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Quality Preset</label>
                      <select
                        value={settings.qualityPreset}
                        onChange={(e) => updateSettings({ qualityPreset: e.target.value as QualityPreset })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
                      >
                        {QUALITY_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Caption Options */}
              <div>
                <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Caption Options</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeCaptions}
                      onChange={(e) => updateSettings({ includeCaptions: e.target.checked })}
                      className="peer size-4 appearance-none rounded border border-zinc-600 bg-zinc-900 checked:border-purple-500 checked:bg-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    />
                    <span className="text-[11px] text-zinc-300">Include captions</span>
                  </label>
                  {isMp4 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.burnCaptions}
                        onChange={(e) => updateSettings({ burnCaptions: e.target.checked })}
                        className="peer size-4 appearance-none rounded border border-zinc-600 bg-zinc-900 checked:border-purple-500 checked:bg-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      />
                      <span className="text-[11px] text-zinc-300">Burn captions into video</span>
                    </label>
                  )}
                  {settings.includeCaptions && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.applyStyle}
                        onChange={(e) => updateSettings({ applyStyle: e.target.checked })}
                        className="peer size-4 appearance-none rounded border border-zinc-600 bg-zinc-900 checked:border-purple-500 checked:bg-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      />
                      <span className="text-[11px] text-zinc-300">Apply current caption style</span>
                    </label>
                  )}
                  {settings.includeCaptions && (
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-500">Caption Track Name</label>
                      <input
                        value={settings.captionTrackName}
                        onChange={(e) => updateSettings({ captionTrackName: e.target.value })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-[11px] text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50"
                        placeholder="English"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Advanced</h3>
                <div className="space-y-2.5">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-zinc-500">Output filename</label>
                    <div className="flex rounded-md border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                      <input
                        value={settings.outputFilename}
                        onChange={(e) => updateSettings({ outputFilename: e.target.value })}
                        className="flex-1 bg-transparent px-2.5 py-1.5 text-[11px] text-zinc-200 placeholder:text-zinc-500 outline-none"
                        placeholder="filename"
                      />
                      <span className="flex items-center px-2.5 text-[11px] text-zinc-500 bg-zinc-800 border-l border-zinc-700 font-mono">
                        .{settings.format}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-zinc-500">Export Range</label>
                    <div className="flex gap-2">
                      {(['full', 'timeline'] as ExportRange[]).map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => updateSettings({ exportRange: range })}
                          className={cn(
                            'flex-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors',
                            settings.exportRange === range
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                              : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50',
                          )}
                        >
                          {range === 'full' ? 'Full Video' : 'Timeline Range'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated info */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 px-3 py-2">
                <Info className="size-3.5 shrink-0 text-zinc-500" />
                <span className="text-[11px] text-zinc-500">
                  Estimated: <strong className="text-zinc-300">{estimatedSize}</strong> &middot; ~{estimatedTime} export time
                </span>
              </div>
            </div>
          )}

          {activeSection === 'progress' && currentJob && (
            <div>
              {currentJob.status === 'complete' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-3 flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ← Export more
                </button>
              )}
              <ExportProgress job={currentJob} onCancel={cancelExport} />
            </div>
          )}
        </div>

        {/* Footer */}
        {activeSection === 'general' && (
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 shrink-0">
            <button
              type="button"
              onClick={closeExportCenter}
              className="rounded-md border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !projectId}
              className="flex items-center gap-1.5 rounded-md bg-purple-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  Export
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
