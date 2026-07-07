import type { ExportSettings, ExportJob } from './types'

export interface IExportService {
  startExport(projectId: string, settings: ExportSettings): AsyncGenerator<ExportJob, ExportJob, unknown>
  getExportStatus(jobId: string): Promise<ExportJob>
  getExportHistory(projectId: string): Promise<ExportJob[]>
  cancelExport(jobId: string): Promise<void>
}
