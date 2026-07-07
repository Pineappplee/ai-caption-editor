import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Template } from '@/services/templates'
import { TemplateCard } from './template-card'

interface FeaturedCarouselProps {
  templates: Template[]
  onToggleFavorite: (id: string, favorite: boolean) => void
  onSelect: (id: string) => void
}

export function FeaturedCarousel({ templates, onToggleFavorite, onSelect }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 300
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-amber-500/20">
            <Sparkles className="size-3.5 text-amber-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-100">Featured Templates</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'flex size-7 items-center justify-center rounded-md border border-zinc-800 transition-colors',
              canScrollLeft ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed',
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'flex size-7 items-center justify-center rounded-md border border-zinc-800 transition-colors',
              canScrollRight ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed',
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700"
      >
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            variant="featured"
            onToggleFavorite={onToggleFavorite}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
