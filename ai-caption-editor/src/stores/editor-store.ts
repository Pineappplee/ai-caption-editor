import { create } from 'zustand'
import type { EditorProject, Caption, TranscriptSegment, CaptionStyle, TimelineMarker, PlaybackState } from '@/services/editor'
import { services } from '@/services'

const service = services.editor

interface EditorState {
  project: EditorProject | null
  captions: Caption[]
  transcript: TranscriptSegment[]
  captionStyle: CaptionStyle
  markers: TimelineMarker[]

  currentTime: number
  playbackState: PlaybackState
  volume: number
  isMuted: boolean
  zoom: number

  activePanel: 'transcript' | 'properties' | 'ai' | 'media'
  selectedCaptionId: string | null
  selectedSegmentId: string | null

  loadProject: (id: string) => Promise<void>
  setCurrentTime: (time: number) => void
  setPlaybackState: (state: PlaybackState) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setZoom: (zoom: number) => void
  setActivePanel: (panel: 'transcript' | 'properties' | 'ai' | 'media') => void
  selectCaption: (id: string | null) => void
  selectSegment: (id: string | null) => void
  updateCaptionText: (id: string, text: string) => Promise<void>
  updateCaptionStyle: (style: Partial<CaptionStyle>) => Promise<void>
  formatTime: (seconds: number) => string
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  captions: [],
  transcript: [],
  captionStyle: {
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
  },
  markers: [],

  currentTime: 0,
  playbackState: 'stopped',
  volume: 1,
  isMuted: false,
  zoom: 1,

  activePanel: 'transcript',
  selectedCaptionId: null,
  selectedSegmentId: null,

  loadProject: async (id: string) => {
    const [project, captions, transcript, captionStyle, markers] = await Promise.all([
      service.getProject(id),
      service.getCaptions(id),
      service.getTranscript(id),
      service.getCaptionStyle(id),
      service.getTimelineMarkers(id),
    ])
    set({ project, captions, transcript, captionStyle, markers })
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),

  setPlaybackState: (playbackState: PlaybackState) => set({ playbackState }),

  setVolume: (volume: number) => set({ volume }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  setZoom: (zoom: number) => set({ zoom }),

  setActivePanel: (activePanel) => set({ activePanel }),

  selectCaption: (selectedCaptionId) => set({ selectedCaptionId }),

  selectSegment: (selectedSegmentId) => set({ selectedSegmentId }),

  updateCaptionText: async (id: string, text: string) => {
    await service.updateCaption(id, text)
    set((s) => ({
      captions: s.captions.map((c) => (c.id === id ? { ...c, text } : c)),
    }))
  },

  updateCaptionStyle: async (partial: Partial<CaptionStyle>) => {
    const current = get().captionStyle
    const updated = { ...current, ...partial }
    set({ captionStyle: updated })
    if (get().project) {
      await service.updateCaptionStyle(get().project!.id, updated)
    }
  },

  formatTime: (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  },
}))
