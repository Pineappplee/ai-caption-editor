import { useNavigate, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { SIDEBAR_NAV } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const subtitle = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
    '/projects/new': 'New Project',
    '/edit': 'Editor',
    '/export': 'Export',
    '/templates': 'Templates',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/help': 'Help',
  }[location.pathname] ?? 'Dashboard'

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-600">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">AI Caption Editor</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 px-3 py-4">
        <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/projects/new')}>
          New Project
        </Button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === '/profile'
              ? 'bg-purple-600/10 text-purple-400'
              : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
          }`}
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-800">
            <User className="size-3.5" />
          </div>
          <span>Profile</span>
        </button>
      </div>
    </aside>
  )
}
