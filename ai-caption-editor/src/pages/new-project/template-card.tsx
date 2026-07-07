import { LayoutTemplate } from 'lucide-react'
import type { Template } from '@/services/wizard'

interface TemplateCardProps {
  template: Template
  selected: boolean
  onSelect: (template: Template) => void
}

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-left transition-all ${
        selected
          ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
          : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
      }`}
    >
      <div className={`flex size-12 items-center justify-center rounded-xl ${
        selected ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'
      }`}>
        <LayoutTemplate className="size-6" />
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${
          selected ? 'text-purple-300' : 'text-zinc-100'
        }`}>
          {template.name}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{template.description}</p>
      </div>
    </button>
  )
}
