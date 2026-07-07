import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  onCancel: () => void
  isStreaming: boolean
  placeholder?: string
}

export function PromptInput({ onSend, onCancel, isStreaming, placeholder }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isStreaming])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isStreaming, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && isStreaming) {
      e.preventDefault()
      onCancel()
    }
  }, [handleSend, isStreaming, onCancel])

  return (
    <div className="flex items-end gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 focus-within:border-blue-500/50 transition-colors">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => { setText(e.target.value); adjustHeight() }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Ask AI to edit captions...'}
        rows={1}
        className="max-h-[120px] min-h-[20px] flex-1 resize-none bg-transparent text-[11px] text-zinc-200 placeholder-zinc-500 outline-none leading-relaxed"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onCancel}
          className="flex size-6 shrink-0 items-center justify-center rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          title="Cancel (Esc)"
        >
          <Square className="size-3" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex size-6 shrink-0 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Send (Enter)"
        >
          <Send className="size-3" />
        </button>
      )}
    </div>
  )
}
