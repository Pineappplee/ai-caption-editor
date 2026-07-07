import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'nature', name: 'Nature', color: 'bg-green-500/20 text-green-400' },
  { id: 'business', name: 'Business', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'technology', name: 'Technology', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'people', name: 'People', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'lifestyle', name: 'Lifestyle', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'abstract', name: 'Abstract', color: 'bg-purple-500/20 text-purple-400' },
]

interface StockSearchProps {
  query: string
  onQueryChange: (query: string) => void
  category: string | null
  onCategoryChange: (id: string | null) => void
  onSearch: () => void
}

export function StockSearch({ query, onQueryChange, category, onCategoryChange, onSearch }: StockSearchProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.trim()) {
      debounceRef.current = setTimeout(() => { onSearch() }, 300)
    } else {
      onSearch()
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, onSearch])

  return (
    <div className="space-y-2 border-b border-zinc-800 px-2 py-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search stock footage..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 py-1.5 pl-7 pr-7 text-[11px] text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {!query && (
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onCategoryChange(category === cat.id ? null : cat.id)
                if (cat.id !== 'all') setTimeout(() => onSearch(), 50)
              }}
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                category === cat.id
                  ? cat.color || 'bg-purple-500/20 text-purple-400'
                  : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
