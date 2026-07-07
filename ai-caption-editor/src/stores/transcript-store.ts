import { create } from 'zustand'
import { services } from '@/services'
import type {
  TranscriptLine, LineFilter, SearchMatch,
} from '@/services/transcript'

const service = services.transcript

export interface TranscriptStoreState {
  lines: TranscriptLine[]
  searchQuery: string
  replaceQuery: string
  activeFilter: LineFilter
  selectedLineIds: Set<string>
  selectedWordIds: Set<string>
  currentLineId: string | null
  currentWordId: string | null
  isSearchOpen: boolean
  isReplaceOpen: boolean
  autoScroll: boolean
  language: string
  searchResults: SearchMatch[]
  searchIndex: number
  clipboardLines: TranscriptLine[]
  isLoaded: boolean

  loadLines: (projectId: string) => Promise<void>
  setSearchQuery: (q: string) => void
  setReplaceQuery: (q: string) => void
  setActiveFilter: (f: LineFilter) => void
  toggleSearch: () => void
  toggleReplace: () => void
  setAutoScroll: (v: boolean) => void
  setLanguage: (lang: string) => void

  seekToTime: (time: number) => void
  setCurrentByTime: (time: number) => void

  selectLine: (id: string, shift?: boolean, ctrl?: boolean) => void
  selectWord: (lineId: string, wordId: string, shift?: boolean, ctrl?: boolean) => void
  clearSelection: () => void
  selectAll: () => void

  inlineEditWord: (lineId: string, wordId: string, text: string) => Promise<void>
  inlineEditLine: (lineId: string, text: string) => Promise<void>

  splitLine: (lineId: string, time: number) => Promise<void>
  mergeSelected: () => Promise<void>
  duplicateSelected: () => Promise<void>
  deleteSelected: () => Promise<void>
  copySelected: () => void
  cutSelected: () => void
  pasteLines: (targetIndex: number) => Promise<void>

  reorderLine: (lineId: string, newIndex: number) => Promise<void>

  search: () => Promise<void>
  nextMatch: () => void
  prevMatch: () => void
  replaceCurrent: () => Promise<void>
  replaceAll: () => Promise<void>

  navigateNext: () => void
  navigatePrev: () => void
}

export const useTranscriptStore = create<TranscriptStoreState>((set, get) => ({
  lines: [],
  searchQuery: '',
  replaceQuery: '',
  activeFilter: 'all',
  selectedLineIds: new Set(),
  selectedWordIds: new Set(),
  currentLineId: null,
  currentWordId: null,
  isSearchOpen: false,
  isReplaceOpen: false,
  autoScroll: true,
  language: 'en',
  searchResults: [],
  searchIndex: 0,
  clipboardLines: [],
  isLoaded: false,

  loadLines: async (projectId: string) => {
    const lines = await service.getLines(projectId)
    set({ lines, isLoaded: true })
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setReplaceQuery: (replaceQuery) => set({ replaceQuery }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen, isReplaceOpen: false })),
  toggleReplace: () => set((s) => ({ isReplaceOpen: !s.isReplaceOpen, isSearchOpen: true })),
  setAutoScroll: (autoScroll) => set({ autoScroll }),
  setLanguage: (language) => set({ language }),

  seekToTime: (time: number) => {
    set({ currentWordId: null, currentLineId: null })
    setByTime(time, set)
  },

  setCurrentByTime: (time: number) => {
    setByTime(time, set)
  },

  selectLine: (id: string, shift = false, ctrl = false) => {
    const s = get()
    if (shift && s.currentLineId) {
      const ids = s.lines.map((l) => l.id)
      const from = ids.indexOf(s.currentLineId)
      const to = ids.indexOf(id)
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from]
        set({ selectedLineIds: new Set(ids.slice(start, end + 1)), currentLineId: id })
        return
      }
    }
    if (ctrl) {
      const next = new Set(s.selectedLineIds)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      set({ selectedLineIds: next, currentLineId: id })
    } else {
      set({ selectedLineIds: new Set([id]), selectedWordIds: new Set(), currentLineId: id })
    }
  },

  selectWord: (lineId: string, wordId: string, shift = false, ctrl = false) => {
    const s = get()
    const line = s.lines.find((l) => l.id === lineId)
    if (!line) return
    if (shift && s.currentWordId && s.currentLineId === lineId) {
      const wi = line.words.map((w) => w.id)
      const from = wi.indexOf(s.currentWordId)
      const to = wi.indexOf(wordId)
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from]
        set({ selectedWordIds: new Set(wi.slice(start, end + 1)), currentWordId: wordId, currentLineId: lineId })
        return
      }
    }
    if (ctrl) {
      const next = new Set(s.selectedWordIds)
      if (next.has(wordId)) { next.delete(wordId) } else { next.add(wordId) }
      set({ selectedWordIds: next, currentWordId: wordId, currentLineId: lineId })
    } else {
      set({ selectedWordIds: new Set([wordId]), selectedLineIds: new Set([lineId]), currentWordId: wordId, currentLineId: lineId })
    }
  },

  clearSelection: () => set({ selectedLineIds: new Set(), selectedWordIds: new Set(), currentLineId: null, currentWordId: null }),

  selectAll: () => {
    const { lines } = get()
    set({ selectedLineIds: new Set(lines.map((l) => l.id)) })
  },

  inlineEditWord: async (lineId: string, wordId: string, text: string) => {
    await service.updateWord(lineId, wordId, text)
    set((s) => ({
      lines: s.lines.map((line) => {
        if (line.id !== lineId) return line
        const words = line.words.map((w) => (w.id === wordId ? { ...w, text } : w))
        return { ...line, words, text: words.map((w) => w.text).join(' ') }
      }),
    }))
  },

  inlineEditLine: async (lineId: string, text: string) => {
    await service.updateLine(lineId, text)
    set((s) => ({
      lines: s.lines.map((line) => (line.id === lineId ? { ...line, text } : line)),
    }))
  },

  splitLine: async (lineId: string, time: number) => {
    const result = await service.splitLine(lineId, time)
    set((s) => {
      const idx = s.lines.findIndex((l) => l.id === lineId)
      if (idx === -1) return s
      const lines = [...s.lines]
      lines.splice(idx, 1, ...result)
      return { lines: lines.map((l, i) => ({ ...l, index: i })) }
    })
  },

  mergeSelected: async () => {
    const { selectedLineIds, lines } = get()
    const ids = Array.from(selectedLineIds).sort((a, b) => {
      const ai = lines.findIndex((l) => l.id === a)
      const bi = lines.findIndex((l) => l.id === b)
      return ai - bi
    })
    if (ids.length < 2) return
    for (let i = 0; i < ids.length - 1; i++) {
      await service.mergeLines(ids[i], ids[i + 1])
    }
    const fresh = await service.getLines('')
    set({ lines: fresh, selectedLineIds: new Set() })
  },

  duplicateSelected: async () => {
    const { selectedLineIds } = get()
    for (const id of selectedLineIds) {
      await service.duplicateLine(id)
    }
    const fresh = await service.getLines('')
    set({ lines: fresh, selectedLineIds: new Set() })
  },

  deleteSelected: async () => {
    const { selectedLineIds } = get()
    await service.deleteLines(Array.from(selectedLineIds))
    const fresh = await service.getLines('')
    set({ lines: fresh, selectedLineIds: new Set() })
  },

  copySelected: () => {
    const { selectedLineIds, lines } = get()
    const copied = lines.filter((l) => selectedLineIds.has(l.id))
    set({ clipboardLines: copied })
  },

  cutSelected: () => {
    const { selectedLineIds, lines } = get()
    const copied = lines.filter((l) => selectedLineIds.has(l.id))
    set({ clipboardLines: copied })
    get().deleteSelected()
  },

  pasteLines: async (targetIndex: number) => {
    const { clipboardLines } = get()
    if (clipboardLines.length === 0) return
    const fresh = await service.getLines('')
    const lines = [...fresh]
    const newLines = clipboardLines.map((l, i) => ({
      ...l,
      id: `${l.id}_pasted_${Date.now()}_${i}`,
    }))
    lines.splice(Math.min(targetIndex, lines.length), 0, ...newLines)
    set({ lines: lines.map((l, i) => ({ ...l, index: i })) })
  },

  reorderLine: async (lineId: string, newIndex: number) => {
    const result = await service.reorderLine(lineId, newIndex)
    set({ lines: result })
  },

  search: async () => {
    const { searchQuery } = get()
    if (!searchQuery) {
      set({ searchResults: [], searchIndex: 0 })
      return
    }
    const results = await service.search(searchQuery)
    set({ searchResults: results, searchIndex: 0 })
  },

  nextMatch: () => set((s) => ({
    searchIndex: s.searchResults.length > 0
      ? (s.searchIndex + 1) % s.searchResults.length
      : 0,
  })),

  prevMatch: () => set((s) => ({
    searchIndex: s.searchResults.length > 0
      ? (s.searchIndex - 1 + s.searchResults.length) % s.searchResults.length
      : 0,
  })),

  replaceCurrent: async () => {
    const { searchResults, searchIndex, replaceQuery } = get()
    if (searchResults.length === 0) return
    const match = searchResults[searchIndex]
    await service.replace(match.lineId, match.wordId, replaceQuery)
    await get().search()
  },

  replaceAll: async () => {
    const { searchQuery, replaceQuery } = get()
    await service.replaceAll(searchQuery, replaceQuery)
    const fresh = await service.getLines('')
    set({ lines: fresh, searchResults: [] })
  },

  navigateNext: () => {
    const { lines, currentLineId } = get()
    const idx = lines.findIndex((l) => l.id === currentLineId)
    if (idx < lines.length - 1) {
      const next = lines[idx + 1]
      set({ currentLineId: next.id, selectedLineIds: new Set([next.id]) })
    }
  },

  navigatePrev: () => {
    const { lines, currentLineId } = get()
    const idx = lines.findIndex((l) => l.id === currentLineId)
    if (idx > 0) {
      const prev = lines[idx - 1]
      set({ currentLineId: prev.id, selectedLineIds: new Set([prev.id]) })
    }
  },
}))

function setByTime(time: number, set: any) {
  const s = useTranscriptStore.getState()
  for (const line of s.lines) {
    if (time >= line.startTime && time <= line.endTime) {
      let currentWordId: string | null = null
      for (const word of line.words) {
        if (time >= word.startTime && time < word.endTime) {
          currentWordId = word.id
          break
        }
      }
      set({ currentLineId: line.id, currentWordId, selectedLineIds: new Set([line.id]) })
      return
    }
  }
}
