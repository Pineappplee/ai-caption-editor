import { apiClient } from '@/lib/api-client'
import type { IEditorService } from './interface'
import type { EditorProject, Caption, TranscriptSegment, CaptionStyle, TimelineMarker } from './types'

const loadVideoMetadata = (url: string): Promise<{ duration: number; width: number; height: number }> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({ duration: 180, width: 1920, height: 1080 })
    }
    const video = document.createElement('video')
    video.src = url
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration || 180,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
      })
    }
    video.onerror = () => {
      resolve({ duration: 180, width: 1920, height: 1080 })
    }
    setTimeout(() => resolve({ duration: 180, width: 1920, height: 1080 }), 3000)
  })
}

export class HttpEditorService implements IEditorService {
  private activeProjectId: string | null = null

  async getProject(id: string): Promise<EditorProject> {
    this.activeProjectId = id
    const data = await apiClient.get<any>(`/api/v1/projects/${id}`)
    
    let filename = 'video.mp4'
    let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    let duration = 180
    let width = 1920
    let height = 1080

    try {
      const mediaList = await apiClient.get<any[]>(`/api/v1/media/project/${id}`)
      if (Array.isArray(mediaList) && mediaList.length > 0) {
        const media = mediaList.find((m) => m.mimeType?.startsWith('video/') || m.mimeType?.startsWith('audio/')) || mediaList[0]
        if (media) {
          filename = media.originalName || media.fileName
          videoUrl = media.publicUrl
          
          const meta = await loadVideoMetadata(videoUrl)
          duration = meta.duration
          width = meta.width
          height = meta.height
        }
      }
    } catch (err) {
      console.warn('Failed to load media assets for editor project, using defaults', err)
    }

    return {
      id: data.id.toString(),
      title: data.title,
      filename,
      videoUrl,
      duration,
      width,
      height,
      frameRate: 30,
    }
  }

  async getCaptions(projectId: string): Promise<Caption[]> {
    this.activeProjectId = projectId
    try {
      const data = await apiClient.get<any>(`/api/v1/projects/${projectId}/transcript`)
      const segments = Array.isArray(data.segments) ? data.segments : []
      segments.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
      return segments.map((s: any) => ({
        id: s.id.toString(),
        startTime: s.startTime || 0,
        endTime: s.endTime || 0,
        text: s.text,
        speaker: s.speaker,
      }))
    } catch {
      return []
    }
  }

  async getTranscript(projectId: string): Promise<TranscriptSegment[]> {
    this.activeProjectId = projectId
    try {
      const data = await apiClient.get<any>(`/api/v1/projects/${projectId}/transcript`)
      const segments = Array.isArray(data.segments) ? data.segments : []
      segments.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
      return segments.map((s: any) => ({
        id: s.id.toString(),
        startTime: s.startTime || 0,
        endTime: s.endTime || 0,
        text: s.text,
        speaker: s.speaker,
        confidence: s.confidence || 0.95,
      }))
    } catch {
      return []
    }
  }

  async getCaptionStyle(projectId: string): Promise<CaptionStyle> {
    const saved = localStorage.getItem(`caption_style_${projectId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    return {
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
  }

  async updateCaptionStyle(projectId: string, style: CaptionStyle): Promise<void> {
    localStorage.setItem(`caption_style_${projectId}`, JSON.stringify(style))
  }

  async updateCaption(captionId: string, text: string): Promise<Caption> {
    if (!this.activeProjectId) throw new Error('No active project loaded')
    const response = await apiClient.patch<any>(
      `/api/v1/projects/${this.activeProjectId}/transcript/segments/${captionId}`,
      { text },
    )
    return {
      id: response.id.toString(),
      startTime: response.startTime,
      endTime: response.endTime,
      text: response.text,
      speaker: response.speaker,
    }
  }

  async getTimelineMarkers(_projectId: string): Promise<TimelineMarker[]> {
    // Backend doesn't support timeline markers, return default mock markers
    return [
      { id: 'm1', time: 0, label: 'Introduction', type: 'chapter' },
      { id: 'm2', time: 15.8, label: 'Guest intro', type: 'chapter' },
      { id: 'm3', time: 43.0, label: 'Key question', type: 'chapter' },
    ]
  }
}
