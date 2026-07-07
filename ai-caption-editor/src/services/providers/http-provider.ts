import type { IServiceProvider } from './types'
import type { ServiceRegistry } from '../container'
import { HttpAuthService } from '../auth/http'
import { HttpProfileService } from '../profile/http'
import { HttpProjectsService } from '../projects/http'
import { HttpMediaService } from '../media/http'
import { HttpTranscriptService } from '../transcript/http'
import { HttpExportService } from '../export/http'
import { HttpAIService } from '../ai/http'
import { HttpEditorService } from '../editor/http'

// Mock fallbacks for presentation-only helper services
import { MockSettingsService } from '../settings/mock'
import { MockWizardService } from '../wizard/mock'
import { MockCaptionStyleService } from '../caption-style/mock'
import { MockDashboardService } from '../dashboard/mock'
import { MockTemplateMarketService } from '../templates/mock'
import { MockTimelineService } from '../timeline/mock'
import { MockHelpService } from '../help/mock'

export class HttpServiceProvider implements IServiceProvider {
  name = 'http'

  initialize(): void {}

  getServices(): Partial<ServiceRegistry> {
    return {
      auth: new HttpAuthService(),
      profile: new HttpProfileService(),
      projects: new HttpProjectsService(),
      media: new HttpMediaService(),
      transcript: new HttpTranscriptService(),
      export: new HttpExportService(),
      ai: new HttpAIService(),
      editor: new HttpEditorService(),
      
      // Fallback mocks
      settings: new MockSettingsService(),
      wizard: new MockWizardService(),
      captionStyle: new MockCaptionStyleService(),
      dashboard: new MockDashboardService(),
      templates: new MockTemplateMarketService(),
      timeline: new MockTimelineService(),
      help: new MockHelpService(),
    }
  }
}
