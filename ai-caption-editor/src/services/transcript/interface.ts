import type { TranscriptLine, SearchMatch } from './types'

export interface ITranscriptService {
  getLines(projectId: string): Promise<TranscriptLine[]>
  updateWord(lineId: string, wordId: string, text: string): Promise<void>
  updateLine(lineId: string, text: string): Promise<void>
  splitLine(lineId: string, splitTime: number): Promise<TranscriptLine[]>
  mergeLines(lineId1: string, lineId2: string): Promise<TranscriptLine>
  deleteLines(lineIds: string[]): Promise<void>
  duplicateLine(lineId: string): Promise<TranscriptLine>
  reorderLine(lineId: string, newIndex: number): Promise<TranscriptLine[]>
  search(query: string): Promise<SearchMatch[]>
  replace(lineId: string, wordId: string, newText: string): Promise<void>
  replaceAll(query: string, replacement: string): Promise<number>
}
