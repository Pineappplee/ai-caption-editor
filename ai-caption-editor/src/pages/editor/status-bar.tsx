import { useEditorStore } from '@/stores/editor-store'

export function StatusBar() {
  const project = useEditorStore((s) => s.project)
  const captions = useEditorStore((s) => s.captions)
  const currentTime = useEditorStore((s) => s.currentTime)
  const formatTime = useEditorStore((s) => s.formatTime)

  if (!project) return null

  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-3">
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        <span>{project.filename}</span>
        <span className="text-zinc-700">|</span>
        <span>{project.width}×{project.height}</span>
        <span className="text-zinc-700">|</span>
        <span>{project.frameRate}fps</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        <span>Captions: {captions.length}</span>
        <span className="text-zinc-700">|</span>
        <span className="font-mono tabular-nums">
          {formatTime(currentTime)}
        </span>
      </div>
    </div>
  )
}
