import { useEffect, useCallback } from 'react'
import { X, Plus, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaAsset } from '@/services/media'
import { FileIcon } from './file-icon'

interface AssetPreviewModalProps {
  asset: MediaAsset
  onClose: () => void
  onAddToTimeline?: (asset: MediaAsset) => void
  onToggleFavorite?: (id: string) => void
}

export function AssetPreviewModal({ asset, onClose, onAddToTimeline, onToggleFavorite }: AssetPreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const showPreview = asset.type === 'video' || asset.type === 'image' || asset.type === 'gif' || asset.type === 'sticker'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative mx-4 max-h-[85vh] max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon type={asset.type} className="size-4 shrink-0 text-zinc-500" />
            <p className="truncate text-sm font-medium text-zinc-200">{asset.filename}</p>
          </div>
          <div className="flex items-center gap-1">
            {onAddToTimeline && (
              <button
                type="button"
                onClick={() => onAddToTimeline(asset)}
                className="flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-purple-500 transition-colors"
              >
                <Plus className="size-3" />
                Add to Timeline
              </button>
            )}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(asset.id)}
                className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <Heart className={cn('size-4', asset.isFavorite && 'fill-red-400 text-red-400')} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          {showPreview && asset.thumbnailUrl ? (
            <div className="flex items-center justify-center">
              <img
                src={asset.thumbnailUrl}
                alt={asset.filename}
                className="max-h-[55vh] w-full rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-zinc-800">
              <FileIcon type={asset.type} className="size-16 text-zinc-600" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500">Type</span>
              <p className="font-medium text-zinc-200 capitalize">{asset.type}</p>
            </div>
            <div>
              <span className="text-zinc-500">Format</span>
              <p className="font-medium text-zinc-200 uppercase">{asset.format}</p>
            </div>
            <div>
              <span className="text-zinc-500">Resolution</span>
              <p className="font-medium text-zinc-200">
                {asset.width > 0 ? `${asset.width} × ${asset.height}` : '-'}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Size</span>
              <p className="font-medium text-zinc-200">
                {asset.fileSize > 1024 * 1024
                  ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB`
                  : `${(asset.fileSize / 1024).toFixed(0)} KB`}
              </p>
            </div>
            {asset.duration && (
              <div>
                <span className="text-zinc-500">Duration</span>
                <p className="font-medium text-zinc-200">{asset.duration.toFixed(1)}s</p>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="font-medium text-zinc-200">{new Date(asset.createdAt).toLocaleDateString()}</p>
            </div>
            {asset.tags.length > 0 && (
              <div className="col-span-2">
                <span className="text-zinc-500">Tags</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {asset.prompt && (
              <div className="col-span-2">
                <span className="text-zinc-500">AI Prompt</span>
                <p className="mt-0.5 text-zinc-300 italic">"{asset.prompt}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
