export interface TranscriptWord {
  id: string
  text: string
  startTime: number
  endTime: number
  confidence: number
}

export interface TranscriptLine {
  id: string
  index: number
  startTime: number
  endTime: number
  text: string
  words: TranscriptWord[]
  speaker: string
  confidence: number
  language: string
}

export type LineFilter = 'all' | 'high-confidence' | 'low-confidence' | 'needs-review'

export interface TranscriptState {
  lines: TranscriptLine[]
  searchQuery: string
  replaceQuery: string
  activeFilter: LineFilter
  selectedLineIds: Set<string>
  selectedWordIds: Set<string>
  currentWordId: string | null
  currentLineId: string | null
  isSearchOpen: boolean
  isReplaceOpen: boolean
  autoScroll: boolean
  language: string
}

export interface SearchMatch {
  lineId: string
  wordIndex: number
  wordId: string
  text: string
  startTime: number
}
