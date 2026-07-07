import { apiClient } from '@/lib/api-client'
import type { IExportService } from './interface'
import type { ExportSettings, ExportJob } from './types'

export class HttpExportService implements IExportService {
  private localHistory: ExportJob[] = []

  private mapJob(j: any, settings?: ExportSettings): ExportJob {
    const statusMap: Record<string, 'queued' | 'exporting' | 'processing' | 'complete' | 'error'> = {
      'QUEUED': 'queued',
      'EXPORTING': 'exporting',
      'COMPLETED': 'complete',
      'FAILED': 'error',
    }
    const rawStatus = j.status || 'QUEUED'
    const status = statusMap[rawStatus] || 'queued'

    const format = j.format ? j.format.toLowerCase() : 'mp4'

    const resolvedSettings: ExportSettings = settings || {
      format: format as any,
      resolution: 'original',
      frameRate: 'original',
      bitrate: 'auto',
      codec: 'h264',
      qualityPreset: 'balanced',
      includeCaptions: true,
      burnCaptions: true,
      applyStyle: true,
      captionTrackName: 'English',
      outputFilename: 'export',
      exportRange: 'full',
    }

    // Resolve download URL to use fully qualified backend endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const downloadUrl = status === 'complete' 
      ? `${backendUrl.replace(/\/$/, '')}/api/v1/export/${j.id}/download`
      : undefined

    return {
      id: j.id.toString(),
      projectId: j.projectId.toString(),
      settings: resolvedSettings,
      status,
      progress: j.progress || 0,
      error: j.errorMessage || undefined,
      downloadUrl,
      createdAt: j.createdAt || new Date().toISOString(),
      completedAt: j.completedAt || undefined,
      fileSize: status === 'complete' ? 12 * 1024 * 1024 : undefined,
    }
  }

  async *startExport(projectId: string, settings: ExportSettings): AsyncGenerator<ExportJob, ExportJob, unknown> {
    // 1. POST to start asynchronous export job
    const response = await apiClient.post<any>(`/api/v1/projects/${projectId}/export`, {
      format: settings.format,
    })

    let job = this.mapJob(response, settings)
    this.localHistory = this.localHistory.filter((j) => j.id !== job.id)
    this.localHistory.unshift(job)
    yield { ...job }

    // 2. Poll until complete or failed
    const maxRetries = 100
    for (let i = 0; i < maxRetries; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      
      try {
        const polled = await this.getExportStatus(job.id)
        job = { ...polled, settings }
        
        // Update local history cache
        const hIdx = this.localHistory.findIndex((j) => j.id === job.id)
        if (hIdx !== -1) this.localHistory[hIdx] = job

        yield { ...job }

        if (job.status === 'complete' || job.status === 'error') {
          return job
        }
      } catch (err: any) {
        job.status = 'error'
        job.error = err.message || 'Polling failed'
        yield { ...job }
        return job
      }
    }

    job.status = 'error'
    job.error = 'Export timed out'
    yield { ...job }
    return job
  }

  async getExportStatus(jobId: string): Promise<ExportJob> {
    const data = await apiClient.get<any>(`/api/v1/export/${jobId}`)
    return this.mapJob(data)
  }

  async getExportHistory(_projectId: string): Promise<ExportJob[]> {
    // Backend doesn't support list export jobs, return local session history
    return this.localHistory
  }

  async cancelExport(jobId: string): Promise<void> {
    await apiClient.delete(`/api/v1/export/${jobId}`)
    const hIdx = this.localHistory.findIndex((j) => j.id === jobId)
    if (hIdx !== -1) {
      this.localHistory[hIdx] = {
        ...this.localHistory[hIdx],
        status: 'error',
        error: 'Export cancelled',
      }
    }
  }
}
