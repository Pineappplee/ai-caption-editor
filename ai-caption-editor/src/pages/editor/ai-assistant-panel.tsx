import { useEffect, useCallback, useRef } from 'react'
import { Sparkles, BotMessageSquare } from 'lucide-react'
import { useAIStore } from '@/stores/ai-store'
import {
  ChatMessage,
  PromptInput,
  QuickActions,
  SuggestedPrompts,
  TaskProgress,
  ModelSelector,
  TokenUsage,
  ConversationList,
} from '@/components/ui/ai-assistant'
import type { AIAction, AIModel } from '@/services/ai'

const MODELS: AIModel[] = ['gpt-4o', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3-sonnet']

const QUICK_ACTIONS: { id: AIAction; label: string; description: string }[] = [
  { id: 'generate-captions', label: 'Generate Captions', description: 'Auto-generate captions from video' },
  { id: 'rewrite', label: 'Rewrite', description: 'Rewrite selected text' },
  { id: 'translate', label: 'Translate', description: 'Translate to another language' },
  { id: 'summarize', label: 'Summarize', description: 'Summarize the selection' },
  { id: 'fix-grammar', label: 'Fix Grammar', description: 'Fix grammar and punctuation' },
  { id: 'change-tone', label: 'Change Tone', description: 'Change the tone' },
  { id: 'shorten', label: 'Shorten', description: 'Make text more concise' },
  { id: 'expand', label: 'Expand', description: 'Add more detail' },
  { id: 'remove-filler', label: 'Remove Filler', description: 'Remove filler words' },
  { id: 'speaker-detection', label: 'Speaker Detection', description: 'Detect and label speakers' },
]

export function AIAssistantPanel() {
  const messages = useAIStore((s) => s.messages)
  const isStreaming = useAIStore((s) => s.isStreaming)
  const streamingContent = useAIStore((s) => s.streamingContent)
  const selectedModel = useAIStore((s) => s.selectedModel)
  const usage = useAIStore((s) => s.usage)
  const conversations = useAIStore((s) => s.conversations)
  const activeConversationId = useAIStore((s) => s.activeConversationId)
  const suggestedPrompts = useAIStore((s) => s.suggestedPrompts)

  const loadConversations = useAIStore((s) => s.loadConversations)
  const sendMessage = useAIStore((s) => s.sendMessage)
  const cancelGeneration = useAIStore((s) => s.cancelGeneration)
  const retryLast = useAIStore((s) => s.retryLast)
  const setModel = useAIStore((s) => s.setModel)
  const createConversation = useAIStore((s) => s.createConversation)
  const deleteConversation = useAIStore((s) => s.deleteConversation)
  const switchConversation = useAIStore((s) => s.switchConversation)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  const handleAction = useCallback((actionId: AIAction) => {
    const prompts: Record<string, string> = {
      'generate-captions': 'Please generate captions for this video content.',
      'rewrite': 'Please rewrite the selected captions to improve clarity and flow.',
      'translate': 'Please translate the selected captions to Spanish.',
      'summarize': 'Please summarize the key points from these captions.',
      'fix-grammar': 'Please fix any grammar and punctuation issues in the selected captions.',
      'change-tone': 'Please change the tone of the selected captions to be more formal.',
      'shorten': 'Please make the selected captions more concise.',
      'expand': 'Please expand on the selected captions with more detail.',
      'remove-filler': 'Please remove filler words from the selected captions.',
      'speaker-detection': 'Please analyze and detect speakers in this transcript.',
    }
    const prompt = prompts[actionId] || `Please ${actionId.replace(/-/g, ' ')} the selected captions.`
    sendMessage(prompt, actionId)
  }, [sendMessage])

  const handleSuggested = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  const handleModelChange = useCallback((model: AIModel) => {
    setModel(model)
  }, [setModel])

  const showSuggestions = messages.length <= 1 && !isStreaming

  return (
    <div className="flex h-full flex-col min-h-0 bg-zinc-900/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 shrink-0">
        <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-600/30 to-purple-600/30">
          <Sparkles className="size-3.5 text-blue-400" />
        </div>
        <span className="text-[11px] font-semibold text-zinc-200">AI Assistant</span>
      </div>

      {/* Model selector + usage */}
      <div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-1.5 shrink-0">
        <div className="flex-1 min-w-0">
          <ModelSelector models={MODELS} selected={selectedModel} onChange={handleModelChange} />
        </div>
        <TokenUsage usage={usage} />
      </div>

      {/* Conversation history + Messages */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Conversation history */}
        {conversations.length > 1 && (
          <div className="border-b border-zinc-800/40 px-3 py-1.5 shrink-0">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={switchConversation}
              onNew={() => createConversation()}
              onDelete={deleteConversation}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 to-purple-600/15 mb-3">
                <BotMessageSquare className="size-5 text-blue-400" />
              </div>
              <p className="text-[11px] font-medium text-zinc-400 mb-1">AI Caption Assistant</p>
              <p className="text-[9px] text-zinc-600 max-w-[200px]">
                Ask me to generate, edit, translate, or enhance your captions.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={msg.status === 'error' ? retryLast : undefined}
                />
              ))}
              {isStreaming && streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                    status: 'streaming',
                  }}
                  isStreaming
                  streamingContent={streamingContent}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-t border-zinc-800/60 px-3 py-2 space-y-2 shrink-0">
        {showSuggestions && (
          <QuickActions
            actions={QUICK_ACTIONS}
            onAction={handleAction}
            disabled={isStreaming}
          />
        )}

        {/* Suggested prompts */}
        {showSuggestions && (
          <SuggestedPrompts
            prompts={suggestedPrompts}
            onSelect={handleSuggested}
            visible={messages.length <= 1}
          />
        )}

        {/* Task progress */}
        <TaskProgress isStreaming={isStreaming} />

        {/* Prompt input */}
        <PromptInput
          onSend={handleSend}
          onCancel={cancelGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}
