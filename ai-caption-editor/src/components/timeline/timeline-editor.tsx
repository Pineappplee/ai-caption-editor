import { ZoomIn, ZoomOut, Undo2, Redo2, ScissorsLineDashed, Merge } from 'lucide-react'
import { useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useTimeline } from '@/hooks/useTimeline'
import type { TimelineClip } from '@/services/timeline'

const LABEL_WIDTH = 80
const RULER_HEIGHT = 22

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatTimeMs(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

interface ZoomSliderProps {
  zoom: number
  onZoomChange: (z: number) => void
}

function ZoomSlider({ zoom, onZoomChange }: ZoomSliderProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onZoomChange(zoom - 2)}
        className="flex size-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="size-3.5" />
      </button>
      <input
        type="range"
        min={1}
        max={120}
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-500"
      />
      <button
        type="button"
        onClick={() => onZoomChange(zoom + 2)}
        className="flex size-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="size-3.5" />
      </button>
      <span className="text-[10px] text-zinc-500 min-w-[3ch] tabular-nums">{zoom}x</span>
    </div>
  )
}

interface TimeRulerProps {
  duration: number
  zoom: number
  scrollLeft: number
}

function TimeRuler({ duration, zoom, scrollLeft }: TimeRulerProps) {
  const markers: { time: number; major: boolean }[] = []
  const step = zoom > 30 ? 1 : zoom > 15 ? 2 : zoom > 8 ? 5 : 15
  for (let t = 0; t <= duration; t += step) {
    markers.push({ time: t, major: t % (step * 4) === 0 })
  }

  return (
    <div className="relative h-[22px] shrink-0 border-t border-zinc-800 bg-zinc-900/40">
      <div className="absolute inset-0" style={{ left: -scrollLeft, width: duration * zoom }}>
        {markers.map(({ time, major }) => (
          <div
            key={time}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: time * zoom }}
          >
            <div className={`${major ? 'h-2.5 w-px bg-zinc-600' : 'h-1.5 w-px bg-zinc-700'}`} />
            {major && (
              <span className="mt-0.5 text-[9px] text-zinc-500 font-mono select-none">
                {formatTime(time)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface PlayheadLineProps {
  time: number
  zoom: number
  scrollLeft: number
  totalHeight: number
  onDrag: (clientX: number) => void
}

function PlayheadLine({ time, zoom, scrollLeft, totalHeight, onDrag }: PlayheadLineProps) {
  const left = time * zoom - scrollLeft
  const draggingRef = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = true
    onDrag(e.clientX)
    const onMove = (ev: MouseEvent) => {
      if (draggingRef.current) onDrag(ev.clientX)
    }
    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [onDrag])

  return (
    <div
      className="absolute top-0 z-20"
      style={{ left, height: totalHeight, width: 20, marginLeft: -10 }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-blue-500 shadow-lg shadow-blue-500/70 pointer-events-none"
      />
      <div className="absolute left-1/2 -top-0.5 size-2.5 -translate-x-1/2 rotate-45 border border-blue-500 bg-blue-500 pointer-events-none" />
    </div>
  )
}

function ClipBlock({
  clip,
  zoom,
  isSelected,
  isCaptionsTrack,
  trackHeight,
  onMouseDown,
  onClick,
}: {
  clip: TimelineClip
  zoom: number
  isSelected: boolean
  isCaptionsTrack: boolean
  trackHeight: number
  onMouseDown: (clipId: string, e: React.MouseEvent, type: 'move' | 'resize-left' | 'resize-right') => void
  onClick: (clipId: string) => void
}) {
  const left = clip.startTime * zoom
  const width = (clip.endTime - clip.startTime) * zoom

  return (
    <div
      className={`absolute rounded select-none group ${
        isCaptionsTrack
          ? isSelected
            ? 'bg-blue-500/50 border border-blue-400 z-10'
            : 'bg-blue-600/25 border border-blue-500/30 hover:bg-blue-500/35'
          : isSelected
            ? 'bg-indigo-500/50 border border-indigo-400 z-10'
            : 'bg-zinc-700/40 border border-zinc-600/40 hover:bg-zinc-700/60'
      }`}
      style={{ left, width: Math.max(width, 4), top: 2, height: trackHeight - 4 }}
      onClick={(e) => { e.stopPropagation(); onClick(clip.id) }}
    >
      {width > 30 && (
        <span className="px-1.5 text-[10px] text-zinc-200 truncate block leading-[28px]">
          {clip.text || clip.label}
        </span>
      )}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400/30 rounded-l"
        onMouseDown={(e) => onMouseDown(clip.id, e, 'resize-left')}
      />
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400/30 rounded-r"
        onMouseDown={(e) => onMouseDown(clip.id, e, 'resize-right')}
      />
    </div>
  )
}

function TrackHeader({ label, color, onResize, trackHeight }: {
  label: string
  color: string
  onResize?: (dy: number) => void
  trackHeight: number
}) {
  const resizeRef = useRef({ startY: 0, startHeight: 0 })

  return (
    <div
      className={`flex w-[80px] shrink-0 flex-col border-b border-r border-zinc-800 ${color} relative`}
      style={{ height: trackHeight }}
    >
      <div className="flex items-center gap-1.5 px-2 flex-1 min-h-0">
        <div className="size-1.5 rounded-full bg-current opacity-40 shrink-0" />
        <span className="truncate text-[10px] font-medium text-zinc-400">{label}</span>
      </div>
      {onResize && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-500/30 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault()
            resizeRef.current = { startY: e.clientY, startHeight: trackHeight }
            const onMove = (ev: MouseEvent) => {
              onResize(ev.clientY - resizeRef.current.startY)
            }
            const onUp = () => {
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        />
      )}
    </div>
  )
}

function TrackRow({
  trackType,
  label,
  clips,
  zoom,
  scrollLeft,
  duration,
  selectedClipId,
  trackHeight,
  onMouseDown,
  onClipClick,
  onTrackClick,
  onResizeTrack,
}: {
  trackType: string
  label: string
  clips: TimelineClip[]
  zoom: number
  scrollLeft: number
  duration: number
  selectedClipId: string | null
  trackHeight: number
  onMouseDown: (clipId: string, e: React.MouseEvent, type: 'move' | 'resize-left' | 'resize-right') => void
  onClipClick: (clipId: string) => void
  onTrackClick: (e: React.MouseEvent) => void
  onResizeTrack?: (dy: number) => void
}) {
  const isCaptions = trackType === 'caption'

  if (trackType === 'audio') {
    const audioClip = clips[0]
    return (
      <div className="flex" style={{ height: trackHeight }}>
        <TrackHeader label={label} color="bg-emerald-600/20" trackHeight={trackHeight} />
        <div
          className="relative flex-1 overflow-hidden border-b border-zinc-800/60 bg-zinc-900/20 cursor-pointer"
          onClick={onTrackClick}
        >
          <div className="absolute inset-0" style={{ left: -scrollLeft, width: duration * zoom }}>
            {audioClip?.waveformData && (
              <div
                className="absolute inset-0 flex items-center px-1 gap-[1px]"
                style={{ left: audioClip.startTime * zoom, width: (audioClip.endTime - audioClip.startTime) * zoom }}
              >
                {audioClip.waveformData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/30 rounded-full"
                    style={{ height: `${Math.max(val * 100, 8)}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex" style={{ height: trackHeight }}>
      <TrackHeader
        label={label}
        color={trackType === 'video' ? 'bg-indigo-600/20' : 'bg-blue-600/20'}
        trackHeight={trackHeight}
        onResize={onResizeTrack}
      />
      <div
        className="relative flex-1 overflow-hidden border-b border-zinc-800/60 bg-zinc-900/10 cursor-pointer"
        onClick={onTrackClick}
      >
        <div className="absolute inset-0" style={{ left: -scrollLeft, width: duration * zoom }}>
          {clips.map((clip) => (
            <ClipBlock
              key={clip.id}
              clip={clip}
              zoom={zoom}
              isSelected={selectedClipId === clip.id}
              isCaptionsTrack={isCaptions}
              trackHeight={trackHeight}
              onMouseDown={onMouseDown}
              onClick={onClipClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TimelineEditor() {
  const projectId = useEditorStore((s) => s.project?.id)
  const editorCurrentTime = useEditorStore((s) => s.currentTime)
  const setEditorCurrentTime = useEditorStore((s) => s.setCurrentTime)

  const {
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
    splitClip,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTimelineClick,
    handleNativeWheel,
    undo,
    redo,
    canUndo,
    canRedo,
    getTrackHeight,
    setTrackHeight,
    DEFAULT_TRACK_HEIGHT,
  } = useTimeline(projectId)

  const internalUpdate = useRef(false)

  useEffect(() => {
    if (internalUpdate.current) { internalUpdate.current = false; return }
    if (Math.abs(playheadTime - editorCurrentTime) > 0.005) {
      internalUpdate.current = true
      setEditorCurrentTime(playheadTime)
    }
  }, [playheadTime, setEditorCurrentTime, editorCurrentTime])

  useEffect(() => {
    if (internalUpdate.current) { internalUpdate.current = false; return }
    if (Math.abs(editorCurrentTime - playheadTime) > 0.005) {
      internalUpdate.current = true
      setPlayheadTime(editorCurrentTime)
    }
  }, [editorCurrentTime, setPlayheadTime, playheadTime])

  useEffect(() => {
    const el = wheelAreaRef.current
    if (!el || isLoading) return
    el.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleNativeWheel)
  }, [handleNativeWheel, isLoading, wheelAreaRef])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft)
  }, [setScrollLeft])

  const handleSplit = useCallback(() => {
    if (selectedClipId) splitClip(selectedClipId, playheadTime)
  }, [selectedClipId, splitClip, playheadTime])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-900/60">
        <div className="size-5 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
      </div>
    )
  }

  const trackHeightsList = tracks.map((t) => getTrackHeight(t.id, DEFAULT_TRACK_HEIGHT))
  const totalTrackHeight = trackHeightsList.reduce((a, b) => a + b, 0)

  return (
    <div
      className="flex h-full flex-col bg-zinc-900/60 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <ZoomSlider zoom={zoom} onZoomChange={setZoom} />
          <div className="h-4 w-px bg-zinc-800" />
          <button
            type="button"
            onClick={handleSplit}
            disabled={!selectedClipId}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Split at playhead (S)"
          >
            <ScissorsLineDashed className="size-3" />
            Split
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Merge"
          >
            <Merge className="size-3" />
            Merge
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
            {formatTimeMs(playheadTime)}
          </span>
          <div className="h-4 w-px bg-zinc-800" />
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="flex size-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="flex size-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks + Ruler */}
      <div ref={wheelAreaRef} className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="overflow-auto"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ width: Math.max(totalWidth + LABEL_WIDTH, 600) }}>
            {/* Ruler */}
            <div className="flex sticky top-0 z-10">
              <div className="w-[80px] shrink-0 border-b border-r border-zinc-800 bg-zinc-900/60" />
              <div className="flex-1 overflow-hidden">
                <TimeRuler duration={duration} zoom={zoom} scrollLeft={scrollLeft} />
              </div>
            </div>

            {/* Tracks */}
            <div onClick={handleTimelineClick}>
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  trackType={track.type}
                  label={track.label}
                  clips={track.clips}
                  zoom={zoom}
                  scrollLeft={scrollLeft}
                  duration={duration}
                  selectedClipId={selectedClipId}
                  trackHeight={trackHeightsList[i]}
                  onMouseDown={handleMouseDown}
                  onClipClick={setSelectedClipId}
                  onTrackClick={handleTimelineClick}
                  onResizeTrack={(dy) => setTrackHeight(track.id, trackHeightsList[i] + dy)}
                />
              ))}
            </div>

            {/* Playhead line */}
            <PlayheadLine
              time={playheadTime}
              zoom={zoom}
              scrollLeft={scrollLeft}
              totalHeight={RULER_HEIGHT + totalTrackHeight + 1}
              onDrag={(clientX) => {
                const container = containerRef.current
                if (!container) return
                const rect = container.getBoundingClientRect()
                const x = clientX - rect.left + scrollLeft
                setPlayheadTime(Math.max(0, Math.min(x / zoom, duration)))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
