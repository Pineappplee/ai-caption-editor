import { useState, useCallback, useRef, useEffect } from 'react'
import type { TimelineClip, TimelineTrackData, TimelineData } from '@/services/timeline'
import { services } from '@/services'

const service = services.timeline

const MIN_ZOOM = 1
const MAX_ZOOM = 120
const DEFAULT_ZOOM = 8
const SNAP_THRESHOLD = 6
const AUTO_SCROLL_MARGIN = 60
const AUTO_SCROLL_SPEED = 8
const DEFAULT_TRACK_HEIGHT = 36

interface HistoryEntry {
  tracks: TimelineTrackData[]
}

export function useTimeline(projectId: string | undefined) {
  const [tracks, setTracks] = useState<TimelineTrackData[]>([])
  const [duration, setDuration] = useState(255)
  const [zoom, setZoomState] = useState(DEFAULT_ZOOM)
  const [scrollLeft, setScrollLeftState] = useState(0)
  const [playheadTime, setPlayheadTimeState] = useState(0)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [trackHeights, setTrackHeights] = useState<Record<string, number>>({})

  const containerRef = useRef<HTMLDivElement>(null)
  const wheelAreaRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<number | null>(null)
  const lastMouseXRef = useRef(0)
  const zoomRef = useRef(zoom)
  const scrollLeftRef = useRef(scrollLeft)
  zoomRef.current = zoom
  scrollLeftRef.current = scrollLeft

  const dragRef = useRef<{
    type: 'move' | 'resize-left' | 'resize-right'
    clipId: string
    startX: number
    initialStartTime: number
    initialEndTime: number
  } | null>(null)

  const setScrollLeft = useCallback((v: number) => {
    setScrollLeftState(Math.max(0, v))
  }, [])

  const pushHistory = useCallback((newTracks: TimelineTrackData[]) => {
    setHistory((h) => {
      const entry: HistoryEntry = { tracks: newTracks.map((t) => ({ ...t, clips: t.clips.map((c) => ({ ...c })) })) }
      const trimmed = h.slice(0, historyIndex + 1)
      trimmed.push(entry)
      return trimmed.slice(-50)
    })
    setHistoryIndex((i) => Math.min(i + 1, 49))
  }, [historyIndex])

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    service.getTimeline(projectId).then((data: TimelineData) => {
      setTracks(data.tracks)
      setDuration(data.duration)
      setIsLoading(false)
      const entry: HistoryEntry = { tracks: data.tracks.map((t) => ({ ...t, clips: t.clips.map((c) => ({ ...c })) })) }
      setHistory([entry])
      setHistoryIndex(0)
    })
  }, [projectId])

  // Zoom
  const setZoom = useCallback((z: number) => {
    setZoomState(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z)))
  }, [])

  // Wheel zoom: ctrl/cmd + wheel or pinch
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      const delta = -e.deltaY * 0.05
      const container = containerRef.current
      if (!container) return
      const cr = container.getBoundingClientRect()
      const mouseX = e.clientX - cr.left
      const currentViewTime = (scrollLeftRef.current + mouseX) / zoomRef.current
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current + delta * zoomRef.current))
      const newScrollLeft = currentViewTime * newZoom - mouseX
      setZoomState(newZoom)
      setScrollLeftState(Math.max(0, newScrollLeft))
    } else if (e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      setScrollLeftState((prev) => Math.max(0, prev + e.deltaY))
    }
  }, [])

  // Native wheel handler for {passive: false} support
  const handleNativeWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      const delta = -e.deltaY * 0.05
      const container = containerRef.current
      if (!container) return
      const cr = container.getBoundingClientRect()
      const mouseX = e.clientX - cr.left
      const currentViewTime = (scrollLeftRef.current + mouseX) / zoomRef.current
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current + delta * zoomRef.current))
      const newScrollLeft = currentViewTime * newZoom - mouseX
      setZoomState(newZoom)
      setScrollLeftState(Math.max(0, newScrollLeft))
    } else if (e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      setScrollLeftState((prev) => Math.max(0, prev + e.deltaY))
    }
  }, [])

  const setPlayheadTime = useCallback((time: number) => {
    setPlayheadTimeState(Math.max(0, Math.min(time, duration)))
  }, [duration])

  // Auto-scroll while dragging
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return
    autoScrollRef.current = window.setInterval(() => {
      if (!dragRef.current) {
        if (autoScrollRef.current !== null) {
          clearInterval(autoScrollRef.current)
          autoScrollRef.current = null
        }
        return
      }
      const timelineEl = containerRef.current
      if (!timelineEl) return
      const rect = timelineEl.getBoundingClientRect()
      const x = lastMouseXRef.current
      if (x < rect.left + AUTO_SCROLL_MARGIN) {
        const speed = AUTO_SCROLL_SPEED * (1 - (x - rect.left) / AUTO_SCROLL_MARGIN)
        setScrollLeftState((prev) => Math.max(0, prev - speed))
      } else if (x > rect.right - AUTO_SCROLL_MARGIN) {
        const speed = AUTO_SCROLL_SPEED * (1 - (rect.right - x) / AUTO_SCROLL_MARGIN)
        setScrollLeftState((prev) => prev + speed)
      }
    }, 16)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current !== null) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])

  // Get snap points
  const getSnapPoints = useCallback((excludeClipId?: string) => {
    const points: { time: number; type: string }[] = []
    // Clip edges
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.id !== excludeClipId) {
          points.push({ time: clip.startTime, type: 'clip' })
          points.push({ time: clip.endTime, type: 'clip' })
        }
      }
    }
    return points
  }, [tracks])

  const snapTime = useCallback((time: number, excludeClipId?: string) => {
    const snapPoints = getSnapPoints(excludeClipId)
    for (const point of snapPoints) {
      if (Math.abs(time - point.time) < SNAP_THRESHOLD / zoom) {
        return point.time
      }
    }
    // Snap to playhead
    if (Math.abs(time - playheadTime) < SNAP_THRESHOLD / zoom) {
      return playheadTime
    }
    // Snap to integer seconds
    const rounded = Math.round(time)
    if (Math.abs(time - rounded) < 0.5 / zoom) {
      return rounded
    }
    return time
  }, [getSnapPoints, playheadTime, zoom])

  // Clip operations
  const updateClip = useCallback((clipId: string, data: Partial<TimelineClip>) => {
    setTracks((prev) => {
      const updated = prev.map((track) => ({
        ...track,
        clips: track.clips.map((c) => (c.id === clipId ? { ...c, ...data } : c)),
      }))
      pushHistory(updated)
      return updated
    })
  }, [pushHistory])

  const removeClip = useCallback((clipId: string) => {
    setTracks((prev) => {
      const updated = prev.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      }))
      pushHistory(updated)
      return updated
    })
    setSelectedClipId((id) => (id === clipId ? null : id))
  }, [pushHistory])

  const mergeClips = useCallback((_clipId1: string, _clipId2: string) => {
    // TODO: implement merge
  }, [])

  const splitClip = useCallback((clipId: string, time: number) => {
    setTracks((prev) => {
      const updated = prev.map((track) => {
        const clip = track.clips.find((c) => c.id === clipId)
        if (!clip || time <= clip.startTime || time >= clip.endTime) return track
        const newClip: TimelineClip = {
          ...clip,
          id: `${clip.id}_split_${Date.now()}`,
          startTime: time,
        }
        return {
          ...track,
          clips: [
            ...track.clips.map((c) => (c.id === clipId ? { ...c, endTime: time } : c)),
            newClip,
          ],
        }
      })
      pushHistory(updated)
      return updated
    })
  }, [pushHistory])

  // Drag/resize handlers
  const handleMouseDown = useCallback(
    (clipId: string, e: React.MouseEvent, type: 'move' | 'resize-left' | 'resize-right') => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedClipId(clipId)
      const clip = tracks.flatMap((t) => t.clips).find((c) => c.id === clipId)
      if (!clip) return
      dragRef.current = {
        type,
        clipId,
        startX: e.clientX,
        initialStartTime: clip.startTime,
        initialEndTime: clip.endTime,
      }
      startAutoScroll()
    },
    [tracks, startAutoScroll],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      lastMouseXRef.current = e.clientX
      if (!dragRef.current) return
      const { type, clipId, startX, initialStartTime, initialEndTime } = dragRef.current
      const dx = e.clientX - startX
      const dt = dx / zoom

      let newStart = initialStartTime
      let newEnd = initialEndTime

      if (type === 'move') {
        newStart = snapTime(initialStartTime + dt, clipId)
        newEnd = newStart + (initialEndTime - initialStartTime)
        if (newStart < 0) { newStart = 0; newEnd = initialEndTime - initialStartTime }
        if (newEnd > duration) { newEnd = duration; newStart = duration - (initialEndTime - initialStartTime) }
      } else if (type === 'resize-left') {
        newStart = snapTime(initialStartTime + dt, clipId)
        if (newStart < 0) newStart = 0
        if (newStart >= newEnd - 0.3) newStart = newEnd - 0.3
      } else if (type === 'resize-right') {
        newEnd = snapTime(initialEndTime + dt, clipId)
        if (newEnd > duration) newEnd = duration
        if (newEnd <= newStart + 0.3) newEnd = newStart + 0.3
      }

      updateClip(clipId, {
        startTime: Math.round(newStart * 100) / 100,
        endTime: Math.round(newEnd * 100) / 100,
      })
    },
    [zoom, duration, updateClip, snapTime],
  )

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
    stopAutoScroll()
  }, [stopAutoScroll])

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => stopAutoScroll()
  }, [stopAutoScroll])

  // Click on timeline background to set playhead
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragRef.current) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left + scrollLeft
      setPlayheadTime(snapTime(x / zoom))
    },
    [scrollLeft, zoom, setPlayheadTime, snapTime],
  )

  // Undo/redo
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const undo = useCallback(() => {
    if (!canUndo) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setTracks(history[newIndex].tracks.map((t) => ({ ...t, clips: t.clips.map((c) => ({ ...c })) })))
  }, [canUndo, historyIndex, history])

  const redo = useCallback(() => {
    if (!canRedo) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setTracks(history[newIndex].tracks.map((t) => ({ ...t, clips: t.clips.map((c) => ({ ...c })) })))
  }, [canRedo, historyIndex, history])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (isMod && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo() }
      if (isMod && e.key === 'Z') { e.preventDefault(); redo() }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) { e.preventDefault(); removeClip(selectedClipId) }
      if (e.key === 's' && !isMod && selectedClipId) { e.preventDefault(); splitClip(selectedClipId, playheadTime) }
      if (e.key === 'ArrowLeft' && !isMod) { e.preventDefault(); setPlayheadTime(playheadTime - 1) }
      if (e.key === 'ArrowRight' && !isMod) { e.preventDefault(); setPlayheadTime(playheadTime + 1) }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoom + 2) }
      if (e.key === '-') { e.preventDefault(); setZoom(zoom - 2) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedClipId, removeClip, splitClip, playheadTime, setPlayheadTime, zoom, setZoom])

  const totalWidth = duration * zoom

  // Track height helpers
  const getTrackHeight = useCallback((trackId: string, defaultHeight: number) => {
    return trackHeights[trackId] ?? defaultHeight
  }, [trackHeights])

  const setTrackHeight = useCallback((trackId: string, height: number) => {
    setTrackHeights((prev) => ({ ...prev, [trackId]: Math.max(24, Math.min(120, height)) }))
  }, [])

  return {
    tracks,
    duration,
    zoom,
    scrollLeft,
    playheadTime,
    selectedClipId,
    isLoading,
    totalWidth,
    containerRef,
    wheelAreaRef,
    setZoom,
    setScrollLeft,
    setPlayheadTime,
    setSelectedClipId,
    updateClip,
    removeClip,
    splitClip,
    mergeClips,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTimelineClick,
    handleWheel,
    handleNativeWheel,
    undo,
    redo,
    canUndo,
    canRedo,
    getTrackHeight,
    setTrackHeight,
    DEFAULT_TRACK_HEIGHT,
  }
}
