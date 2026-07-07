export type ProjectStatus = 'In Progress' | 'Complete' | 'Draft'

export interface DashboardStats {
  totalProjects: number
  weeklyChange: number
  hoursCaptioned: number
  exportsThisMonth: number
}

export interface ProjectSummary {
  id: string
  title: string
  filename: string
  status: ProjectStatus
  language: string
  languageFlag: string
  segments: number
  duration: string
  edited: string
  thumbnailUrl?: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
}
