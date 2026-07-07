import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '@/services'
import type { Project, ViewMode, SortField, SortDirection, ProjectStatus } from '@/services/projects'
import { SearchBar } from './search-bar'
import { FilterBar } from './filter-bar'
import { ProjectList } from './project-list'
import { EmptyState } from './empty-state'



export function ProjectsPage() {
  const { projects: service } = useServices()
  const navigate = useNavigate()
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All')
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(true)

  const applyFilters = useCallback(
    (projects: Project[], query: string, status: ProjectStatus | 'All', field: SortField, dir: SortDirection) => {
      let result = [...projects]

      if (query.trim()) {
        const q = query.toLowerCase()
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.language.toLowerCase().includes(q),
        )
      }

      if (status !== 'All') {
        result = result.filter((p) => p.status === status)
      }

      result.sort((a, b) => {
        let cmp = 0
        if (field === 'name') cmp = a.title.localeCompare(b.title)
        else if (field === 'updated' || field === 'created')
          cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return dir === 'asc' ? -cmp : cmp
      })

      return result
    },
    [],
  )

  useEffect(() => {
    service.getProjects().then((projects) => {
      setAllProjects(projects)
      setFiltered(applyFilters(projects, search, statusFilter, sortField, sortDirection))
      setLoading(false)
    })
  }, [applyFilters, search, statusFilter, sortField, sortDirection, service])

  useEffect(() => {
    setFiltered(applyFilters(allProjects, search, statusFilter, sortField, sortDirection))
  }, [search, statusFilter, sortField, sortDirection, allProjects, applyFilters])

  const handleNewProject = async () => {
    navigate('/projects/new')
  }

  const handleOpen = (id: string) => {
    navigate(`/editor/${id}`)
  }

  const handleDuplicate = async (id: string) => {
    const dup = await service.duplicateProject(id)
    setAllProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      const copy = [...prev]
      copy.splice(idx + 1, 0, dup)
      return copy
    })
  }

  const handleRename = async (id: string, name: string) => {
    await service.renameProject(id, name)
    setAllProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: name } : p)),
    )
  }

  const handleArchive = async (id: string) => {
    await service.archiveProject(id)
    setAllProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDelete = async (id: string) => {
    await service.deleteProject(id)
    setAllProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800/50 px-6 py-5 lg:px-8">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Projects</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Manage all your caption projects
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 lg:px-8">
        <FilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, dir) => {
            setSortField(field)
            setSortDirection(dir)
          }}
          onNewProject={handleNewProject}
          totalCount={filtered.length}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-600 border-t-purple-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState searchQuery={search} />
        ) : (
          <ProjectList
            projects={filtered}
            viewMode={viewMode}
            onOpen={handleOpen}
            onDuplicate={handleDuplicate}
            onRename={handleRename}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
