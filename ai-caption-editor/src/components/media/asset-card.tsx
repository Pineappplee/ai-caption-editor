import { useState, useCallback, type DragEvent } from 'react'
import { Play, Heart, HeartOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaAsset } from '@/services/media'
import { FileIcon } from './file-icon'

interface AssetCardProps {
  asset: MediaAsset
  isSelected: boolean
  onSelect: (id: string) => void
  onDoubleClick: (asset: MediaAsset) => void
  onContextMenu: (e: React.MouseEvent, asset: MediaAsset) => void
  onToggleFavorite: (id: string) => void
  onDragStart: (asset: MediaAsset) => void
}

export function AssetCard({
  asset,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onToggleFavorite,
  onDragStart,
}: AssetCardProps) {
  const [hovered, setHovered] = useState(false)

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ assetId: asset.id, type: asset.type }))
      e.dataTransfer.effectAllowed = 'copy'
      onDragStart(asset)
    },
    [asset, onDragStart],
  )

  const showThumbnail = asset.type === 'video' || asset.type === 'image' || asset.type === 'gif' || asset.type === 'sticker'

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(asset.id)}
      onDoubleClick={() => onDoubleClick(asset)}
      onContextMenu={(e) => onContextMenu(e, asset)}
      className={cn(
        'group relative cursor-pointer rounded-lg border transition-all duration-150 select-none',
        isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]'
          : 'border-zinc-700/50 bg-zinc-800/40 hover:border-zinc-600 hover:bg-zinc-800/70',
      )}
    >
      {showThumbnail && asset.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-zinc-800">
          <img
            src={asset.thumbnailUrl}
            alt={asset.filename}
            className="size-full object-cover"
            loading="lazy"
          />
          {asset.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex size-8 items-center justify-center rounded-full bg-black/60">
                <Play className="size-4 fill-white text-white" />
              </div>
            </div>
          )}
          {asset.duration && (
            <span className="absolute bottom-1 right-1 rounded bg-zinc-900/80 px-1 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm">
              {formatDuration(asset.duration)}
            </span>
          )}
          {asset.format && (
            <span className="absolute left-1 top-1 rounded bg-zinc-900/80 px-1 py-0.5 text-[9px] font-medium uppercase text-zinc-400 backdrop-blur-sm">
              {asset.format}
            </span>
          )}
          {hovered && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id) }}
              className={cn(
                'absolute right-1 top-1 flex size-6 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
                asset.isFavorite ? 'text-red-400 hover:text-red-300' : 'text-zinc-400 hover:text-red-400',
              )}
            >
              {asset.isFavorite ? <Heart className="size-3.5 fill-current" /> : <HeartOff className="size-3.5" />}
            </button>
          )}
          {isSelected && (
            <div className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full bg-blue-500">
              <Check className="size-3 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-t-lg bg-zinc-800">
          <FileIcon type={asset.type} className="size-8 text-zinc-600" />
          {asset.duration && (
            <span className="absolute bottom-1 right-1 rounded bg-zinc-900/80 px-1 py-0.5 text-[10px] font-medium text-zinc-300">
              {formatDuration(asset.duration)}
            </span>
          )}
        </div>
      )}
      <div className="px-2 py-1.5">
        <p className="truncate text-[11px] font-medium text-zinc-300">{asset.filename}</p>
        <p className="text-[10px] text-zinc-500">{formatSize(asset.fileSize)}</p>
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
