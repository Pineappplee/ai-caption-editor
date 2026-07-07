import { List, Grid, ArrowUpDown, Plus } from 'lucide-react'
import type { ViewMode, SortField, SortDirection, ProjectStatus } from '@/services/projects'

interface FilterBarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  statusFilter: ProjectStatus | 'All'
  onStatusFilterChange: (status: ProjectStatus | 'All') => void
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField, direction: SortDirection) => void
  onNewProject: () => void
  totalCount: number
}

const STATUS_OPTIONS: (ProjectStatus | 'All')[] = ['All', 'In Progress', 'Complete', 'Draft']
const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'Name', field: 'name' },
  { label: 'Last Updated', field: 'updated' },
  { label: 'Date Created', field: 'created' },
]

export function FilterBar({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  sortDirection,
  onSortChange,
  onNewProject,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800/50 p-0.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusFilterChange(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s === 'All' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-') as [SortField, SortDirection]
              onSortChange(field, dir)
            }}
            className="h-9 appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 pl-3 pr-8 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.field} value={`${opt.field}-desc`}>
                {opt.label} ↓
              </option>
            ))}
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.field}-asc`} value={`${opt.field}-asc`}>
                {opt.label} ↑
              </option>
            ))}
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">{totalCount} project{totalCount !== 1 ? 's' : ''}</span>

        <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800/50 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <Plus className="size-4" />
          New Project
        </button>
      </div>
    </div>
  )
}
