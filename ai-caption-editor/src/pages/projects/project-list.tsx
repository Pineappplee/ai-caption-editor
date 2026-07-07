import type { Project, ViewMode } from '@/services/projects'
import { ProjectCard } from './project-card'

interface ProjectListProps {
  projects: Project[]
  viewMode: ViewMode
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onRename: (id: string, name: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectList({
  projects,
  viewMode,
  onOpen,
  onDuplicate,
  onRename,
  onArchive,
  onDelete,
}: ProjectListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            viewMode="grid"
            onOpen={onOpen}
            onDuplicate={onDuplicate}
            onRename={onRename}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/50 rounded-xl border border-zinc-800/50">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          viewMode="list"
          onOpen={onOpen}
          onDuplicate={onDuplicate}
          onRename={onRename}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
