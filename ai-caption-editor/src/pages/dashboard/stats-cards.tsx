import { FolderKanban, Clock, Download } from 'lucide-react'
import type { DashboardStats } from '@/services/dashboard'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Projects',
      value: String(stats.totalProjects),
      change: `+${stats.weeklyChange} this week`,
      icon: FolderKanban,
    },
    {
      label: 'Hours Captioned',
      value: `${stats.hoursCaptioned}h`,
      change: `+${stats.weeklyChange} this week`,
      icon: Clock,
    },
    {
      label: 'Exports This Month',
      value: String(stats.exportsThisMonth),
      change: `+${stats.weeklyChange} this week`,
      icon: Download,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{card.label}</p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-600/10 text-purple-400">
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">{card.value}</p>
            <p className="mt-0.5 text-xs text-emerald-400">{card.change}</p>
          </div>
        )
      })}
    </div>
  )
}
