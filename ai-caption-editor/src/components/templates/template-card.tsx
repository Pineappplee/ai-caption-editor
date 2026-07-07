import { Heart, Star, Eye, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template, TemplateType } from '@/services/templates'

const TYPE_ICONS: Record<TemplateType, LucideIcon> = {
  caption: Heart,
  subtitle: Heart,
  animation: Heart,
  'lower-third': Heart,
  social: Heart,
  'brand-kit': Heart,
}

const TYPE_LABELS: Record<TemplateType, string> = {
  caption: 'Caption',
  subtitle: 'Subtitle',
  animation: 'Animation',
  'lower-third': 'Lower Third',
  social: 'Social',
  'brand-kit': 'Brand Kit',
}

interface TemplateCardProps {
  template: Template
  onToggleFavorite: (id: string, favorite: boolean) => void
  onClick: (id: string) => void
  variant?: 'grid' | 'featured'
}

export function TemplateCard({ template, onToggleFavorite, onClick, variant = 'grid' }: TemplateCardProps) {
  const Icon = TYPE_ICONS[template.type]
  const isFeatured = variant === 'featured'

  return (
    <div
      className={cn(
        'group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition-all hover:border-zinc-700 hover:bg-zinc-900/60',
        isFeatured ? 'shrink-0 w-[280px]' : 'w-full',
      )}
      onClick={() => onClick(template.id)}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        <div className="flex h-full w-full items-center justify-center">
          <Icon className="size-8 text-zinc-600" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.id, !template.isFavorite) }}
          className={cn(
            'absolute right-2 top-2 flex size-7 items-center justify-center rounded-full transition-colors',
            template.isFavorite
              ? 'bg-red-500/20 text-red-400'
              : 'bg-black/40 text-zinc-400 opacity-0 group-hover:opacity-100',
          )}
        >
          <Heart className={cn('size-3.5', template.isFavorite && 'fill-red-400')} />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
            {TYPE_LABELS[template.type]}
          </span>
          <span className="flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-amber-400">
            <Star className="size-2.5 fill-amber-400" />
            {template.rating}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-zinc-200 line-clamp-1">{template.name}</h3>
          {template.creator.verified && (
            <span className="shrink-0 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
              Official
            </span>
          )}
        </div>
        <p className="mb-2 text-xs text-zinc-500 line-clamp-1">{template.description}</p>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="truncate">{template.creator.name}</span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {template.usageCount >= 1000 ? `${(template.usageCount / 1000).toFixed(1)}k` : template.usageCount}
          </span>
        </div>
        {template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
