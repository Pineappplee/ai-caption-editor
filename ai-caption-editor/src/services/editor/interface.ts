import type { EditorProject, Caption, TranscriptSegment, CaptionStyle, TimelineMarker } from './types'

export interface IEditorService {
  getProject(id: string): Promise<EditorProject>
  getCaptions(projectId: string): Promise<Caption[]>
  getTranscript(projectId: string): Promise<TranscriptSegment[]>
  getCaptionStyle(projectId: string): Promise<CaptionStyle>
  updateCaptionStyle(projectId: string, style: CaptionStyle): Promise<void>
  updateCaption(captionId: string, text: string): Promise<Caption>
  getTimelineMarkers(projectId: string): Promise<TimelineMarker[]>
}
