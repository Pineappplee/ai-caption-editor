import { useState, useRef, type DragEvent } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadProgress } from '@/services/media'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  uploads: UploadProgress[]
  isUploading: boolean
}

const ACCEPTED = 'video/*,image/*,.gif,.mp3,.wav,.srt,.vtt,.woff2,.svg'

export function UploadZone({ onFilesSelected, uploads, isUploading }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div className="px-2 pb-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors',
          dragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-zinc-700 bg-zinc-800/20 hover:border-zinc-600 hover:bg-zinc-800/40',
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
          {isUploading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          ) : (
            <Upload className="size-4 text-purple-400" />
          )}
        </div>
        <p className="mt-2 text-[11px] font-medium text-zinc-300">
          {isUploading ? 'Uploading...' : 'Drop files or click to browse'}
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-600">
          MP4, MOV, PNG, JPG, GIF, MP3, SRT, WOFF2, SVG
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploads.length > 0 && (
        <div className="mt-2 space-y-1">
          {uploads.map((u) => (
            <div key={u.id} className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] text-zinc-400">{u.filename}</p>
                <span className="shrink-0 text-[10px] text-zinc-500">{u.progress}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
