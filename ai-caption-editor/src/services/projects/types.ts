export type ProjectStatus = 'In Progress' | 'Complete' | 'Draft'
export type ViewMode = 'grid' | 'list'

export type SortField = 'name' | 'updated' | 'created'
export type SortDirection = 'asc' | 'desc'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  language: string
  languageFlag: string
  duration: string
  segments: number
  edited: string
  progress: number
  thumbnailUrl?: string
  createdAt: string
}

export interface ProjectsFilter {
  status?: ProjectStatus | 'All'
  language?: string | 'All'
}

export interface ProjectsSort {
  field: SortField
  direction: SortDirection
}
