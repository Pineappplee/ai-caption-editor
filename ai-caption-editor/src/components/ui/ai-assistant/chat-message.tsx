import { useState, useCallback } from 'react'
import { Copy, Check, RotateCcw, User, Bot } from 'lucide-react'
import type { AIMessage } from '@/services/ai'

interface Props {
  message: AIMessage
  isStreaming?: boolean
  streamingContent?: string
  onRetry?: () => void
}

export function ChatMessage({ message, isStreaming, streamingContent, onRetry }: Props) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const displayContent = isStreaming && streamingContent ? streamingContent : message.content

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [message.content])

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-blue-600/20' : 'bg-zinc-700/50'
      }`}>
        {isUser ? <User className="size-3 text-blue-400" /> : <Bot className="size-3 text-zinc-400" />}
      </div>

      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
          isUser
            ? 'bg-blue-600/20 text-blue-100'
            : isError
              ? 'bg-red-600/10 text-red-300 border border-red-800/30'
              : 'bg-zinc-800/60 text-zinc-200'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {displayContent}
            {isStreaming && (
              <span className="inline-flex gap-0.5 ml-0.5">
                <span className="size-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0ms' }} />
                <span className="size-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '150ms' }} />
                <span className="size-1 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }} />
              </span>
            )}
          </div>
        </div>

        <div className={`mt-0.5 flex items-center gap-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[8px] text-zinc-600 font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {!isUser && !isStreaming && message.content && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex size-4 items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
                title="Copy"
              >
                {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
              </button>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex size-4 items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
                  title="Retry"
                >
                  <RotateCcw className="size-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
