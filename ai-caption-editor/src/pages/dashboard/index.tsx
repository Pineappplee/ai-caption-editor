import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useServices } from '@/services'
import type { DashboardStats, ProjectSummary } from '@/services/dashboard'
import { StatsCards } from './stats-cards'
import { RecentProjects } from './recent-projects'
import { QuickActions } from './quick-actions'



export function DashboardPage() {
  const { dashboard: service } = useServices()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    service.getStats().then(setStats)
    service.getRecentProjects().then(setProjects)
  }, [service])

  useEffect(() => {
    if (search.trim()) {
      service.searchProjects(search).then(setProjects)
    } else {
      service.getRecentProjects().then(setProjects)
    }
  }, [search, service])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back — {stats?.totalProjects ?? '...'} active projects
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {stats && (
        <div className="mt-8">
          <StatsCards stats={stats} />
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Recent Projects</h2>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            All Projects
          </button>
        </div>
        <div className="mt-4">
          <RecentProjects projects={projects} />
        </div>
      </div>

      <div className="mt-10">
        <QuickActions />
      </div>
    </div>
  )
}
