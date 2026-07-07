import { useEffect, useRef } from 'react'
import { Copy, Pencil, Archive, Trash2 } from 'lucide-react'

interface ContextMenuAction {
  label: string
  icon: typeof Copy
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onDuplicate: () => void
  onRename: () => void
  onArchive: () => void
  onDelete: () => void
}

export function ContextMenu({ x, y, onClose, onDuplicate, onRename, onArchive, onDelete }: ContextMenuProps) {
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

  const actions: ContextMenuAction[] = [
    { label: 'Duplicate', icon: Copy, onClick: onDuplicate },
    { label: 'Rename', icon: Pencil, onClick: onRename },
    { label: 'Archive', icon: Archive, onClick: onArchive },
    { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
  ]

  const menuWidth = 180
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16)
  const adjustedY = Math.min(y, window.innerHeight - actions.length * 40 - 16)

  return (
    <div
      ref={ref}
      className="fixed z-50 w-44 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              action.onClick()
              onClose()
            }}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
              action.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
