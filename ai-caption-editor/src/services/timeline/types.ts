export type TrackType = 'video' | 'audio' | 'caption'

export interface TimelineClip {
  id: string
  trackId: string
  startTime: number
  endTime: number
  label: string
  color?: string
  text?: string
  waveformData?: number[]
}

export interface TimelineTrackData {
  id: string
  type: TrackType
  label: string
  height: number
  clips: TimelineClip[]
}

export interface TimelineData {
  tracks: TimelineTrackData[]
  duration: number
}
