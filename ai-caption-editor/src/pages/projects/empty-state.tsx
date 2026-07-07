import { useNavigate } from 'react-router-dom'
import { FolderOpen, Plus } from 'lucide-react'

interface EmptyStateProps {
  searchQuery?: string
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-800/50">
        <FolderOpen className="size-8 text-zinc-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-300">
        {searchQuery ? 'No projects found' : 'No projects yet'}
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        {searchQuery
          ? `No results for "${searchQuery}". Try a different search.`
          : 'Create your first project to get started.'}
      </p>
      {!searchQuery && (
        <button
          type="button"
          onClick={() => navigate('/projects/new')}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="size-4" />
          New Project
        </button>
      )}
    </div>
  )
}
