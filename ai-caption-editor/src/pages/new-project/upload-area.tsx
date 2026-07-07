import { useState, useRef, type DragEvent } from 'react'
import { Upload, FileAudio, Monitor } from 'lucide-react'
import type { RecentFile } from '@/services/wizard'

interface UploadAreaProps {
  inputMethod: 'upload' | 'import'
  recentFiles: RecentFile[]
  onFileSelect: (file: File) => void
  onRecentFileSelect: (file: RecentFile) => void
}

export function UploadArea({ inputMethod, recentFiles, onFileSelect, onRecentFileSelect }: UploadAreaProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  const accept = inputMethod === 'upload' ? 'video/*,.mov,.mp4,.avi,.webm' : 'audio/*,.mp3,.wav,.aac,.flac'
  const title = inputMethod === 'upload' ? 'Upload Video' : 'Import Audio'
  const subtitle = inputMethod === 'upload' ? 'MP4, MOV, AVI, WebM' : 'MP3, WAV, AAC, FLAC'

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
          dragging
            ? 'border-purple-500 bg-purple-500/5'
            : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
        }`}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10">
          <Upload className="size-6 text-purple-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-100">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Drag & drop or click to browse
        </p>
        <p className="mt-3 text-xs text-zinc-600">{subtitle}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {recentFiles.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-zinc-400">Recent Files</p>
          <div className="space-y-2">
            {recentFiles
              .filter((f) => inputMethod === 'upload' ? f.type === 'video' : f.type === 'audio')
              .map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => onRecentFileSelect(file)}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-left transition-colors hover:border-zinc-700"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    {file.type === 'video' ? (
                      <Monitor className="size-4 text-zinc-500" />
                    ) : (
                      <FileAudio className="size-4 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {file.size} &middot; {file.path}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
