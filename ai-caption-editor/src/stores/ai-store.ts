import { create } from 'zustand'
import type { AIModel, AIAction, AIUsage, AIConversation, AIMessage, SuggestedPrompt } from '@/services/ai'
import { services } from '@/services'

const service = services.ai

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: 'sp1', text: 'Generate captions for this video', category: 'captions' },
  { id: 'sp2', text: 'Fix grammar and punctuation', category: 'edit' },
  { id: 'sp3', text: 'Make this text more concise', category: 'edit' },
  { id: 'sp4', text: 'Translate to Spanish', category: 'translate' },
  { id: 'sp5', text: 'Change tone to formal', category: 'style' },
  { id: 'sp6', text: 'Expand this description', category: 'edit' },
  { id: 'sp7', text: 'Remove filler words', category: 'edit' },
  { id: 'sp8', text: 'Detect speakers in transcript', category: 'analyze' },
]

interface AIStoreState {
  conversations: AIConversation[]
  activeConversationId: string | null
  messages: AIMessage[]
  isStreaming: boolean
  streamingContent: string
  selectedModel: AIModel
  usage: AIUsage
  suggestedPrompts: SuggestedPrompt[]

  loadConversations: () => Promise<void>
  createConversation: (title?: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  switchConversation: (id: string) => void

  sendMessage: (content: string, action?: AIAction) => Promise<void>
  cancelGeneration: () => Promise<void>
  retryLast: () => Promise<void>

  setModel: (model: AIModel) => void
  clearConversation: () => void
}

export const useAIStore = create<AIStoreState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  selectedModel: 'gpt-4o',
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, model: 'gpt-4o' },
  suggestedPrompts: SUGGESTED_PROMPTS,

  loadConversations: async () => {
    const convos = await service.getConversations()
    const usage = await service.getUsage()
    set({ conversations: convos, usage })
    if (convos.length > 0 && !get().activeConversationId) {
      const activeId = convos[0].id
      set({
        activeConversationId: activeId,
        messages: convos[0].messages.map((m) => ({ ...m })),
      })
    }
  },

  createConversation: async (title?: string) => {
    const convo = await service.createConversation(title)
    set((s) => ({
      conversations: [...s.conversations, convo],
      activeConversationId: convo.id,
      messages: [],
      streamingContent: '',
    }))
  },

  deleteConversation: async (id: string) => {
    await service.deleteConversation(id)
    set((s) => {
      const remaining = s.conversations.filter((c) => c.id !== id)
      const activeId = s.activeConversationId === id
        ? (remaining[0]?.id ?? null)
        : s.activeConversationId
      const messages = activeId
        ? remaining.find((c) => c.id === activeId)?.messages.map((m) => ({ ...m })) ?? []
        : []
      return {
        conversations: remaining,
        activeConversationId: activeId,
        messages,
      }
    })
  },

  switchConversation: (id: string) => {
    const convo = get().conversations.find((c) => c.id === id)
    if (convo) {
      set({
        activeConversationId: id,
        messages: convo.messages.map((m) => ({ ...m })),
        streamingContent: '',
      })
    }
  },

  sendMessage: async (content: string, action?: AIAction) => {
    const state = get()
    let convoId = state.activeConversationId

    if (!convoId) {
      const convo = await service.createConversation()
      set((s) => ({
        conversations: [...s.conversations, convo],
        activeConversationId: convo.id,
      }))
      convoId = convo.id
    }

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'complete',
      action,
    }

    const assistantMsg: AIMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      status: 'streaming',
      action,
    }

    set((s) => ({
      messages: [...s.messages, userMsg, assistantMsg],
      isStreaming: true,
      streamingContent: '',
    }))

    try {
      const stream = service.sendMessage(convoId!, content, state.selectedModel, action)
      let fullContent = ''

      for await (const chunk of stream) {
        if (chunk.done) {
          fullContent += chunk.content
          const finalMsg: AIMessage = {
            ...assistantMsg,
            content: fullContent,
            status: fullContent.includes('[Generation cancelled]') ? 'error' : 'complete',
          }
          set((s) => ({
            messages: s.messages.map((m) => (m.id === assistantMsg.id ? finalMsg : m)),
            isStreaming: false,
            streamingContent: '',
          }))
          // Update conversation in list
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === convoId
                ? { ...c, messages: [...s.messages], updatedAt: Date.now() }
                : c
            ),
          }))
        } else {
          fullContent += chunk.content
          set({ streamingContent: fullContent })
        }
      }

      const usage = await service.getUsage()
      set({ usage })
    } catch {
      const errorMsg: AIMessage = {
        ...assistantMsg,
        content: 'An error occurred while generating a response. Please try again.',
        status: 'error',
      }
      set((s) => ({
        messages: s.messages.map((m) => (m.id === assistantMsg.id ? errorMsg : m)),
        isStreaming: false,
        streamingContent: '',
      }))
    }
  },

  cancelGeneration: async () => {
    const state = get()
    if (state.activeConversationId) {
      await service.cancelGeneration(state.activeConversationId)
      set({ isStreaming: false })
    }
  },

  retryLast: async () => {
    const state = get()
    const lastUserMsg = [...state.messages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      // Remove last user message and its response
      const lastIdx = state.messages.lastIndexOf(lastUserMsg)
      const msgs = state.messages.slice(0, lastIdx)
      set({ messages: msgs })
      await get().sendMessage(lastUserMsg.content, lastUserMsg.action)
    }
  },

  setModel: (selectedModel: AIModel) => set({ selectedModel }),

  clearConversation: () => set({ messages: [], streamingContent: '' }),
}))
