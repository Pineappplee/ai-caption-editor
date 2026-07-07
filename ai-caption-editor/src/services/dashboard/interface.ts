import type { DashboardStats, ProjectSummary } from './types'

export interface IDashboardService {
  getStats(): Promise<DashboardStats>
  getRecentProjects(): Promise<ProjectSummary[]>
  searchProjects(query: string): Promise<ProjectSummary[]>
}
