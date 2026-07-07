import type { ITimelineService } from './interface'
import type { TimelineData, TimelineClip } from './types'

function generateWaveform(length: number): number[] {
  const data: number[] = []
  for (let i = 0; i < length; i++) {
    const t = i / length
    data.push(
      0.3 +
        0.4 * Math.sin(t * 40) * (1 - t * 0.5) +
        0.2 * Math.sin(t * 97) +
        0.1 * Math.sin(t * 203),
    )
  }
  return data
}

const MOCK_TIMELINE: TimelineData = {
  tracks: [
    {
      id: 'track_video',
      type: 'video',
      label: 'Video',
      height: 48,
      clips: [
        {
          id: 'clip_video_main',
          trackId: 'track_video',
          startTime: 0,
          endTime: 255,
          label: 'interview_final.mp4',
          color: '#6366f1',
        },
      ],
    },
    {
      id: 'track_audio',
      type: 'audio',
      label: 'Audio',
      height: 48,
      clips: [
        {
          id: 'clip_audio_main',
          trackId: 'track_audio',
          startTime: 0,
          endTime: 255,
          label: 'Stereo',
          color: '#22c55e',
          waveformData: generateWaveform(200),
        },
      ],
    },
    {
      id: 'track_captions',
      type: 'caption',
      label: 'Captions',
      height: 48,
      clips: [
        { id: 'c1', trackId: 'track_captions', startTime: 0, endTime: 3.5, label: 'Welcome to our interview series.', text: 'Welcome to our interview series.', color: '#3b82f6' },
        { id: 'c2', trackId: 'track_captions', startTime: 3.5, endTime: 7.2, label: 'Today we are speaking with Dr. Sarah Chen.', text: 'Today we are speaking with Dr. Sarah Chen.', color: '#3b82f6' },
        { id: 'c3', trackId: 'track_captions', startTime: 7.2, endTime: 11.0, label: 'She is a leading researcher in AI.', text: 'She is a leading researcher in AI.', color: '#3b82f6' },
        { id: 'c4', trackId: 'track_captions', startTime: 11.0, endTime: 15.8, label: 'Dr. Chen, thank you for joining us.', text: 'Dr. Chen, thank you for joining us.', color: '#3b82f6' },
        { id: 'c5', trackId: 'track_captions', startTime: 15.8, endTime: 20.5, label: 'Thank you for having me.', text: 'Thank you for having me.', color: '#3b82f6' },
        { id: 'c6', trackId: 'track_captions', startTime: 20.5, endTime: 25.0, label: 'Let us start with your background.', text: 'Let us start with your background.', color: '#3b82f6' },
        { id: 'c7', trackId: 'track_captions', startTime: 25.0, endTime: 29.5, label: 'I began my work in ML ten years ago.', text: 'I began my work in ML ten years ago.', color: '#3b82f6' },
        { id: 'c8', trackId: 'track_captions', startTime: 29.5, endTime: 34.0, label: 'My focus has been on NLP.', text: 'My focus has been on NLP.', color: '#3b82f6' },
        { id: 'c9', trackId: 'track_captions', startTime: 34.0, endTime: 38.5, label: 'We have seen incredible progress.', text: 'We have seen incredible progress.', color: '#3b82f6' },
        { id: 'c10', trackId: 'track_captions', startTime: 38.5, endTime: 43.0, label: 'The pace of innovation is remarkable.', text: 'The pace of innovation is remarkable.', color: '#3b82f6' },
        { id: 'c11', trackId: 'track_captions', startTime: 43.0, endTime: 47.5, label: 'What is the next big breakthrough?', text: 'What is the next big breakthrough?', color: '#3b82f6' },
        { id: 'c12', trackId: 'track_captions', startTime: 47.5, endTime: 52.0, label: 'I believe multimodal AI will transform.', text: 'I believe multimodal AI will transform.', color: '#3b82f6' },
        { id: 'c13', trackId: 'track_captions', startTime: 52.0, endTime: 56.5, label: 'Combining text, vision, and audio.', text: 'Combining text, vision, and audio.', color: '#3b82f6' },
        { id: 'c14', trackId: 'track_captions', startTime: 56.5, endTime: 60.0, label: 'That is a fascinating perspective.', text: 'That is a fascinating perspective.', color: '#3b82f6' },
      ],
    },
  ],
  duration: 255,
}

export class MockTimelineService implements ITimelineService {
  private data: TimelineData = { ...MOCK_TIMELINE }

  async getTimeline(_projectId: string): Promise<TimelineData> {
    await new Promise((r) => setTimeout(r, 50))
    return {
      ...this.data,
      tracks: this.data.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => ({ ...c })),
      })),
    }
  }

  async updateClip(clipId: string, data: Partial<TimelineClip>): Promise<void> {
    await new Promise((r) => setTimeout(r, 30))
    for (const track of this.data.tracks) {
      const idx = track.clips.findIndex((c) => c.id === clipId)
      if (idx !== -1) {
        track.clips[idx] = { ...track.clips[idx], ...data }
        return
      }
    }
  }

  async addClip(trackId: string, clip: Omit<TimelineClip, 'id'>): Promise<TimelineClip> {
    await new Promise((r) => setTimeout(r, 30))
    const newClip: TimelineClip = { id: `clip_${Date.now()}`, ...clip }
    const track = this.data.tracks.find((t) => t.id === trackId)
    if (track) track.clips.push(newClip)
    return newClip
  }

  async removeClip(clipId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 30))
    for (const track of this.data.tracks) {
      track.clips = track.clips.filter((c) => c.id !== clipId)
    }
  }
}
