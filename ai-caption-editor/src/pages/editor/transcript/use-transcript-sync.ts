import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useTranscriptStore } from '@/stores/transcript-store'

export function useTranscriptSync(containerRef: React.RefObject<HTMLDivElement | null>) {
  const userScrolled = useRef(false)
  const lastAutoScrollId = useRef<string | null>(null)
  const scrollTimeout = useRef<number | undefined>(undefined)

  const currentTime = useEditorStore((s) => s.currentTime)
  const playbackState = useEditorStore((s) => s.playbackState)

  const autoScroll = useTranscriptStore((s) => s.autoScroll)
  const setAutoScroll = useTranscriptStore((s) => s.setAutoScroll)
  const setCurrentByTime = useTranscriptStore((s) => s.setCurrentByTime)

  const handleScroll = useCallback(() => {
    userScrolled.current = true
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = window.setTimeout(() => {
      userScrolled.current = false
    }, 3000)
  }, [])

  useEffect(() => {
    if (!autoScroll) return
    if (userScrolled.current) return
    const container = containerRef.current
    if (!container) return

    const state = useTranscriptStore.getState()
    const line = state.lines.find((l) => l.id === state.currentLineId)
    if (!line) return

    if (lastAutoScrollId.current === line.id) return
    lastAutoScrollId.current = line.id

    const el = container.querySelector(`[data-line-id="${line.id}"]`) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime, autoScroll, containerRef])

  useEffect(() => {
    if (playbackState === 'playing') {
      userScrolled.current = false
    }
  }, [playbackState])

  useEffect(() => {
    setCurrentByTime(currentTime)
  }, [currentTime, setCurrentByTime])

  return { handleScroll, setAutoScroll, autoScroll }
}
