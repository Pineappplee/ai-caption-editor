import { useNavigate } from 'react-router-dom'
import { Upload, Mic, Languages, Download } from 'lucide-react'

const actions = [
  {
    title: 'Import Video',
    description: 'Add new media',
    icon: Upload,
    to: '/projects/new',
  },
  {
    title: 'Auto-Transcribe',
    description: 'Generate captions',
    icon: Mic,
    to: '/projects/new',
  },
  {
    title: 'Translate',
    description: 'Localize content',
    icon: Languages,
    to: '/projects/new',
  },
  {
    title: 'Export All',
    description: 'Deliver files',
    icon: Download,
    to: '/projects',
  },
]

export function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.title}
            type="button"
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-5 text-center transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-400">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{action.title}</p>
              <p className="text-xs text-zinc-500">{action.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
