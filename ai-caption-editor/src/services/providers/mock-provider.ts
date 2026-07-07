import type { IServiceProvider } from './types'
import type { ServiceRegistry } from '../container'
import { MockAuthService } from '../auth/mock'
import { MockSettingsService } from '../settings/mock'
import { MockProjectsService } from '../projects/mock'
import { MockTranscriptService } from '../transcript/mock'
import { MockWizardService } from '../wizard/mock'
import { MockCaptionStyleService } from '../caption-style/mock'
import { MockDashboardService } from '../dashboard/mock'
import { MockProfileService } from '../profile/mock'
import { MockAIService } from '../ai/mock'
import { MockTemplateMarketService } from '../templates/mock'
import { MockExportService } from '../export/mock'
import { MockTimelineService } from '../timeline/mock'
import { MockEditorService } from '../editor/mock'
import { MockHelpService } from '../help/mock'
import { MockMediaService } from '../media/mock'

export class MockServiceProvider implements IServiceProvider {
  name = 'mock'

  initialize(): void {}

  getServices(): Partial<ServiceRegistry> {
    return {
      auth: new MockAuthService(),
      settings: new MockSettingsService(),
      projects: new MockProjectsService(),
      transcript: new MockTranscriptService(),
      wizard: new MockWizardService(),
      captionStyle: new MockCaptionStyleService(),
      dashboard: new MockDashboardService(),
      profile: new MockProfileService(),
      ai: new MockAIService(),
      templates: new MockTemplateMarketService(),
      export: new MockExportService(),
      timeline: new MockTimelineService(),
      editor: new MockEditorService(),
      help: new MockHelpService(),
      media: new MockMediaService(),
    }
  }
}
