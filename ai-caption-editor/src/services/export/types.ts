export type ExportFormat = 'mp4' | 'srt' | 'vtt' | 'ass' | 'txt' | 'json'

export type ExportStatus = 'queued' | 'exporting' | 'processing' | 'complete' | 'error'

export type Resolution = 'original' | '3840x2160' | '1920x1080' | '1280x720' | '854x480' | '640x360'
export type FrameRate = 'original' | 60 | 30 | 24
export type Bitrate = 'auto' | 20 | 10 | 5
export type Codec = 'h264' | 'h265' | 'av1'
export type QualityPreset = 'high' | 'balanced' | 'fast'
export type ExportRange = 'full' | 'timeline'

export interface ExportSettings {
  format: ExportFormat
  resolution: Resolution
  frameRate: FrameRate
  bitrate: Bitrate
  codec: Codec
  qualityPreset: QualityPreset
  includeCaptions: boolean
  burnCaptions: boolean
  applyStyle: boolean
  captionTrackName: string
  outputFilename: string
  exportRange: ExportRange
}

export function defaultExportSettings(projectTitle?: string): ExportSettings {
  return {
    format: 'mp4',
    resolution: 'original',
    frameRate: 'original',
    bitrate: 'auto',
    codec: 'h264',
    qualityPreset: 'balanced',
    includeCaptions: true,
    burnCaptions: true,
    applyStyle: true,
    captionTrackName: 'English',
    outputFilename: projectTitle ? `${projectTitle}-captions` : 'captions',
    exportRange: 'full',
  }
}

export interface ExportJob {
  id: string
  projectId: string
  settings: ExportSettings
  status: ExportStatus
  progress: number
  error?: string
  downloadUrl?: string
  fileSize?: number
  estimatedSize?: number
  estimatedTime?: number
  createdAt: string
  completedAt?: string
}

export interface ExportFormatInfo {
  format: ExportFormat
  label: string
  icon: string
  extension: string
  description: string
  isVideo: boolean
}

export const EXPORT_FORMATS: ExportFormatInfo[] = [
  { format: 'mp4', label: 'MP4 Video', icon: 'Film', extension: '.mp4', description: 'Video with burned-in captions', isVideo: true },
  { format: 'srt', label: 'SRT', icon: 'FileText', extension: '.srt', description: 'SubRip subtitle format', isVideo: false },
  { format: 'vtt', label: 'VTT', icon: 'FileText', extension: '.vtt', description: 'WebVTT subtitle format', isVideo: false },
  { format: 'ass', label: 'ASS', icon: 'FileText', extension: '.ass', description: 'Advanced SubStation Alpha', isVideo: false },
  { format: 'txt', label: 'TXT', icon: 'FileText', extension: '.txt', description: 'Plain text transcript', isVideo: false },
  { format: 'json', label: 'JSON', icon: 'Code', extension: '.json', description: 'Machine-readable captions', isVideo: false },
]

export function estimateFileSize(format: ExportFormat, duration: number, resolution?: Resolution): string {
  if (format !== 'mp4') {
    const charCount = duration * 15
    const bytes = charCount * 2
    return formatBytes(bytes)
  }
  const bps = resolution === '3840x2160' ? 40 : resolution === '1920x1080' ? 15 : resolution === '1280x720' ? 8 : resolution === '854x480' ? 4 : resolution === '640x360' ? 2 : 10
  return formatBytes((bps * 1024 * 1024 / 8) * duration)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function estimateExportTime(format: ExportFormat, duration: number): string {
  if (format !== 'mp4') return '< 5s'
  const seconds = duration * 0.5
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  return `${Math.ceil(seconds / 60)}m ${Math.ceil(seconds % 60)}s`
}
