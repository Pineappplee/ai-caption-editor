import type { IWizardService } from './interface'
import type { ProjectConfig, Template, RecentFile } from './types'

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Interview',
    description: 'Standard interview format with dual captions',
  },
  {
    id: 't2',
    name: 'Podcast',
    description: 'Podcast-style waveform and captions',
  },
  {
    id: 't3',
    name: 'Tutorial',
    description: 'Step-by-step tutorial with highlighted captions',
  },
  {
    id: 't4',
    name: 'Social Clip',
    description: 'Vertical format for social media',
  },
]

const MOCK_RECENT_FILES: RecentFile[] = [
  { id: 'f1', name: 'interview_raw.mp4', path: '~/Downloads/interview_raw.mp4', size: '245 MB', type: 'video' },
  { id: 'f2', name: 'voiceover.wav', path: '~/Downloads/voiceover.wav', size: '18 MB', type: 'audio' },
  { id: 'f3', name: 'product_demo.mov', path: '~/Desktop/product_demo.mov', size: '512 MB', type: 'video' },
  { id: 'f4', name: 'podcast_ep12.mp3', path: '~/Desktop/podcast_ep12.mp3', size: '64 MB', type: 'audio' },
]

export class MockWizardService implements IWizardService {
  async getTemplates(): Promise<Template[]> {
    await new Promise((r) => setTimeout(r, 150))
    return [...MOCK_TEMPLATES]
  }

  async getRecentFiles(): Promise<RecentFile[]> {
    await new Promise((r) => setTimeout(r, 150))
    return [...MOCK_RECENT_FILES]
  }

  async createProject(_config: ProjectConfig, _inputMethod: string, _file?: File): Promise<{ id: string }> {
    await new Promise((r) => setTimeout(r, 300))
    return { id: `proj_${Date.now()}` }
  }

  async uploadFile(_file: File): Promise<{ path: string }> {
    await new Promise((r) => setTimeout(r, 200))
    return { path: '/uploads/temp_file' }
  }
}
