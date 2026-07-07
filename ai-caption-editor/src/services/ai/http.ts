import { apiClient } from '@/lib/api-client'
import type { IAIService } from './interface'
import type { AIModel, AIAction, AIStreamChunk, AIUsage, AIConversation } from './types'

export class HttpAIService implements IAIService {
  private cancelFlag = new Map<string, boolean>()
  private usage: AIUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    model: 'gpt-4o',
  }

  private conversations: AIConversation[] = [
    {
      id: 'convo_default',
      title: 'Caption Editing Session',
      messages: [
        {
          id: 'msg_welcome',
          role: 'assistant',
          content: 'Hello! I am your AI caption assistant. I can help generate, edit, translate, and enhance your captions. What would you like to work on?',
          timestamp: Date.now() - 3600000,
          status: 'complete',
        },
      ],
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
  ]

  async getModels(): Promise<AIModel[]> {
    return ['gpt-4o', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3-sonnet']
  }

  async getDefaultModel(): Promise<AIModel> {
    return 'gpt-4o'
  }

  async *sendMessage(
    conversationId: string,
    prompt: string,
    model: AIModel,
    action?: AIAction,
  ): AsyncGenerator<AIStreamChunk> {
    this.cancelFlag.set(conversationId, false)
    this.usage.model = model

    let responseText = ''

    try {
      if (action === 'rewrite') {
        const res = await apiClient.post<any>('/api/v1/ai/rewrite', { text: prompt, tone: 'casual' })
        responseText = res.text
      } else if (action === 'translate') {
        const res = await apiClient.post<any>('/api/v1/ai/translate', { text: prompt, targetLanguage: 'es' })
        responseText = res.text
      } else if (action === 'summarize') {
        const res = await apiClient.post<any>('/api/v1/ai/summarize', { text: prompt })
        responseText = res.text
      } else if (action === 'generate-captions') {
        const res = await apiClient.post<any>('/api/v1/ai/captions', { text: prompt, language: 'en' })
        const segments = Array.isArray(res.segments) ? res.segments : []
        responseText = `Generated ${segments.length} captions:\n\n` + 
          segments.map((s: any) => `[${s.startTime.toFixed(1)}s - ${s.endTime.toFixed(1)}s] ${s.text}`).join('\n')
      } else if ((action as any) === 'transcribe') {
        const match = prompt.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
        const mediaAssetId = match ? match[0] : prompt
        const res = await apiClient.post<any>('/api/v1/ai/transcribe', { mediaAssetId })
        responseText = res.transcript
      } else {
        // Generic AI Chat Assistant query using rewrite LLM backend
        const res = await apiClient.post<any>('/api/v1/ai/rewrite', { text: prompt })
        responseText = res.text
      }
    } catch (err: any) {
      responseText = `Error from backend AI Service: ${err.message || err}`
    }

    const words = responseText.split(' ')
    this.usage.promptTokens += prompt.length
    this.usage.completionTokens += words.length
    this.usage.totalTokens = this.usage.promptTokens + this.usage.completionTokens

    for (let i = 0; i < words.length; i++) {
      if (this.cancelFlag.get(conversationId)) {
        yield { content: '\n\n[Generation cancelled]', done: true }
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 20))
      yield { content: (i === 0 ? '' : ' ') + words[i], done: false }
    }

    // Add response to local messages cache for history
    const convoIdx = this.conversations.findIndex((c) => c.id === conversationId)
    if (convoIdx !== -1) {
      this.conversations[convoIdx].messages.push(
        {
          id: `msg_user_${Date.now()}`,
          role: 'user',
          content: prompt,
          timestamp: Date.now(),
          status: 'complete',
          action,
        },
        {
          id: `msg_assistant_${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: Date.now(),
          status: 'complete',
          action,
        },
      )
    }

    yield { content: '', done: true }
  }

  async cancelGeneration(conversationId: string): Promise<void> {
    this.cancelFlag.set(conversationId, true)
  }

  async getUsage(): Promise<AIUsage> {
    return { ...this.usage }
  }

  async getConversations(): Promise<AIConversation[]> {
    return this.conversations.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({ ...m })),
    }))
  }

  async createConversation(title?: string): Promise<AIConversation> {
    const convo: AIConversation = {
      id: `convo_${Date.now()}`,
      title: title || `Conversation ${this.conversations.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.conversations.push(convo)
    return { ...convo }
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations = this.conversations.filter((c) => c.id !== id)
  }
}
