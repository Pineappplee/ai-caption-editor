import type { ITranscriptService } from './interface'
import type { TranscriptLine, SearchMatch } from './types'

function wordsFromText(text: string, lineStart: number, lineEnd: number, baseConfidence: number): { id: string; text: string; startTime: number; endTime: number; confidence: number }[] {
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

function generateLines(): TranscriptLine[] {
  const raw: { text: string; speaker: string; confidence: number }[] = [
    { text: 'Welcome to our interview series.', speaker: 'Host', confidence: 0.98 },
    { text: 'Today we are speaking with Dr. Sarah Chen.', speaker: 'Host', confidence: 0.97 },
    { text: 'She is a leading researcher in artificial intelligence.', speaker: 'Host', confidence: 0.96 },
    { text: 'Dr. Chen, thank you for joining us today.', speaker: 'Host', confidence: 0.99 },
    { text: 'Thank you for having me. I am excited to be here.', speaker: 'Dr. Chen', confidence: 0.95 },
    { text: 'Let us start with your background in AI research.', speaker: 'Host', confidence: 0.97 },
    { text: 'I began my work in machine learning about ten years ago.', speaker: 'Dr. Chen', confidence: 0.96 },
    { text: 'My focus has been on natural language processing.', speaker: 'Dr. Chen', confidence: 0.98 },
    { text: 'We have seen incredible progress in recent years.', speaker: 'Dr. Chen', confidence: 0.97 },
    { text: 'The pace of innovation is truly remarkable.', speaker: 'Dr. Chen', confidence: 0.96 },
    { text: 'What do you think is the next big breakthrough?', speaker: 'Host', confidence: 0.98 },
    { text: 'I believe multimodal AI will transform the field.', speaker: 'Dr. Chen', confidence: 0.97 },
    { text: 'Combining text, vision, and audio understanding.', speaker: 'Dr. Chen', confidence: 0.96 },
    { text: 'That is a fascinating perspective.', speaker: 'Host', confidence: 0.99 },
  ]

  let time = 0
  const lines: TranscriptLine[] = raw.map((r, i) => {
    const wordCount = r.text.split(/\s+/).length
    const duration = Math.max(2.5, wordCount * 0.35 + Math.random() * 0.5)
    const startTime = time
    const endTime = time + duration
    time = endTime

    const words = wordsFromText(r.text, startTime, endTime, r.confidence)

    return {
      id: `tl_${i}`,
      index: i,
      startTime: Math.round(startTime * 100) / 100,
      endTime: Math.round(endTime * 100) / 100,
      text: r.text,
      words,
      speaker: r.speaker,
      confidence: r.confidence,
      language: 'en',
    }
  })

  return lines
}

let mockLines = generateLines()

export class MockTranscriptService implements ITranscriptService {
  async getLines(_projectId: string): Promise<TranscriptLine[]> {
    await new Promise((r) => setTimeout(r, 80))
    return mockLines.map((l) => ({ ...l, words: l.words.map((w) => ({ ...w })) }))
  }

  async updateWord(lineId: string, wordId: string, text: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 30))
    mockLines = mockLines.map((line) => {
      if (line.id !== lineId) return line
      const words = line.words.map((w) => (w.id === wordId ? { ...w, text } : w))
      return { ...line, words, text: words.map((w) => w.text).join(' ') }
    })
  }

  async updateLine(lineId: string, text: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 30))
    mockLines = mockLines.map((line) =>
      line.id === lineId ? { ...line, text } : line,
    )
  }

  async splitLine(lineId: string, splitTime: number): Promise<TranscriptLine[]> {
    await new Promise((r) => setTimeout(r, 50))
    const idx = mockLines.findIndex((l) => l.id === lineId)
    if (idx === -1) throw new Error('Line not found')
    const line = mockLines[idx]
    const splitIdx = line.words.findIndex((w) => w.endTime > splitTime)
    if (splitIdx <= 0) return [line]

    const leftWords = line.words.slice(0, splitIdx)
    const rightWords = line.words.slice(splitIdx)

    const left: TranscriptLine = {
      ...line,
      id: `${line.id}_a`,
      index: line.index,
      startTime: line.startTime,
      endTime: leftWords[leftWords.length - 1].endTime,
      text: leftWords.map((w) => w.text).join(' '),
      words: leftWords,
    }
    const right: TranscriptLine = {
      ...line,
      id: `${line.id}_b`,
      index: line.index + 1,
      startTime: rightWords[0].startTime,
      endTime: line.endTime,
      text: rightWords.map((w) => w.text).join(' '),
      words: rightWords,
    }

    mockLines = [...mockLines.slice(0, idx), left, right, ...mockLines.slice(idx + 1)]
    return [left, right]
  }

  async mergeLines(lineId1: string, lineId2: string): Promise<TranscriptLine> {
    await new Promise((r) => setTimeout(r, 50))
    const idx1 = mockLines.findIndex((l) => l.id === lineId1)
    const idx2 = mockLines.findIndex((l) => l.id === lineId2)
    if (idx1 === -1 || idx2 === -1) throw new Error('Line not found')
    const [l1, l2] = idx1 < idx2
      ? [mockLines[idx1], mockLines[idx2]]
      : [mockLines[idx2], mockLines[idx1]]

    const merged: TranscriptLine = {
      ...l1,
      id: `${l1.id}_${l2.id}_merged`,
      endTime: l2.endTime,
      text: `${l1.text} ${l2.text}`,
      words: [...l1.words, ...l2.words],
      confidence: Math.min(l1.confidence, l2.confidence),
    }

    const removeIds = new Set([l1.id, l2.id])
    mockLines = mockLines
      .filter((l) => !removeIds.has(l.id))
      .map((l) => (l.index > l1.index ? { ...l, index: l.index - 1 } : l))
    mockLines.splice(l1.index, 0, merged)
    return merged
  }

  async deleteLines(lineIds: string[]): Promise<void> {
    await new Promise((r) => setTimeout(r, 30))
    const del = new Set(lineIds)
    mockLines = mockLines
      .filter((l) => !del.has(l.id))
      .map((l, i) => ({ ...l, index: i }))
  }

  async duplicateLine(lineId: string): Promise<TranscriptLine> {
    await new Promise((r) => setTimeout(r, 30))
    const line = mockLines.find((l) => l.id === lineId)
    if (!line) throw new Error('Line not found')
    const dup: TranscriptLine = {
      ...line,
      id: `${line.id}_dup`,
      index: line.index + 1,
      words: line.words.map((w) => ({ ...w, id: `${w.id}_dup` })),
    }
    mockLines.splice(line.index + 1, 0, dup)
    mockLines = mockLines.map((l, i) => ({ ...l, index: i }))
    return dup
  }

  async reorderLine(lineId: string, newIndex: number): Promise<TranscriptLine[]> {
    await new Promise((r) => setTimeout(r, 30))
    const idx = mockLines.findIndex((l) => l.id === lineId)
    if (idx === -1) throw new Error('Line not found')
    const [line] = mockLines.splice(idx, 1)
    mockLines.splice(newIndex, 0, line)
    mockLines = mockLines.map((l, i) => ({ ...l, index: i }))
    return [...mockLines]
  }

  async search(query: string): Promise<SearchMatch[]> {
    await new Promise((r) => setTimeout(r, 20))
    const lower = query.toLowerCase()
    const matches: SearchMatch[] = []
    for (const line of mockLines) {
      for (let wi = 0; wi < line.words.length; wi++) {
        if (line.words[wi].text.toLowerCase().includes(lower)) {
          matches.push({
            lineId: line.id,
            wordIndex: wi,
            wordId: line.words[wi].id,
            text: line.words[wi].text,
            startTime: line.words[wi].startTime,
          })
        }
      }
    }
    return matches
  }

  async replace(lineId: string, wordId: string, newText: string): Promise<void> {
    await this.updateWord(lineId, wordId, newText)
  }

  async replaceAll(query: string, replacement: string): Promise<number> {
    await new Promise((r) => setTimeout(r, 50))
    const lower = query.toLowerCase()
    let count = 0
    mockLines = mockLines.map((line) => {
      const words = line.words.map((w) => {
        if (w.text.toLowerCase().includes(lower)) {
          count++
          return { ...w, text: w.text.replace(new RegExp(query, 'gi'), replacement) }
        }
        return w
      })
      return { ...line, words, text: words.map((w) => w.text).join(' ') }
    })
    return count
  }
}
