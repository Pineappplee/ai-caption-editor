import type { Project, ProjectsFilter, ProjectsSort } from './types'

export interface IProjectsService {
  getProjects(): Promise<Project[]>
  searchProjects(query: string): Promise<Project[]>
  filterProjects(projects: Project[], filter: ProjectsFilter): Project[]
  sortProjects(projects: Project[], sort: ProjectsSort): Project[]
  createProject(): Promise<Project>
  duplicateProject(id: string): Promise<Project>
  renameProject(id: string, name: string): Promise<Project>
  archiveProject(id: string): Promise<void>
  deleteProject(id: string): Promise<void>
}
