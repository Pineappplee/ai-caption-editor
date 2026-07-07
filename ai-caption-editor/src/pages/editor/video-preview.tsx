import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'

export function VideoPreview() {
  const currentTime = useEditorStore((s) => s.currentTime)
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime)
  const setPlaybackState = useEditorStore((s) => s.setPlaybackState)
  const playbackState = useEditorStore((s) => s.playbackState)
  const volume = useEditorStore((s) => s.volume)
  const isMuted = useEditorStore((s) => s.isMuted)
  const captions = useEditorStore((s) => s.captions)
  const captionStyle = useEditorStore((s) => s.captionStyle)
  const project = useEditorStore((s) => s.project)

  const [isFit, setIsFit] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const internalSeek = useRef(false)

  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  const isFitRef = useRef(isFit)
  zoomRef.current = zoom
  panRef.current = pan
  isFitRef.current = isFit

  const activeCaption = captions.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime,
  )

  useLayoutEffect(() => {
    if (!isFit) return
    const container = containerRef.current
    if (!container) return
    const cw = container.offsetWidth
    const ch = container.offsetHeight
    const contentH = cw * 9 / 16
    const s = Math.min(1, ch / contentH)
    const px = (cw - cw * s) / 2
    const py = (ch - contentH * s) / 2
    setZoom(s)
    setPan({ x: px, y: py })
  }, [isFit])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        const cr = container.getBoundingClientRect()
        const mx = e.clientX - cr.left
        const my = e.clientY - cr.top

        const oldZoom = zoomRef.current
        const delta = -e.deltaY * 0.003
        const newZoom = Math.max(0.25, Math.min(4, oldZoom + delta * oldZoom * 0.5))
        const factor = newZoom / oldZoom

        const newPanX = mx * (1 - factor) + panRef.current.x * factor
        const newPanY = my * (1 - factor) + panRef.current.y * factor

        panRef.current = { x: newPanX, y: newPanY }
        zoomRef.current = newZoom
        setPan({ x: newPanX, y: newPanY })
        setZoom(newZoom)
        setIsFit(false)
        isFitRef.current = false
      }
    }

    container.addEventListener('wheel', handler, { passive: false })
    return () => container.removeEventListener('wheel', handler)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (playbackState === 'playing') {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [playbackState])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (internalSeek.current) { internalSeek.current = false; return }
    if (Math.abs(video.currentTime - currentTime) > 0.05) {
      video.currentTime = currentTime
    }
  }, [currentTime])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const ct = video.currentTime
    setCurrentTime(ct)
  }, [setCurrentTime])

  const handleVideoEnded = useCallback(() => {
    setPlaybackState('stopped')
  }, [setPlaybackState])

  const handleSeeked = useCallback(() => {
    internalSeek.current = true
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFit && zoom === 1) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }, [isFit, zoom, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const toggleFit = useCallback(() => {
    if (isFit) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setIsFit(false)
    } else {
      setIsFit(true)
    }
  }, [isFit])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-black overflow-hidden min-h-0"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: !isFit ? (isPanning.current ? 'grabbing' : 'grab') : 'default' }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="relative flex size-full items-center justify-center rounded-lg bg-zinc-900 overflow-hidden">
          {project?.videoUrl ? (
            <video
              ref={videoRef}
              src={project.videoUrl}
              className="absolute inset-0 size-full object-contain"
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onSeeked={handleSeeked}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600 select-none">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="text-xs font-medium">Video Preview</span>
            </div>
          )}

          {activeCaption && (
            <div
              className="absolute left-0 right-0 mx-auto w-fit max-w-[85%] rounded-lg px-4 py-2 text-center pointer-events-none"
              style={{
                left: `${captionStyle.positionX}%`,
                top: `${captionStyle.positionY}%`,
                translate: captionStyle.position === 'middle' ? '-50% -50%' : '-50% 0',
                fontSize: `${captionStyle.fontSize}px`,
                fontFamily: captionStyle.fontFamily,
                fontWeight: captionStyle.fontWeight,
                color: captionStyle.fontColor,
                opacity: captionStyle.opacity,
                fontStyle: captionStyle.fontStyle,
                textDecoration: captionStyle.textDecoration,
                lineHeight: captionStyle.lineHeight,
                letterSpacing: `${captionStyle.letterSpacing}px`,
                transform: `rotate(${captionStyle.rotation}deg) scale(${captionStyle.scale})`,
                backgroundColor: captionStyle.backgroundColor === 'transparent' ? 'transparent' : captionStyle.backgroundColor,
                textShadow: captionStyle.shadowBlur > 0
                  ? `${captionStyle.shadowOffsetX}px ${captionStyle.shadowOffsetY}px ${captionStyle.shadowBlur}px ${captionStyle.shadowColor}`
                  : 'none',
                WebkitTextStroke: captionStyle.strokeWidth > 0
                  ? `${captionStyle.strokeWidth}px ${captionStyle.strokeColor}`
                  : 'none',
              }}
            >
              {activeCaption.text}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-zinc-700/50 bg-zinc-900/80 px-2 py-1 z-10">
        <button
          type="button"
          onClick={() => { const z = Math.max(0.25, zoom - 0.25); setZoom(z); setPan({ x: 0, y: 0 }); setIsFit(false) }}
          className="flex size-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={toggleFit}
          className="min-w-[44px] rounded px-1.5 py-1 text-[10px] font-medium text-zinc-300 hover:bg-zinc-800 transition-colors tabular-nums"
          title="Toggle Fit / 100%"
        >
          {isFit ? 'Fit' : `${Math.round(zoom * 100)}%`}
        </button>
        <button
          type="button"
          onClick={() => { const z = Math.min(4, zoom + 0.25); setZoom(z); setPan({ x: 0, y: 0 }); setIsFit(false) }}
          className="flex size-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
