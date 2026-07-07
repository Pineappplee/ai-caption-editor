import { Film, FileText, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExportJob } from '@/services/export'

interface ExportProgressProps {
  job: ExportJob
  onCancel: () => void
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function ExportProgress({ job, onCancel }: ExportProgressProps) {
  const isVideo = job.settings.format === 'mp4'
  const statusText: Record<string, string> = {
    queued: 'Queued...',
    exporting: 'Exporting...',
    processing: 'Processing...',
    complete: 'Complete!',
    error: 'Export failed',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {job.status === 'queued' && <Loader2 className="size-4 animate-spin text-zinc-500" />}
          {job.status === 'exporting' && <Loader2 className="size-4 animate-spin text-purple-400" />}
          {job.status === 'processing' && <Loader2 className="size-4 animate-spin text-blue-400" />}
          {job.status === 'complete' && <CheckCircle2 className="size-4 text-green-400" />}
          {job.status === 'error' && <AlertCircle className="size-4 text-red-400" />}
          <span className="text-sm font-medium text-zinc-200">{statusText[job.status]}</span>
        </div>
        {(job.status === 'queued' || job.status === 'exporting' || job.status === 'processing') && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X className="size-3" />
            Cancel
          </button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            job.status === 'complete' ? 'bg-green-500/10 text-green-400' :
            job.status === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-purple-500/10 text-purple-400',
          )}>
            {isVideo ? <Film className="size-4" /> : <FileText className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-zinc-200">
              {job.settings.outputFilename}{job.settings.format === 'mp4' ? '.mp4' : `.${job.settings.format}`}
            </p>
            <p className="text-[11px] text-zinc-500">
              {job.settings.format.toUpperCase()} &middot; {job.settings.resolution !== 'original' ? job.settings.resolution : 'Original resolution'} &middot; {formatBytes(job.estimatedSize)}
            </p>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">{job.progress}%</span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              job.status === 'complete' ? 'bg-green-500' :
              job.status === 'error' ? 'bg-red-500' :
              'bg-purple-500',
            )}
            style={{ width: `${job.progress}%` }}
          />
        </div>

        {job.status === 'exporting' && (
          <p className="mt-2 text-[11px] text-zinc-500">
            {job.progress < 50 ? 'Encoding video...' : job.progress < 90 ? 'Writing captions...' : 'Finalizing...'}
          </p>
        )}
        {job.status === 'complete' && (
          <p className="mt-2 text-[11px] text-green-500">
            Exported successfully &middot; {formatBytes(job.fileSize)}
          </p>
        )}
        {job.status === 'error' && job.error && (
          <p className="mt-2 text-[11px] text-red-400">{job.error}</p>
        )}
      </div>

      {job.status === 'complete' && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            Download
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Download All
          </button>
        </div>
      )}

      {job.status === 'error' && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
