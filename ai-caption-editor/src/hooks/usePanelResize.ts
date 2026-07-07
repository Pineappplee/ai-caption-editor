import { useState, useCallback, useRef, useEffect } from 'react'

interface PanelSizes {
  rightPanelWidth: number
  timelineHeight: number
}

const MIN_RIGHT_PANEL = 200
const MAX_RIGHT_PANEL = 500
const DEFAULT_RIGHT_PANEL = 288

const MIN_TIMELINE = 80
const DEFAULT_TIMELINE = 160

export function usePanelResize() {
  const [sizes, setSizes] = useState<PanelSizes>(() => {
    try {
      const saved = sessionStorage.getItem('editor-panel-sizes')
      if (saved) return JSON.parse(saved)
    } catch {}
    return { rightPanelWidth: DEFAULT_RIGHT_PANEL, timelineHeight: DEFAULT_TIMELINE }
  })

  useEffect(() => {
    sessionStorage.setItem('editor-panel-sizes', JSON.stringify(sizes))
  }, [sizes])

  const dragging = useRef<{ type: 'right' | 'timeline'; startX: number; startY: number; initialSize: number } | null>(null)

  const startResizeRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = { type: 'right', startX: e.clientX, startY: 0, initialSize: sizes.rightPanelWidth }
  }, [sizes.rightPanelWidth])

  const startResizeTimeline = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = { type: 'timeline', startX: 0, startY: e.clientY, initialSize: sizes.timelineHeight }
  }, [sizes.timelineHeight])

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    if (dragging.current.type === 'right') {
      const dx = dragging.current.startX - e.clientX
      const newWidth = Math.max(MIN_RIGHT_PANEL, Math.min(MAX_RIGHT_PANEL, dragging.current.initialSize + dx))
      setSizes((prev) => ({ ...prev, rightPanelWidth: newWidth }))
    } else if (dragging.current.type === 'timeline') {
      const dy = e.clientY - dragging.current.startY
      const viewportHeight = window.innerHeight
      const available = viewportHeight * 0.5
      const newHeight = Math.max(MIN_TIMELINE, Math.min(available, dragging.current.initialSize + dy))
      setSizes((prev) => ({ ...prev, timelineHeight: newHeight }))
    }
  }, [])

  const handleResizeMouseUp = useCallback(() => {
    dragging.current = null
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleResizeMouseMove)
    window.addEventListener('mouseup', handleResizeMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove)
      window.removeEventListener('mouseup', handleResizeMouseUp)
    }
  }, [handleResizeMouseMove, handleResizeMouseUp])

  const [collapsed, setCollapsed] = useState({ rightPanel: false, timeline: false })

  const toggleRightPanel = useCallback(() => {
    setCollapsed((prev) => ({ ...prev, rightPanel: !prev.rightPanel }))
  }, [])

  const toggleTimeline = useCallback(() => {
    setCollapsed((prev) => ({ ...prev, timeline: !prev.timeline }))
  }, [])

  return {
    rightPanelWidth: collapsed.rightPanel ? 0 : sizes.rightPanelWidth,
    timelineHeight: collapsed.timeline ? 0 : sizes.timelineHeight,
    isRightCollapsed: collapsed.rightPanel,
    isTimelineCollapsed: collapsed.timeline,
    startResizeRight,
    startResizeTimeline,
    toggleRightPanel,
    toggleTimeline,
    dragging,
  }
}
