import type { TimelineData, TimelineClip } from './types'

export interface ITimelineService {
  getTimeline(projectId: string): Promise<TimelineData>
  updateClip(clipId: string, data: Partial<TimelineClip>): Promise<void>
  addClip(trackId: string, clip: Omit<TimelineClip, 'id'>): Promise<TimelineClip>
  removeClip(clipId: string): Promise<void>
}
