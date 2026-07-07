import { apiClient } from '@/lib/api-client'
import type { ITranscriptService } from './interface'
import type { TranscriptLine, SearchMatch } from './types'

function wordsFromText(
  text: string,
  lineStart: number,
  lineEnd: number,
  baseConfidence: number,
): { id: string; text: string; startTime: number; endTime: number; confidence: number }[] {
  const parts = text.split(/\s+/)
  const duration = lineEnd - lineStart
  const wordDuration = duration / parts.length
  return parts.map((word, i) => ({
    id: `w_${lineStart}_${i}`,
    text: word,
    startTime: lineStart + i * wordDuration,
    endTime: lineStart + (i + 1) * wordDuration,
    confidence: Math.max(0.5, baseConfidence - Math.random() * 0.15),
  }))
}

export class HttpTranscriptService implements ITranscriptService {
  private activeProjectId: string | null = null
  private linesCache: TranscriptLine[] = []
  private autosaveTimeout: any = null

  private mapSegment(seg: any): TranscriptLine {
    const startTime = seg.startTime || 0
    const endTime = seg.endTime || 0
    const confidence = seg.confidence || 0.95
    return {
      id: seg.id.toString(),
      index: seg.orderIndex || 0,
      startTime,
      endTime,
      text: seg.text,
      words: wordsFromText(seg.text, startTime, endTime, confidence),
      speaker: seg.speaker || 'Host',
      confidence,
      language: 'en',
    }
  }

  private debounceAutosave() {
    if (!this.activeProjectId) return
    if (this.autosaveTimeout) clearTimeout(this.autosaveTimeout)
    
    this.autosaveTimeout = setTimeout(async () => {
      try {
        await apiClient.post(`/api/v1/projects/${this.activeProjectId}/autosave`, {
          message: 'Auto-saved transcript edits',
        })
      } catch (err) {
        console.warn('Autosave snapshot failed', err)
      }
    }, 2000)
  }

  async getLines(projectId: string): Promise<TranscriptLine[]> {
    this.activeProjectId = projectId
    try {
      const data = await apiClient.get<any>(`/api/v1/projects/${projectId}/transcript`)
      const segments = Array.isArray(data.segments) ? data.segments : []
      // Sort by orderIndex
      segments.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
      
      this.linesCache = segments.map((seg: any) => this.mapSegment(seg))
      return [...this.linesCache]
    } catch (err: any) {
      if (err.status === 404) {
        // Transcript does not exist yet
        this.linesCache = []
        return []
      }
      console.warn('Failed to load transcript lines', err)
      return []
    }
  }

  async updateWord(lineId: string, wordId: string, text: string): Promise<void> {
    if (!this.activeProjectId) throw new Error('No active project loaded')
    
    const lineIndex = this.linesCache.findIndex((l) => l.id === lineId)
    if (lineIndex === -1) throw new Error('Line not found')

    const line = this.linesCache[lineIndex]
    const updatedWords = line.words.map((w) => (w.id === wordId ? { ...w, text } : w))
    const updatedText = updatedWords.map((w) => w.text).join(' ')
    
    this.linesCache[lineIndex] = {
      ...line,
      words: updatedWords,
      text: updatedText,
    }

    await apiClient.patch(`/api/v1/projects/${this.activeProjectId}/transcript/segments/${lineId}`, {
      text: updatedText,
    })

    this.debounceAutosave()
  }

  async updateLine(lineId: string, text: string): Promise<void> {
    if (!this.activeProjectId) throw new Error('No active project loaded')
    
    const lineIndex = this.linesCache.findIndex((l) => l.id === lineId)
    if (lineIndex === -1) throw new Error('Line not found')

    const line = this.linesCache[lineIndex]
    this.linesCache[lineIndex] = {
      ...line,
      text,
      words: wordsFromText(text, line.startTime, line.endTime, line.confidence),
    }

    await apiClient.patch(`/api/v1/projects/${this.activeProjectId}/transcript/segments/${lineId}`, {
      text,
    })

    this.debounceAutosave()
  }

  private async syncFullTranscript(): Promise<void> {
    if (!this.activeProjectId) return
    const payloadSegments = this.linesCache.map((line, i) => ({
      startTime: line.startTime,
      endTime: line.endTime,
      text: line.text,
      speaker: line.speaker,
      confidence: line.confidence,
      orderIndex: i,
    }))

    const response = await apiClient.put<any>(`/api/v1/projects/${this.activeProjectId}/transcript`, {
      language: 'en',
      segments: payloadSegments,
    })

    // Re-cache response ids
    const segments = Array.isArray(response.segments) ? response.segments : []
    segments.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
    this.linesCache = segments.map((seg: any) => this.mapSegment(seg))
  }

  async splitLine(lineId: string, splitTime: number): Promise<TranscriptLine[]> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    const idx = this.linesCache.findIndex((l) => l.id === lineId)
    if (idx === -1) throw new Error('Line not found')
    
    const line = this.linesCache[idx]
    const splitIdx = line.words.findIndex((w) => w.endTime > splitTime)
    if (splitIdx <= 0) return [line]

    const leftWords = line.words.slice(0, splitIdx)
    const rightWords = line.words.slice(splitIdx)

    const left: TranscriptLine = {
      ...line,
      id: `${line.id}_left`,
      endTime: splitTime,
      text: leftWords.map((w) => w.text).join(' '),
      words: leftWords,
    }

    const right: TranscriptLine = {
      ...line,
      id: `${line.id}_right`,
      startTime: splitTime,
      text: rightWords.map((w) => w.text).join(' '),
      words: rightWords,
    }

    this.linesCache.splice(idx, 1, left, right)
    await this.syncFullTranscript()
    
    this.debounceAutosave()
    return [this.linesCache[idx], this.linesCache[idx + 1]]
  }

  async mergeLines(lineId1: string, lineId2: string): Promise<TranscriptLine> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    const idx1 = this.linesCache.findIndex((l) => l.id === lineId1)
    const idx2 = this.linesCache.findIndex((l) => l.id === lineId2)
    if (idx1 === -1 || idx2 === -1) throw new Error('Lines not found')

    const first = this.linesCache[Math.min(idx1, idx2)]
    const second = this.linesCache[Math.max(idx1, idx2)]

    const mergedText = `${first.text} ${second.text}`
    const merged: TranscriptLine = {
      ...first,
      id: `${first.id}_merged`,
      endTime: second.endTime,
      text: mergedText,
      words: [...first.words, ...second.words],
      confidence: (first.confidence + second.confidence) / 2,
    }

    this.linesCache.splice(Math.min(idx1, idx2), 2, merged)
    await this.syncFullTranscript()

    this.debounceAutosave()
    return this.linesCache[Math.min(idx1, idx2)]
  }

  async deleteLines(lineIds: string[]): Promise<void> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    this.linesCache = this.linesCache.filter((l) => !lineIds.includes(l.id))
    
    // Call delete in parallel
    await Promise.all(
      lineIds.map((id) =>
        apiClient.delete(`/api/v1/projects/${this.activeProjectId}/transcript/segments/${id}`),
      ),
    )

    this.debounceAutosave()
  }

  async duplicateLine(lineId: string): Promise<TranscriptLine> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    const idx = this.linesCache.findIndex((l) => l.id === lineId)
    if (idx === -1) throw new Error('Line not found')
    
    const original = this.linesCache[idx]
    const dur = original.endTime - original.startTime
    
    const dup: TranscriptLine = {
      ...original,
      id: `${original.id}_dup`,
      startTime: original.endTime,
      endTime: original.endTime + dur,
      text: original.text,
      words: original.words.map((w, i) => ({
        ...w,
        id: `w_dup_${Date.now()}_${i}`,
        startTime: w.startTime + dur,
        endTime: w.endTime + dur,
      })),
    }

    this.linesCache.splice(idx + 1, 0, dup)
    await this.syncFullTranscript()

    this.debounceAutosave()
    return this.linesCache[idx + 1]
  }

  async reorderLine(lineId: string, newIndex: number): Promise<TranscriptLine[]> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    const idx = this.linesCache.findIndex((l) => l.id === lineId)
    if (idx === -1) throw new Error('Line not found')
    
    const [removed] = this.linesCache.splice(idx, 1)
    this.linesCache.splice(newIndex, 0, removed)
    
    await this.syncFullTranscript()
    
    this.debounceAutosave()
    return [...this.linesCache]
  }

  async search(query: string): Promise<SearchMatch[]> {
    const matches: SearchMatch[] = []
    const q = query.toLowerCase()
    
    this.linesCache.forEach((line) => {
      line.words.forEach((word, wordIndex) => {
        if (word.text.toLowerCase().includes(q)) {
          matches.push({
            lineId: line.id,
            wordIndex,
            wordId: word.id,
            text: word.text,
            startTime: word.startTime,
          })
        }
      })
    })

    return matches
  }

  async replace(lineId: string, wordId: string, newText: string): Promise<void> {
    await this.updateWord(lineId, wordId, newText)
  }

  async replaceAll(query: string, replacement: string): Promise<number> {
    if (!this.activeProjectId) throw new Error('No active project')
    
    let count = 0
    const q = query.toLowerCase()

    this.linesCache = this.linesCache.map((line) => {
      let lineChanged = false
      const updatedWords = line.words.map((w) => {
        if (w.text.toLowerCase() === q) {
          count++
          lineChanged = true
          return { ...w, text: replacement }
        }
        return w
      })

      if (lineChanged) {
        return {
          ...line,
          words: updatedWords,
          text: updatedWords.map((w) => w.text).join(' '),
        }
      }
      return line
    })

    if (count > 0) {
      await this.syncFullTranscript()
      this.debounceAutosave()
    }

    return count
  }
}
