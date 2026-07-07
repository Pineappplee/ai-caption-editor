import { useState } from 'react'
import { Film, MoreHorizontal, Globe } from 'lucide-react'
import type { Project, ViewMode } from '@/services/projects'
import { ContextMenu } from './context-menu'

interface ProjectCardProps {
  project: Project
  viewMode: ViewMode
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onRename: (id: string, name: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'border-amber-400/30 text-amber-400 bg-amber-400/10',
  Complete: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
  Draft: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/10',
}

export function ProjectCard({
  project,
  viewMode,
  onOpen,
  onDuplicate,
  onRename,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setMenuOpen(true)
  }

  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onOpen(project.id)}
        className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/30 transition-colors hover:border-zinc-700"
      >
        <div className="flex aspect-video items-center justify-center rounded-t-xl bg-zinc-800/50">
          <Film className="size-8 text-zinc-600" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 truncate">
              {project.title}
            </h3>
            <button
              type="button"
              onClick={handleContextMenu}
              className="shrink-0 rounded-lg p-1 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
            >
              {project.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
              <Globe className="size-3" />
              {project.languageFlag} {project.language}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span>{project.duration}</span>
            <span>{project.segments} segments</span>
          </div>

          <p className="mt-1 text-xs text-zinc-600">{project.edited}</p>
        </div>

        {menuOpen && (
          <ContextMenu
            x={menuPos.x}
            y={menuPos.y}
            onClose={() => setMenuOpen(false)}
            onDuplicate={() => onDuplicate(project.id)}
            onRename={() => {
              const name = window.prompt('Rename project:', project.title)
              if (name && name.trim()) onRename(project.id, name.trim())
            }}
            onArchive={() => onArchive(project.id)}
            onDelete={() => {
              if (window.confirm('Delete this project?')) onDelete(project.id)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => onOpen(project.id)}
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-colors hover:border-zinc-700/50 hover:bg-zinc-800/20"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        <Film className="size-4 text-zinc-500" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-zinc-100">
          {project.title}
        </h3>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
        >
          {project.status}
        </span>
      </div>

      <div className="hidden items-center gap-3 text-xs text-zinc-500 md:flex">
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
          <Globe className="size-3" />
          {project.languageFlag} {project.language}
        </span>
        <span>{project.duration}</span>
        <span>{project.segments} seg.</span>
      </div>

      <p className="hidden text-xs text-zinc-600 lg:block min-w-[120px] text-right">
        {project.edited}
      </p>

      <button
        type="button"
        onClick={handleContextMenu}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {menuOpen && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuOpen(false)}
          onDuplicate={() => onDuplicate(project.id)}
          onRename={() => {
            const name = window.prompt('Rename project:', project.title)
            if (name && name.trim()) onRename(project.id, name.trim())
          }}
          onArchive={() => onArchive(project.id)}
          onDelete={() => {
            if (window.confirm('Delete this project?')) onDelete(project.id)
          }}
        />
      )}
    </div>
  )
}
