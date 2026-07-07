import { useState } from 'react'
import {
  X, Star, Heart, Eye, Clock, User, Check, ChevronDown,
  Download, Layers, Tag, Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TemplateDetail, TemplateType } from '@/services/templates'
import { Button } from '@/components/ui/button'

const TYPE_LABELS: Record<TemplateType, string> = {
  caption: 'Caption Template',
  subtitle: 'Subtitle Style',
  animation: 'Animation',
  'lower-third': 'Lower Third',
  social: 'Social Media',
  'brand-kit': 'Brand Kit',
}

interface TemplateDetailPanelProps {
  detail: TemplateDetail
  onClose: () => void
  onToggleFavorite: (id: string, favorite: boolean) => void
  onApply: (id: string) => void
}

export function TemplateDetailPanel({ detail, onClose, onToggleFavorite, onApply }: TemplateDetailPanelProps) {
  const [activePreview, setActivePreview] = useState(0)
  const [showAllVersions, setShowAllVersions] = useState(false)

  const previewImages = detail.previewImages.length > 0 ? detail.previewImages : [detail.thumbnail]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 pt-8 backdrop-blur-sm pb-8">
      <div className="relative w-full max-w-3xl mx-4 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/20">
              <Award className="size-3.5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-zinc-400">Template Details</span>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 grid grid-cols-[1fr_280px] gap-5">
            <div>
              <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-zinc-800">
                <div className="flex h-full w-full items-center justify-center">
                  <Layers className="size-12 text-zinc-600" />
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                    {TYPE_LABELS[detail.type]}
                  </span>
                  <span className="flex items-center gap-0.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-amber-400">
                    <Star className="size-2.5 fill-amber-400" />
                    {detail.rating} ({detail.ratingCount})
                  </span>
                </div>
              </div>
              {previewImages.length > 1 && (
                <div className="flex gap-2">
                  {previewImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePreview(i)}
                      className={cn(
                        'h-12 flex-1 rounded-md border transition-colors',
                        i === activePreview
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700',
                      )}
                    >
                      <Layers className="mx-auto size-4 text-zinc-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">{detail.name}</h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    <User className="size-3" />
                    <span>{detail.creator.name}</span>
                    {detail.creator.verified && (
                      <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onToggleFavorite(detail.id, !detail.isFavorite)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full transition-colors',
                    detail.isFavorite ? 'text-red-400' : 'text-zinc-500 hover:text-red-400',
                  )}
                >
                  <Heart className={cn('size-3.5', detail.isFavorite && 'fill-red-400')} />
                </button>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-zinc-400">{detail.fullDescription}</p>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between rounded-md bg-zinc-800/50 px-3 py-2">
                  <span className="text-xs text-zinc-500">Version</span>
                  <span className="text-xs font-medium text-zinc-300">{detail.version}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-800/50 px-3 py-2">
                  <span className="text-xs text-zinc-500">Usage</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-zinc-300">
                    <Eye className="size-3" />
                    {detail.usageCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-800/50 px-3 py-2">
                  <span className="text-xs text-zinc-500">Created</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-zinc-300">
                    <Clock className="size-3" />
                    {new Date(detail.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {detail.tags.length > 0 && (
                <div className="mb-4">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {detail.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                        <Tag className="size-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.compatibleFormats && detail.compatibleFormats.length > 0 && (
                <div className="mb-4">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Compatible Formats</p>
                  <div className="flex flex-wrap gap-1">
                    {detail.compatibleFormats.map((fmt) => (
                      <span key={fmt} className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{fmt}</span>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="primary" size="md" className="w-full" onClick={() => onApply(detail.id)}>
                <Download className="size-4" />
                Apply Template
              </Button>
            </div>
          </div>

          {detail.features.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-semibold text-zinc-200">Features</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {detail.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-zinc-800/30 px-3 py-2">
                    <Check className="size-3 text-purple-400" />
                    <span className="text-xs text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(detail.recommendedSettings).length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-semibold text-zinc-200">Recommended Settings</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(detail.recommendedSettings).map(([key, value]) => (
                  <div key={key} className="rounded-md bg-zinc-800/30 px-3 py-2">
                    <p className="text-[10px] text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs font-medium text-zinc-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.versions.length > 0 && (
            <div>
              <button
                onClick={() => setShowAllVersions(!showAllVersions)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200"
              >
                <Layers className="size-3.5" />
                Version History ({detail.versions.length})
                <ChevronDown className={cn('size-3 transition-transform', showAllVersions && 'rotate-180')} />
              </button>
              {showAllVersions && (
                <div className="mt-2 space-y-2">
                  {detail.versions.map((v) => (
                    <div key={v.version} className="rounded-md border border-zinc-800 bg-zinc-900/30 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-purple-400">v{v.version}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(v.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {v.changes.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-zinc-600" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
