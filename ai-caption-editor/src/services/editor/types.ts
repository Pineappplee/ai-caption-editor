export type PlaybackState = 'playing' | 'paused' | 'stopped'

export interface EditorProject {
  id: string
  title: string
  filename: string
  videoUrl: string
  duration: number
  width: number
  height: number
  frameRate: number
  thumbnailUrl?: string
}

export interface Caption {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
}

export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
  confidence: number
}

export interface CaptionStyle {
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  fontColor: string
  backgroundColor: string
  strokeColor: string
  strokeWidth: number
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  opacity: number
  lineHeight: number
  letterSpacing: number
  textAlign: 'left' | 'center' | 'right'
  position: 'top' | 'middle' | 'bottom'
  positionX: number
  positionY: number
  rotation: number
  scale: number
  animationPreset: string | null
}

export interface TimelineMarker {
  id: string
  time: number
  label: string
  type: 'chapter' | 'note' | 'caption'
}
