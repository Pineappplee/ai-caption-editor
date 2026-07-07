import type { ProjectConfig, Template, RecentFile } from './types'

export interface IWizardService {
  getTemplates(): Promise<Template[]>
  getRecentFiles(): Promise<RecentFile[]>
  createProject(config: ProjectConfig, inputMethod: string, file?: File): Promise<{ id: string }>
  uploadFile(file: File): Promise<{ path: string }>
}
