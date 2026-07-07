import { apiClient } from '@/lib/api-client'
import type { IProjectsService } from './interface'
import type { Project, ProjectsFilter, ProjectsSort } from './types'

export class HttpProjectsService implements IProjectsService {
  private mapProject(p: any): Project {
    const statusMap: Record<string, 'In Progress' | 'Complete' | 'Draft'> = {
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Complete',
      'DRAFT': 'Draft',
    }
    const rawStatus = p.status || 'DRAFT'
    const status = statusMap[rawStatus] || 'Draft'

    const lang = (p.language || 'en').toUpperCase()
    const flagMap: Record<string, string> = {
      'EN': '🇺🇸',
      'FR': '🇫🇷',
      'ES': '🇪🇸',
      'DE': '🇩🇪',
      'JP': '🇯🇵',
      'ZH': '🇨🇳',
      'IT': '🇮🇹',
    }
    const languageFlag = flagMap[lang] || '🇺🇸'

    const updatedAt = p.updatedAt || p.createdAt
    const diffMs = Date.now() - new Date(updatedAt).getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    let edited = 'Edited just now'
    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24)
      edited = `Edited ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours >= 1) {
      edited = `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    }

    return {
      id: p.id.toString(),
      title: p.title,
      status,
      language: lang,
      languageFlag,
      duration: '0m 00s',
      segments: 0,
      edited,
      progress: status === 'Complete' ? 100 : (status === 'In Progress' ? 50 : 0),
      thumbnailUrl: p.thumbnailUrl || undefined,
      createdAt: p.createdAt || new Date().toISOString(),
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const data = await apiClient.get<any>('/api/v1/projects?page=0&size=100')
      const projects = Array.isArray(data.content) ? data.content : []
      return projects.map((p: any) => this.mapProject(p))
    } catch (err) {
      console.warn('Failed to load projects from server', err)
      return []
    }
  }

  async searchProjects(query: string): Promise<Project[]> {
    const list = await this.getProjects()
    const q = query.toLowerCase()
    return list.filter(
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
    const data = await apiClient.post<any>('/api/v1/projects', {
      title: 'Untitled Project',
      language: 'en',
    })
    return this.mapProject(data)
  }

  async duplicateProject(id: string): Promise<Project> {
    // Backend doesn't support duplicate natively, perform client-side duplicate workflow
    const projects = await this.getProjects()
    const original = projects.find((p) => p.id === id)
    if (!original) throw new Error('Project not found')

    // 1. Create duplicate project metadata
    const duplicate = await apiClient.post<any>('/api/v1/projects', {
      title: `${original.title} (Copy)`,
      language: original.language.toLowerCase(),
    })

    // 2. Fetch original transcript segments
    try {
      const transcriptData = await apiClient.get<any>(`/api/v1/projects/${id}/transcript`)
      if (transcriptData && Array.isArray(transcriptData.segments) && transcriptData.segments.length > 0) {
        // Save same segments to duplicate project
        const createSegments = transcriptData.segments.map((seg: any) => ({
          startTime: seg.startTime,
          endTime: seg.endTime,
          text: seg.text,
          speaker: seg.speaker,
          confidence: seg.confidence,
          orderIndex: seg.orderIndex,
        }))
        await apiClient.post(`/api/v1/projects/${duplicate.id}/transcript`, {
          language: transcriptData.language || original.language.toLowerCase(),
          segments: createSegments,
        })
      }
    } catch {
      // Transcript might not exist, ignore
    }

    return this.mapProject(duplicate)
  }

  async renameProject(id: string, name: string): Promise<Project> {
    const data = await apiClient.patch<any>(`/api/v1/projects/${id}`, {
      title: name,
    })
    return this.mapProject(data)
  }

  async archiveProject(id: string): Promise<void> {
    // Delete enpoint behaves as archive/delete for frontend compatibility
    await apiClient.delete(`/api/v1/projects/${id}`)
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/projects/${id}`)
  }
}
