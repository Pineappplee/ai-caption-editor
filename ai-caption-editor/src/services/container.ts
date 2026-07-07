import type { IAuthService } from './auth/interface'
import type { ISettingsService } from './settings/interface'
import type { IProjectsService } from './projects/interface'
import type { ITranscriptService } from './transcript/interface'
import type { IWizardService } from './wizard/interface'
import type { ICaptionStyleService } from './caption-style/interface'
import type { IDashboardService } from './dashboard/interface'
import type { IProfileService } from './profile/interface'
import type { IAIService } from './ai/interface'
import type { ITemplateMarketService } from './templates/interface'
import type { IExportService } from './export/interface'
import type { ITimelineService } from './timeline/interface'
import type { IEditorService } from './editor/interface'
import type { IHelpService } from './help/interface'
import type { IMediaService } from './media/interface'

export interface ServiceRegistry {
  auth: IAuthService
  settings: ISettingsService
  projects: IProjectsService
  transcript: ITranscriptService
  wizard: IWizardService
  captionStyle: ICaptionStyleService
  dashboard: IDashboardService
  profile: IProfileService
  ai: IAIService
  templates: ITemplateMarketService
  export: IExportService
  timeline: ITimelineService
  editor: IEditorService
  help: IHelpService
  media: IMediaService
}

export type ServiceKey = keyof ServiceRegistry

export class ServiceContainer {
  private services = new Map<ServiceKey, any>()

  register<K extends ServiceKey>(key: K, instance: ServiceRegistry[K]) {
    this.services.set(key, instance)
  }

  get<K extends ServiceKey>(key: K): ServiceRegistry[K] {
    const service = this.services.get(key)
    if (!service) {
      throw new Error(`Service not registered for key: ${key}`)
    }
    return service
  }
}

export const container = new ServiceContainer()
