import type { ExportSettings, ExportJob } from './types'
import type { IExportService } from './interface'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export class MockExportService implements IExportService {
  private jobs = new Map<string, ExportJob>()
  private counter = 0
  private cancelled = new Set<string>()

  async *startExport(projectId: string, settings: ExportSettings): AsyncGenerator<ExportJob, ExportJob, unknown> {
    const id = `export-${++this.counter}`
    const job: ExportJob = {
      id,
      projectId,
      settings,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      estimatedSize: 1024 * 1024 * 15,
    }

    this.jobs.set(id, job)

    job.status = 'exporting'
    job.progress = 0
    yield { ...job }

    const totalSteps = 10
    for (let step = 1; step <= totalSteps; step++) {
      if (this.cancelled.has(id)) {
        job.status = 'error'
        job.error = 'Export cancelled'
        this.jobs.set(id, job)
        yield { ...job }
        return job
      }

      await sleep(400 + Math.random() * 300)

      job.progress = Math.round((step / totalSteps) * 100)
      job.status = step < totalSteps ? 'exporting' : 'processing'
      if (step === totalSteps) {
        job.status = 'processing'
        job.progress = 95
      }
      yield { ...job }
    }

    await sleep(300)

    job.status = 'complete'
    job.progress = 100
    job.completedAt = new Date().toISOString()
    job.downloadUrl = `#download-${id}`
    job.fileSize = Math.round(10 + Math.random() * 20) * 1024 * 1024
    this.jobs.set(id, job)
    yield { ...job }

    return job
  }

  async getExportStatus(jobId: string): Promise<ExportJob> {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error('Export job not found')
    return { ...job }
  }

  async getExportHistory(_projectId: string): Promise<ExportJob[]> {
    return Array.from(this.jobs.values())
      .filter((j) => j.status === 'complete' || j.status === 'error')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async cancelExport(jobId: string): Promise<void> {
    this.cancelled.add(jobId)
  }
}
