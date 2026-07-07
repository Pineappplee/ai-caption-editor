import { useEffect, useState, useCallback } from 'react'
import {
  Search, Heart, Clock, TrendingUp, Grid3X3, SlidersHorizontal,
  Star, ArrowUpDown, List, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useServices } from '@/services'
import type {
  Template, TemplateCategory, TemplateDetail, TemplateFilter,
  TemplateType, RecentlyUsedTemplate,
} from '@/services/templates'
import { TEMPLATE_CATEGORIES, defaultTemplateFilter } from '@/services/templates'
import { TemplateCard } from '@/components/templates/template-card'
import { FeaturedCarousel } from '@/components/templates/featured-carousel'
import { TemplateDetailPanel } from '@/components/templates/template-detail-panel'



const TYPE_FILTERS: { id: TemplateType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'caption', label: 'Caption' },
  { id: 'subtitle', label: 'Subtitle' },
  { id: 'animation', label: 'Animation' },
  { id: 'lower-third', label: 'Lower Third' },
  { id: 'social', label: 'Social' },
  { id: 'brand-kit', label: 'Brand Kit' },
]

const SORT_OPTIONS: { id: TemplateFilter['sortBy']; label: string }[] = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'name', label: 'Name A-Z' },
]

const CATEGORY_ICONS: Record<string, typeof Grid3X3> = {
  'cat-all': Grid3X3,
  'cat-caption': Grid3X3,
  'cat-subtitle': Grid3X3,
  'cat-animation': Grid3X3,
  'cat-lower-third': Grid3X3,
  'cat-social': Grid3X3,
  'cat-brand': Grid3X3,
}

export function TemplatesMarketplacePage() {
  const { templates: service } = useServices()
  const [featured, setFeatured] = useState<Template[]>([])
  const [trending, setTrending] = useState<Template[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<RecentlyUsedTemplate[]>([])
  const [results, setResults] = useState<Template[]>([])
  const [categories] = useState<TemplateCategory[]>(TEMPLATE_CATEGORIES)
  const [filter, setFilter] = useState<TemplateFilter>(defaultTemplateFilter)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetail | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [f, t, r, s] = await Promise.all([
      service.getFeatured(),
      service.getTrending(),
      service.getRecentlyUsed(),
      service.search(filter),
    ])
    setFeatured(f)
    setTrending(t)
    setRecentlyUsed(r)
    setResults(s)
    setLoading(false)
  }, [filter, service])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSearch = (query: string) => {
    setFilter((f) => ({ ...f, searchQuery: query }))
  }

  const handleCategoryChange = (id: string) => {
    setFilter((f) => ({ ...f, categoryId: id, type: id === 'cat-all' ? 'all' : (id.replace('cat-', '') as TemplateType) }))
  }

  const handleTypeChange = (type: TemplateType | 'all') => {
    setFilter((f) => ({ ...f, type }))
  }

  const handleSortChange = (sortBy: TemplateFilter['sortBy']) => {
    setFilter((f) => ({ ...f, sortBy }))
  }

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    await service.toggleFavorite(id, favorite)
    setResults((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: favorite } : t)))
    setFeatured((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: favorite } : t)))
    setTrending((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: favorite } : t)))
    if (selectedTemplate?.id === id) {
      setSelectedTemplate((prev) => prev ? { ...prev, isFavorite: favorite } : null)
    }
  }

  const handleSelectTemplate = async (id: string) => {
    const detail = await service.getTemplate(id)
    if (detail) {
      setSelectedTemplate(detail)
    }
  }

  const handleApply = (_id: string) => {
    // UI only
  }

  const hasActiveFilters = filter.searchQuery || filter.type !== 'all' || filter.categoryId !== 'cat-all' || filter.minRating > 0

  const allTemplates = results

  return (
    <div className="flex h-full min-h-0">
      {/* Left sidebar - Categories */}
      <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/30">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Categories</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Grid3X3
            const isActive = filter.categoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate flex-1 text-left">{cat.name}</span>
                <span className="text-[10px] text-zinc-600">{cat.count}</span>
              </button>
            )
          })}
        </nav>
        <div className="border-t border-zinc-800 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Sort By</p>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSortChange(opt.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors',
                  filter.sortBy === opt.id
                    ? 'text-purple-400'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                <ArrowUpDown className="size-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Search bar */}
        <div className="shrink-0 border-b border-zinc-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={filter.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500/50"
              />
              {filter.searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                <Grid3X3 className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300',
                )}
              >
                <List className="size-3.5" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                showFilters || hasActiveFilters
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                  : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/50',
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
            </button>
          </div>

          {/* Type filter chips */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
            {TYPE_FILTERS.map((tf) => {
              const isActive = filter.type === tf.id
              return (
                <button
                  key={tf.id}
                  onClick={() => handleTypeChange(tf.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300',
                  )}
                >
                  {tf.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-6 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
            </div>
          ) : (
            <div className="space-y-6 p-5">
              {/* Recently Used */}
              {recentlyUsed.length > 0 && !filter.searchQuery && filter.categoryId === 'cat-all' && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="size-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-100">Recently Used</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {recentlyUsed.map((r) => {
                      const tmpl = [...featured, ...trending].find((t) => t.id === r.templateId)
                      if (!tmpl) return null
                      return (
                        <TemplateCard
                          key={r.templateId}
                          template={tmpl}
                          variant="featured"
                          onToggleFavorite={handleToggleFavorite}
                          onClick={handleSelectTemplate}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Featured */}
              {featured.length > 0 && !filter.searchQuery && filter.categoryId === 'cat-all' && (
                <FeaturedCarousel
                  templates={featured}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={handleSelectTemplate}
                />
              )}

              {/* Trending */}
              {trending.length > 0 && !filter.searchQuery && filter.categoryId === 'cat-all' && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="size-4 text-zinc-500" />
                    <h2 className="text-sm font-semibold text-zinc-100">Trending Templates</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {trending.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        variant="featured"
                        onToggleFavorite={handleToggleFavorite}
                        onClick={handleSelectTemplate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Templates grid */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-100">
                    {filter.searchQuery ? `Search Results (${allTemplates.length})` : 'All Templates'}
                  </h2>
                  <span className="text-xs text-zinc-500">{allTemplates.length} templates</span>
                </div>
                {allTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-800">
                      <Search className="size-5 text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-400">No templates found</p>
                    <p className="text-xs text-zinc-600">Try different search terms or filters</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {allTemplates.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={handleSelectTemplate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allTemplates.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTemplate(t.id)}
                        className="flex cursor-pointer items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700"
                      >
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                          <Grid3X3 className="size-6 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-zinc-200">{t.name}</h3>
                            {t.creator.verified && (
                              <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">Official</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-1">{t.description}</p>
                          <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-500">
                            <span>{t.creator.name}</span>
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="size-2.5 fill-amber-400" />
                              {t.rating}
                            </span>
                            <span>{t.usageCount.toLocaleString()} uses</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(t.id, !t.isFavorite) }}
                          className={cn(
                            'flex size-7 items-center justify-center rounded-full transition-colors',
                            t.isFavorite ? 'text-red-400' : 'text-zinc-500 hover:text-red-400',
                          )}
                        >
                          <Heart className={cn('size-3.5', t.isFavorite && 'fill-red-400')} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedTemplate && (
        <TemplateDetailPanel
          detail={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onToggleFavorite={handleToggleFavorite}
          onApply={handleApply}
        />
      )}
    </div>
  )
}
