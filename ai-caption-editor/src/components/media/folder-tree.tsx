import { useState } from 'react'
import { Folder, FolderOpen, Plus, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetFolder } from '@/services/media'

interface FolderTreeProps {
  folders: AssetFolder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: () => void
  onDeleteFolder: (id: string) => void
  onRenameFolder: (id: string, name: string) => void
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}: FolderTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleStartRename = (f: AssetFolder) => {
    setEditingId(f.id)
    setEditName(f.name)
  }

  const handleFinishRename = () => {
    if (editingId && editName.trim()) {
      onRenameFolder(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="border-b border-zinc-800 px-2 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Folders</span>
        <button
          type="button"
          onClick={onCreateFolder}
          className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="New folder"
        >
          <Plus className="size-3" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors',
          selectedFolderId === null
            ? 'bg-purple-500/10 text-purple-400'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
        )}
      >
        <FolderOpen className="size-3.5 shrink-0" />
        <span className="truncate">All Assets</span>
        <span className="ml-auto text-[10px] text-zinc-600">
          {folders.reduce((sum, f) => sum + f.assetCount, 0)}
        </span>
      </button>
      {folders.map((folder) => (
        <div
          key={folder.id}
          className={cn(
            'group flex items-center gap-1 rounded-md px-1 text-[11px] transition-colors',
            selectedFolderId === folder.id
              ? 'bg-purple-500/10 text-purple-400'
              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
          )}
        >
          <button
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            className="flex flex-1 items-center gap-2 py-1.5 min-w-0"
          >
            <Folder className="size-3.5 shrink-0" style={{ color: folder.color }} />
            {editingId === folder.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-800 px-1 py-0 text-[11px] text-zinc-200 outline-none focus:border-purple-500"
              />
            ) : (
              <span className="truncate">{folder.name}</span>
            )}
          </button>
          <span className="text-[10px] text-zinc-600">{folder.assetCount}</span>
          <div className="hidden group-hover:flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleStartRename(folder)}
              className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            >
              <Pencil className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteFolder(folder.id)}
              className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
