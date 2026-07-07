import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import type { AIConversation } from '@/services/ai'

interface Props {
  conversations: AIConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">History</span>
        <button
          type="button"
          onClick={onNew}
          className="flex size-4 items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="New conversation"
        >
          <Plus className="size-3" />
        </button>
      </div>

      <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
        {conversations.map((convo) => {
          const isActive = convo.id === activeId
          const lastMsg = convo.messages[convo.messages.length - 1]
          const preview = lastMsg
            ? (lastMsg.role === 'user' ? 'You: ' : 'AI: ') + lastMsg.content.slice(0, 40) + (lastMsg.content.length > 40 ? '...' : '')
            : 'Empty conversation'

          return (
            <div
              key={convo.id}
              className={`group flex items-center gap-1 rounded px-1.5 py-1 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-300'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
              onClick={() => onSelect(convo.id)}
            >
              <MessageSquare className="size-2.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[9px] font-medium">{convo.title}</p>
                <p className="truncate text-[8px] text-zinc-600">{preview}</p>
              </div>
              {!isActive && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(convo.id) }}
                  className="hidden group-hover:flex size-4 items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-2.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
