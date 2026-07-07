import { useRef, useCallback } from 'react'
import { Loader2, FolderOpen } from 'lucide-react'
import type { MediaAsset } from '@/services/media'
import { AssetCard } from './asset-card'

interface AssetGridProps {
  assets: MediaAsset[]
  loading: boolean
  selectedIds: string[]
  onSelect: (id: string) => void
  onDoubleClick: (asset: MediaAsset) => void
  onContextMenu: (e: React.MouseEvent, asset: MediaAsset) => void
  onToggleFavorite: (id: string) => void
  onDragStart: (asset: MediaAsset) => void
}

export function AssetGrid({
  assets,
  loading,
  selectedIds,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onToggleFavorite,
  onDragStart,
}: AssetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        ;(e.target as HTMLElement).blur()
      }
    },
    [],
  )

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-800/50">
          <FolderOpen className="size-6 text-zinc-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-400">No media assets</p>
        <p className="mt-1 text-xs text-zinc-600">
          Upload files or search stock to get started.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="grid flex-1 grid-cols-2 gap-2 content-start px-2 pb-2 outline-none"
      style={{ minHeight: 0 }}
    >
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedIds.includes(asset.id)}
          onSelect={onSelect}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onToggleFavorite={onToggleFavorite}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  )
}
