import { useEffect, useRef } from 'react'
import { Eye, Plus, Download, Pencil, Heart, Copy, FolderOpen, Trash2, Tags } from 'lucide-react'
import type { MediaAsset } from '@/services/media'

interface ContextMenuProps {
  x: number
  y: number
  asset: MediaAsset
  onClose: () => void
  onAction: (action: string, asset: MediaAsset) => void
}

const MENU_ITEMS: { id: string; label: string; icon: typeof Eye; danger?: boolean }[] = [
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'add-to-timeline', label: 'Add to Timeline', icon: Plus },
  { id: 'download', label: 'Download', icon: Download },
  { id: 'rename', label: 'Rename', icon: Pencil },
  { id: 'toggle-favorite', label: 'Toggle Favorite', icon: Heart },
  { id: 'duplicate', label: 'Duplicate', icon: Copy },
  { id: 'move-to-folder', label: 'Move to Folder', icon: FolderOpen },
  { id: 'add-tags', label: 'Add Tags', icon: Tags },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
]

export function ContextMenu({ x, y, asset, onClose, onAction }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const menuX = Math.min(x, window.innerWidth - 180)
  const menuY = Math.min(y, window.innerHeight - 320)

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
      style={{ left: menuX, top: menuY }}
    >
      <div className="border-b border-zinc-800 px-3 py-1.5">
        <p className="truncate text-[11px] font-medium text-zinc-300">{asset.filename}</p>
        <p className="text-[10px] text-zinc-500 capitalize">{asset.type} &middot; {asset.format.toUpperCase()}</p>
      </div>
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onAction(item.id, asset)
              onClose()
            }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-[11px] transition-colors ${
              item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
