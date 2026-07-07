import { Search, Heart, ArrowUpDown, List, Grid } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortField, SortDirection } from '@/services/media'

interface UploadToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  favoritesOnly: boolean
  onToggleFavorites: () => void
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField, direction: SortDirection) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'name', label: 'Name' },
  { field: 'size', label: 'Size' },
  { field: 'type', label: 'Type' },
]

export function UploadToolbar({
  searchQuery,
  onSearchChange,
  favoritesOnly,
  onToggleFavorites,
  sortField,
  sortDirection,
  onSortChange,
  viewMode,
  onViewModeChange,
}: UploadToolbarProps) {
  return (
    <div className="space-y-1.5 border-b border-zinc-800 px-2 py-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search assets..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 py-1.5 pl-7 pr-2 text-[11px] text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleFavorites}
          className={cn(
            'flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors',
            favoritesOnly
              ? 'bg-red-500/10 text-red-400'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50',
          )}
        >
          <Heart className={cn('size-3', favoritesOnly && 'fill-current')} />
          Favorites
        </button>

        <div className="relative group/sort">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <ArrowUpDown className="size-3" />
            {sortOptions.find((o) => o.field === sortField)?.label}
          </button>
          <div className="absolute left-0 top-full z-20 mt-1 hidden w-28 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl group-hover/sort:block">
            {sortOptions.map((opt) => (
              <button
                key={opt.field}
                type="button"
                onClick={() => onSortChange(opt.field, sortField === opt.field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc')}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1 text-[11px] transition-colors',
                  sortField === opt.field ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
                )}
              >
                {opt.label}
                {sortField === opt.field && (
                  <span className="text-[10px] text-zinc-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'flex size-6 items-center justify-center rounded',
              viewMode === 'grid' ? 'text-zinc-300 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50',
            )}
          >
            <Grid className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex size-6 items-center justify-center rounded',
              viewMode === 'list' ? 'text-zinc-300 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50',
            )}
          >
            <List className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
