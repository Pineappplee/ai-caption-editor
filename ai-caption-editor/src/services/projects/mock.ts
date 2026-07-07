import type { IProjectsService } from './interface'
import type { Project, ProjectsFilter, ProjectsSort } from './types'

const NOW = Date.now()
const DAY = 86400000

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Interview Final',
    status: 'In Progress',
    language: 'EN',
    languageFlag: '🇺🇸',
    duration: '4m 15s',
    segments: 142,
    edited: 'Edited 2 hours ago',
    progress: 65,
    createdAt: new Date(NOW - 3 * DAY).toISOString(),
  },
  {
    id: 'p2',
    title: 'Product Launch',
    status: 'Complete',
    language: 'FR',
    languageFlag: '🇫🇷',
    duration: '8m 02s',
    segments: 218,
    edited: 'Edited yesterday',
    progress: 100,
    createdAt: new Date(NOW - 7 * DAY).toISOString(),
  },
  {
    id: 'p3',
    title: 'Podcast Episode 12',
    status: 'Draft',
    language: 'ES',
    languageFlag: '🇪🇸',
    duration: '52m 40s',
    segments: 612,
    edited: 'Edited 3 days ago',
    progress: 15,
    createdAt: new Date(NOW - 14 * DAY).toISOString(),
  },
  {
    id: 'p4',
    title: 'Customer Story',
    status: 'In Progress',
    language: 'DE',
    languageFlag: '🇩🇪',
    duration: '12m 08s',
    segments: 184,
    edited: 'Edited 5 hours ago',
    progress: 42,
    createdAt: new Date(NOW - 2 * DAY).toISOString(),
  },
  {
    id: 'p5',
    title: 'Tutorial Series',
    status: 'Complete',
    language: 'JP',
    languageFlag: '🇯🇵',
    duration: '24m 33s',
    segments: 301,
    edited: 'Edited last week',
    progress: 100,
    createdAt: new Date(NOW - 30 * DAY).toISOString(),
  },
  {
    id: 'p6',
    title: 'Weekly Recap',
    status: 'Draft',
    language: 'EN',
    languageFlag: '🇺🇸',
    duration: '6m 54s',
    segments: 96,
    edited: 'Edited today',
    progress: 8,
    createdAt: new Date(NOW - 1 * DAY).toISOString(),
  },
  {
    id: 'p7',
    title: 'Client Testimonial',
    status: 'In Progress',
    language: 'EN',
    languageFlag: '🇺🇸',
    duration: '3m 22s',
    segments: 88,
    edited: 'Edited 4 hours ago',
    progress: 78,
    createdAt: new Date(NOW - 5 * DAY).toISOString(),
  },
  {
    id: 'p8',
    title: 'How-to Guide',
    status: 'Complete',
    language: 'FR',
    languageFlag: '🇫🇷',
    duration: '15m 47s',
    segments: 412,
    edited: 'Edited 2 days ago',
    progress: 100,
    createdAt: new Date(NOW - 10 * DAY).toISOString(),
  },
  {
    id: 'p9',
    title: 'Conference Talk',
    status: 'Draft',
    language: 'EN',
    languageFlag: '🇺🇸',
    duration: '45m 12s',
    segments: 1084,
    edited: 'Edited 6 hours ago',
    progress: 3,
    createdAt: new Date(NOW - 1 * DAY).toISOString(),
  },
]

export class MockProjectsService implements IProjectsService {
  async getProjects(): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 150))
    return [...MOCK_PROJECTS]
  }

  async searchProjects(query: string): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 100))
    const q = query.toLowerCase()
    return MOCK_PROJECTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.language.toLowerCase().includes(q),
    )
  }

  filterProjects(projects: Project[], filter: ProjectsFilter): Project[] {
    return projects.filter((p) => {
      if (filter.status && filter.status !== 'All' && p.status !== filter.status) return false
      if (filter.language && filter.language !== 'All' && p.language !== filter.language) return false
      return true
    })
  }

  sortProjects(projects: Project[], sort: ProjectsSort): Project[] {
    const sorted = [...projects]
    sorted.sort((a, b) => {
      let cmp = 0
      if (sort.field === 'name') cmp = a.title.localeCompare(b.title)
      else if (sort.field === 'updated') cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      else if (sort.field === 'created') cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return sort.direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }

  async createProject(): Promise<Project> {
    await new Promise((r) => setTimeout(r, 200))
    const newProject: Project = {
      id: `p${Date.now()}`,
      title: 'Untitled Project',
      status: 'Draft',
      language: 'EN',
      languageFlag: '🇺🇸',
      duration: '0m 00s',
      segments: 0,
      edited: 'Edited just now',
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    MOCK_PROJECTS.unshift(newProject)
    return newProject
  }

  async duplicateProject(id: string): Promise<Project> {
    await new Promise((r) => setTimeout(r, 200))
    const original = MOCK_PROJECTS.find((p) => p.id === id)
    if (!original) throw new Error('Project not found')
    const dup: Project = {
      ...original,
      id: `p${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'Draft',
      edited: 'Edited just now',
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id)
    MOCK_PROJECTS.splice(idx + 1, 0, dup)
    return dup
  }

  async renameProject(id: string, name: string): Promise<Project> {
    await new Promise((r) => setTimeout(r, 200))
    const project = MOCK_PROJECTS.find((p) => p.id === id)
    if (!project) throw new Error('Project not found')
    project.title = name
    project.edited = 'Edited just now'
    return { ...project }
  }

  async archiveProject(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id)
    if (idx !== -1) MOCK_PROJECTS.splice(idx, 1)
  }

  async deleteProject(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id)
    if (idx !== -1) MOCK_PROJECTS.splice(idx, 1)
  }
}
