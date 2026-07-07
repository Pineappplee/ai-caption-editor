import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Eye, Download, Share2 } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { useExportStore } from '@/stores/export-store'

export function EditorHeader() {
  const navigate = useNavigate()
  const project = useEditorStore((s) => s.project)
  const openExportCenter = useExportStore((s) => s.openExportCenter)

  if (!project) return null

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-600">
            <Mic className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-zinc-100">{project.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <Eye className="size-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => openExportCenter(project.title)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <Download className="size-3.5" />
          Export
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      </div>
    </header>
  )
}
