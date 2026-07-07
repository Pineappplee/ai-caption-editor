import { useCallback, useState } from 'react'
import { GripVertical, Play, Check, X } from 'lucide-react'
import type { TranscriptLine } from '@/services/transcript'
import { useEditorStore } from '@/stores/editor-store'
import { useTranscriptStore } from '@/stores/transcript-store'

interface Props {
  line: TranscriptLine
  isActive: boolean
  isSelected: boolean
  searchQuery: string
  style?: React.CSSProperties
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export function TranscriptLineRow({ line, isActive, isSelected, searchQuery, style }: Props) {
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime)

  const selectLine = useTranscriptStore((s) => s.selectLine)
  const selectWord = useTranscriptStore((s) => s.selectWord)
  const currentWordId = useTranscriptStore((s) => s.currentWordId)
  const inlineEditWord = useTranscriptStore((s) => s.inlineEditWord)
  const inlineEditLine = useTranscriptStore((s) => s.inlineEditLine)
  const duplicateSelected = useTranscriptStore((s) => s.duplicateSelected)
  const deleteSelected = useTranscriptStore((s) => s.deleteSelected)
  const splitLine = useTranscriptStore((s) => s.splitLine)

  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingLine, setEditingLine] = useState(false)
  const [editLineValue, setEditLineValue] = useState('')
  const [contextOpen, setContextOpen] = useState(false)

  const handleWordClick = useCallback((e: React.MouseEvent, wordId: string) => {
    const word = line.words.find((w) => w.id === wordId)
    if (!word) return
    setCurrentTime(word.startTime)
    selectWord(line.id, wordId, e.shiftKey, e.metaKey || e.ctrlKey)
  }, [line.id, line.words, setCurrentTime, selectWord])

  const handleWordDoubleClick = useCallback((wordId: string, text: string) => {
    setEditingWordId(wordId)
    setEditValue(text)
  }, [])

  const commitWordEdit = useCallback(async () => {
    if (editingWordId && editValue.trim()) {
      await inlineEditWord(line.id, editingWordId, editValue.trim())
    }
    setEditingWordId(null)
  }, [editingWordId, editValue, line.id, inlineEditWord])

  const commitLineEdit = useCallback(async () => {
    if (editLineValue.trim()) {
      await inlineEditLine(line.id, editLineValue.trim())
    }
    setEditingLine(false)
  }, [editLineValue, line.id, inlineEditLine])

  const handleSplit = useCallback(() => {
    if (currentWordId) {
      const word = line.words.find((w) => w.id === currentWordId)
      if (word) splitLine(line.id, word.startTime)
    }
    setContextOpen(false)
  }, [currentWordId, line.id, line.words, splitLine])

  const handleDuplicate = useCallback(() => {
    duplicateSelected()
    setContextOpen(false)
  }, [duplicateSelected])

  const handleDelete = useCallback(() => {
    deleteSelected()
    setContextOpen(false)
  }, [deleteSelected])

  const confidenceColor = line.confidence >= 0.97
    ? 'text-emerald-400'
    : line.confidence >= 0.9
      ? 'text-amber-400'
      : 'text-red-400'

  return (
    <div
      data-line-id={line.id}
      style={style}
      className={`group relative border-b border-zinc-800/60 transition-colors ${
        isActive
          ? 'bg-blue-600/8'
          : isSelected
            ? 'bg-zinc-800/40'
            : 'hover:bg-zinc-800/20'
      }`}
      onContextMenu={(e) => { e.preventDefault(); setContextOpen(true) }}
      onClick={(e) => selectLine(line.id, e.shiftKey, e.metaKey || e.ctrlKey)}
    >
      {/* Context menu */}
      {contextOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextOpen(false)} />
          <div className="absolute right-2 top-6 z-50 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
            <button type="button" onClick={handleSplit} className="flex w-full items-center px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-zinc-800">Split at word</button>
            <button type="button" onClick={handleDuplicate} className="flex w-full items-center px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-zinc-800">Duplicate</button>
            <div className="mx-2 my-0.5 border-t border-zinc-800" />
            <button type="button" onClick={handleDelete} className="flex w-full items-center px-3 py-1.5 text-[11px] text-red-400 hover:bg-zinc-800">Delete</button>
          </div>
        </>
      )}

      <div className="flex items-start gap-1 px-2 py-1.5">
        {/* Drag handle */}
        <div className="mt-1 flex shrink-0 cursor-grab text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-400">
          <GripVertical className="size-3" />
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setCurrentTime(line.startTime) }}
          className="mt-1 flex size-4 shrink-0 items-center justify-center rounded text-zinc-600 opacity-0 transition-opacity hover:bg-zinc-700 hover:text-zinc-200 group-hover:opacity-100"
          title="Play from here"
        >
          <Play className="size-2.5" />
        </button>

        {/* Timestamp + speaker */}
        <div className="flex shrink-0 items-center gap-1 min-w-0">
          <span className="text-[9px] text-zinc-500 font-mono tabular-nums">
            {formatTime(line.startTime)}
          </span>
          <span className={`rounded px-1 py-0.5 text-[8px] font-medium uppercase ${
            line.speaker === 'Host'
              ? 'bg-indigo-600/15 text-indigo-400'
              : 'bg-emerald-600/15 text-emerald-400'
          }`}>
            {line.speaker === 'Host' ? 'H' : 'G'}
          </span>
        </div>

        {/* Words */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-0.5 leading-snug">
            {line.words.map((word) => {
              const isWordActive = currentWordId === word.id
              const isWordSelected = useTranscriptStore.getState().selectedWordIds.has(word.id)
              const isHighlighted = searchQuery && word.text.toLowerCase().includes(searchQuery.toLowerCase())

              if (editingWordId === word.id) {
                return (
                  <span key={word.id} className="inline-flex items-center gap-0.5">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitWordEdit()
                        if (e.key === 'Escape') setEditingWordId(null)
                      }}
                      className="w-16 rounded border border-blue-500/50 bg-zinc-800 px-1 py-0 text-[10px] text-zinc-100 outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); commitWordEdit() }}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="size-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingWordId(null) }}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                )
              }

              return (
                <span
                  key={word.id}
                  onClick={(e) => handleWordClick(e, word.id)}
                  onDoubleClick={() => handleWordDoubleClick(word.id, word.text)}
                  className={`cursor-pointer rounded px-0.5 text-[10.5px] leading-relaxed transition-colors ${
                    isWordActive && isActive
                      ? 'bg-blue-500/20 text-blue-200 font-medium'
                      : isWordActive
                        ? 'bg-blue-500/10 text-blue-300'
                        : isWordSelected
                          ? 'bg-zinc-700/50 text-zinc-200'
                          : isActive
                            ? 'text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-200'
                  } ${isHighlighted ? 'ring-1 ring-yellow-500/40 rounded' : ''}`}
                  title={`${formatTime(word.startTime)} - ${formatTime(word.endTime)}`}
                >
                  {word.text}
                </span>
              )
            })}
          </div>

          {/* Inline line editing */}
          {editingLine && (
            <div className="mt-1 flex items-center gap-1">
              <input
                type="text"
                value={editLineValue}
                onChange={(e) => setEditLineValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitLineEdit()
                  if (e.key === 'Escape') setEditingLine(false)
                }}
                className="flex-1 rounded border border-blue-500/50 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 outline-none"
                autoFocus
              />
              <button type="button" onClick={commitLineEdit} className="text-emerald-400 hover:text-emerald-300"><Check className="size-3" /></button>
              <button type="button" onClick={() => setEditingLine(false)} className="text-zinc-500 hover:text-zinc-300"><X className="size-3" /></button>
            </div>
          )}
        </div>

        {/* Confidence */}
        <span className={`shrink-0 text-[8px] font-mono tabular-nums ${confidenceColor}`}>
          {Math.round(line.confidence * 100)}%
        </span>
      </div>
    </div>
  )
}
