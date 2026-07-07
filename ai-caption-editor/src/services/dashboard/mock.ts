import type { IDashboardService } from './interface'
import type { DashboardStats, ProjectSummary } from './types'

const MOCK_STATS: DashboardStats = {
  totalProjects: 12,
  weeklyChange: 3,
  hoursCaptioned: 47.3,
  exportsThisMonth: 28,
}

const MOCK_PROJECTS: ProjectSummary[] = [
  {
    id: '1',
    title: 'Interview Final',
    filename: 'interview_final.mp4',
    status: 'In Progress',
    language: 'EN',
    languageFlag: '🇺🇸',
    segments: 142,
    duration: '4m 15s',
    edited: 'Edited 2 hours ago',
  },
  {
    id: '2',
    title: 'Product Launch',
    filename: 'product_launch.mov',
    status: 'Complete',
    language: 'FR',
    languageFlag: '🇫🇷',
    segments: 218,
    duration: '8m 02s',
    edited: 'Edited yesterday',
  },
  {
    id: '3',
    title: 'Podcast Episode 12',
    filename: 'podcast_ep12.mp4',
    status: 'Draft',
    language: 'ES',
    languageFlag: '🇪🇸',
    segments: 612,
    duration: '52m 40s',
    edited: 'Edited 3 days ago',
  },
  {
    id: '4',
    title: 'Customer Story',
    filename: 'customer_story.mp4',
    status: 'In Progress',
    language: 'DE',
    languageFlag: '🇩🇪',
    segments: 184,
    duration: '12m 08s',
    edited: 'Edited 5 hours ago',
  },
  {
    id: '5',
    title: 'Tutorial Series',
    filename: 'tutorial_ep3.mp4',
    status: 'Complete',
    language: 'JP',
    languageFlag: '🇯🇵',
    segments: 301,
    duration: '24m 33s',
    edited: 'Edited last week',
  },
  {
    id: '6',
    title: 'Weekly Recap',
    filename: 'weekly_recap.mp4',
    status: 'Draft',
    language: 'EN',
    languageFlag: '🇺🇸',
    segments: 96,
    duration: '6m 54s',
    edited: 'Edited today',
  },
]

export class MockDashboardService implements IDashboardService {
  async getStats(): Promise<DashboardStats> {
    await new Promise((r) => setTimeout(r, 200))
    return MOCK_STATS
  }

  async getRecentProjects(): Promise<ProjectSummary[]> {
    await new Promise((r) => setTimeout(r, 200))
    return MOCK_PROJECTS
  }

  async searchProjects(query: string): Promise<ProjectSummary[]> {
    await new Promise((r) => setTimeout(r, 200))
    const q = query.toLowerCase()
    return MOCK_PROJECTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.filename.toLowerCase().includes(q) ||
        p.language.toLowerCase().includes(q),
    )
  }
}
