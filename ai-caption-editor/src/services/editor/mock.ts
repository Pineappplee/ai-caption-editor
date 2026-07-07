import type { IEditorService } from './interface'
import type { EditorProject, Caption, TranscriptSegment, CaptionStyle, TimelineMarker } from './types'

const MOCK_PROJECT: EditorProject = {
  id: 'proj_1',
  title: 'Interview Final',
  filename: 'interview_final.mp4',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 255,
  width: 1920,
  height: 1080,
  frameRate: 30,
}

const MOCK_CAPTIONS: Caption[] = [
  { id: 'c1', startTime: 0, endTime: 3.5, text: 'Welcome to our interview series.' },
  { id: 'c2', startTime: 3.5, endTime: 7.2, text: 'Today we are speaking with Dr. Sarah Chen.' },
  { id: 'c3', startTime: 7.2, endTime: 11.0, text: 'She is a leading researcher in artificial intelligence.' },
  { id: 'c4', startTime: 11.0, endTime: 15.8, text: 'Dr. Chen, thank you for joining us today.' },
  { id: 'c5', startTime: 15.8, endTime: 20.5, text: 'Thank you for having me. I am excited to be here.' },
  { id: 'c6', startTime: 20.5, endTime: 25.0, text: 'Let us start with your background in AI research.' },
  { id: 'c7', startTime: 25.0, endTime: 29.5, text: 'I began my work in machine learning about ten years ago.' },
  { id: 'c8', startTime: 29.5, endTime: 34.0, text: 'My focus has been on natural language processing.' },
  { id: 'c9', startTime: 34.0, endTime: 38.5, text: 'We have seen incredible progress in recent years.' },
  { id: 'c10', startTime: 38.5, endTime: 43.0, text: 'The pace of innovation is truly remarkable.' },
  { id: 'c11', startTime: 43.0, endTime: 47.5, text: 'What do you think is the next big breakthrough?' },
  { id: 'c12', startTime: 47.5, endTime: 52.0, text: 'I believe multimodal AI will transform the field.' },
  { id: 'c13', startTime: 52.0, endTime: 56.5, text: 'Combining text, vision, and audio understanding.' },
  { id: 'c14', startTime: 56.5, endTime: 60.0, text: 'That is a fascinating perspective.' },
]

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 't1', startTime: 0, endTime: 3.5, text: 'Welcome to our interview series.', speaker: 'Host', confidence: 0.98 },
  { id: 't2', startTime: 3.5, endTime: 7.2, text: 'Today we are speaking with Dr. Sarah Chen.', speaker: 'Host', confidence: 0.97 },
  { id: 't3', startTime: 7.2, endTime: 11.0, text: 'She is a leading researcher in artificial intelligence.', speaker: 'Host', confidence: 0.96 },
  { id: 't4', startTime: 11.0, endTime: 15.8, text: 'Dr. Chen, thank you for joining us today.', speaker: 'Host', confidence: 0.99 },
  { id: 't5', startTime: 15.8, endTime: 20.5, text: 'Thank you for having me. I am excited to be here.', speaker: 'Dr. Chen', confidence: 0.95 },
  { id: 't6', startTime: 20.5, endTime: 25.0, text: 'Let us start with your background in AI research.', speaker: 'Host', confidence: 0.97 },
  { id: 't7', startTime: 25.0, endTime: 29.5, text: 'I began my work in machine learning about ten years ago.', speaker: 'Dr. Chen', confidence: 0.96 },
  { id: 't8', startTime: 29.5, endTime: 34.0, text: 'My focus has been on natural language processing.', speaker: 'Dr. Chen', confidence: 0.98 },
  { id: 't9', startTime: 34.0, endTime: 38.5, text: 'We have seen incredible progress in recent years.', speaker: 'Dr. Chen', confidence: 0.97 },
  { id: 't10', startTime: 38.5, endTime: 43.0, text: 'The pace of innovation is truly remarkable.', speaker: 'Dr. Chen', confidence: 0.96 },
]

const MOCK_STYLE: CaptionStyle = {
  fontSize: 24,
  fontFamily: 'Inter',
  fontWeight: '600',
  fontStyle: 'normal',
  textDecoration: 'none',
  fontColor: '#FFFFFF',
  backgroundColor: '#00000080',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  opacity: 1,
  lineHeight: 1.4,
  letterSpacing: 0,
  textAlign: 'center',
  position: 'bottom',
  positionX: 50,
  positionY: 90,
  rotation: 0,
  scale: 1,
  animationPreset: null,
}

const MOCK_MARKERS: TimelineMarker[] = [
  { id: 'm1', time: 0, label: 'Introduction', type: 'chapter' },
  { id: 'm2', time: 15.8, label: 'Guest intro', type: 'chapter' },
  { id: 'm3', time: 43.0, label: 'Key question', type: 'chapter' },
]

export class MockEditorService implements IEditorService {
  async getProject(_id: string): Promise<EditorProject> {
    await new Promise((r) => setTimeout(r, 100))
    return { ...MOCK_PROJECT }
  }

  async getCaptions(_projectId: string): Promise<Caption[]> {
    await new Promise((r) => setTimeout(r, 100))
    return [...MOCK_CAPTIONS]
  }

  async getTranscript(_projectId: string): Promise<TranscriptSegment[]> {
    await new Promise((r) => setTimeout(r, 100))
    return [...MOCK_TRANSCRIPT]
  }

  async getCaptionStyle(_projectId: string): Promise<CaptionStyle> {
    await new Promise((r) => setTimeout(r, 50))
    return { ...MOCK_STYLE }
  }

  async updateCaptionStyle(_projectId: string, _style: CaptionStyle): Promise<void> {
    await new Promise((r) => setTimeout(r, 50))
  }

  async updateCaption(captionId: string, text: string): Promise<Caption> {
    await new Promise((r) => setTimeout(r, 50))
    const caption = MOCK_CAPTIONS.find((c) => c.id === captionId)
    if (!caption) throw new Error('Caption not found')
    return { ...caption, text }
  }

  async getTimelineMarkers(_projectId: string): Promise<TimelineMarker[]> {
    await new Promise((r) => setTimeout(r, 50))
    return [...MOCK_MARKERS]
  }
}
