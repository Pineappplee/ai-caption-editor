import { useNavigate } from 'react-router-dom'
import { Film, MoreHorizontal } from 'lucide-react'
import type { ProjectSummary } from '@/services/dashboard'

interface RecentProjectsProps {
  projects: ProjectSummary[]
}

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'border-amber-400/40 text-amber-400 bg-amber-400/10',
  Complete: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
  Draft: 'border-zinc-500/40 text-zinc-400 bg-zinc-500/10',
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/editor/${project.id}`)}
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <Film className="size-5 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">
                {project.title}
              </h3>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status]}`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {project.duration} · {project.segments} segments · {project.languageFlag} {project.language}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">{project.edited}</p>
          </div>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
