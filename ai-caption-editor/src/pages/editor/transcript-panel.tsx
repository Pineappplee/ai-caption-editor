import { useRef, useCallback, useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useEditorStore } from '@/stores/editor-store'
import { useTranscriptStore } from '@/stores/transcript-store'
import { TranscriptToolbar, TranscriptLineRow, useTranscriptSync } from './transcript'

const LINE_HEIGHT = 48
const OVERSCAN = 10

export function TranscriptPanel() {
  const { id } = useParams<{ id: string }>()
  const currentTime = useEditorStore((s) => s.currentTime)
  const playbackState = useEditorStore((s) => s.playbackState)

  const lines = useTranscriptStore((s) => s.lines)
  const activeFilter = useTranscriptStore((s) => s.activeFilter)
  const selectedLineIds = useTranscriptStore((s) => s.selectedLineIds)
  const currentLineId = useTranscriptStore((s) => s.currentLineId)
  const searchQuery = useTranscriptStore((s) => s.searchQuery)
  const isLoaded = useTranscriptStore((s) => s.isLoaded)
  const loadLines = useTranscriptStore((s) => s.loadLines)

  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const { handleScroll, autoScroll } = useTranscriptSync(containerRef)

  useEffect(() => {
    if (id) loadLines(id)
  }, [id, loadLines])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const filteredLines = useMemo(() => {
    return lines.filter((line) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'high-confidence') return line.confidence >= 0.95
      if (activeFilter === 'low-confidence') return line.confidence < 0.95
      return line.confidence < 0.9
    })
  }, [lines, activeFilter])

  const totalHeight = filteredLines.length * LINE_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(filteredLines.length, Math.ceil((scrollTop + containerHeight) / LINE_HEIGHT) + OVERSCAN)
  const visibleLines = filteredLines.slice(startIndex, endIndex)

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
    handleScroll()
  }, [handleScroll])

  const keyboardHandler = useCallback((e: React.KeyboardEvent) => {
    const store = useTranscriptStore.getState()
    if (e.key === 'ArrowDown') { e.preventDefault(); store.navigateNext() }
    if (e.key === 'ArrowUp') { e.preventDefault(); store.navigatePrev() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') { e.preventDefault(); store.selectAll() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') { e.preventDefault(); store.copySelected() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'x') { e.preventDefault(); store.cutSelected() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') { e.preventDefault(); store.pasteLines(store.currentLineId ? store.lines.findIndex((l) => l.id === store.currentLineId) + 1 : 0) }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); store.deleteSelected() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); store.toggleSearch() }
    if (e.key === 'Escape') { e.preventDefault(); store.clearSelection(); store.toggleSearch(); }
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-900/30">
        <div className="size-5 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-zinc-900/30">
      <TranscriptToolbar />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto outline-none"
        onScroll={onScroll}
        onKeyDown={keyboardHandler}
        tabIndex={0}
      >
        <div className="relative" style={{ height: totalHeight }}>
          {visibleLines.map((line) => {
            const isActive = currentTime >= line.startTime && currentTime <= line.endTime
            const isSelected = selectedLineIds.has(line.id)

            return (
              <div
                key={line.id}
                className="absolute left-0 right-0"
                style={{
                  top: line.index * LINE_HEIGHT,
                  height: LINE_HEIGHT,
                }}
              >
                <TranscriptLineRow
                  line={line}
                  isActive={isActive || currentLineId === line.id}
                  isSelected={isSelected}
                  searchQuery={searchQuery}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-1">
        <span className="text-[9px] text-zinc-500">
          {filteredLines.length} lines
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => useTranscriptStore.getState().setAutoScroll(!autoScroll)}
            className={`text-[9px] font-medium transition-colors ${
              autoScroll ? 'text-blue-400' : 'text-zinc-500'
            }`}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>
          <span className="text-[9px] text-zinc-600">|</span>
          <span className="text-[9px] text-zinc-500 tabular-nums">
            {playbackState === 'playing' ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>
    </div>
  )
}
