import type { IAIService } from './interface'
import type { AIModel, AIAction, AIStreamChunk, AIUsage, AIConversation } from './types'
import { AIProviderRegistry } from './ai-provider'

const MODELS: AIModel[] = ['gpt-4o', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3-sonnet']

const RESPONSE_MAP: Record<string, string> = {
  'generate-captions': 'Here are the generated captions:\n\n**[00:00] Speaker 1:** Welcome to the presentation. Today we will be discussing the latest advancements in AI technology and how they are transforming various industries.\n\n**[00:15] Speaker 1:** First, let us look at the current landscape of machine learning applications in healthcare and finance.',
  'rewrite': 'Here is the rewritten version:\n\nThe revised text maintains the original meaning while improving clarity and flow. The key changes include restructuring complex sentences and selecting more precise vocabulary.',
  'translate': 'Translated text:\n\n¡Aquí está la versión traducida! El texto mantiene su significado original mientras se adapta al idioma de destino de forma natural.',
  'summarize': '**Summary:**\n\nThe content discusses AI advancements and their industry impact. Key points include machine learning applications in healthcare and finance, with a focus on transformer architectures and their role in natural language processing.',
  'fix-grammar': 'Corrected version:\n\nThe grammar has been fixed. All sentences now follow proper punctuation rules and grammatical conventions. The meaning remains unchanged.',
  'change-tone': 'Here is the text with the adjusted tone:\n\nThe tone has been refined to better suit the intended audience while preserving the core message and key information.',
  'shorten': 'Concise version:\n\nAI advancements are transforming industries. Key applications include healthcare ML and NLP with transformer architectures showing significant promise.',
  'expand': 'Expanded version:\n\nArtificial intelligence continues to evolve at a rapid pace, bringing transformative changes across multiple sectors. In healthcare, machine learning algorithms are revolutionizing diagnostics and treatment planning. The financial industry is leveraging AI for fraud detection and algorithmic trading. Natural language processing, powered by transformer architectures like GPT and BERT, has achieved remarkable breakthroughs in understanding and generating human language.',
  'remove-filler': 'Cleaned version:\n\nThe text has been edited to remove filler words. The content flows more smoothly without unnecessary words while preserving the original meaning.',
  'speaker-detection': 'Speaker detection results:\n\n| Segment | Speaker | Confidence |\n|---------|---------|------------|\n| 00:00 - 00:15 | Speaker 1 (Host) | 96% |\n| 00:15 - 00:30 | Speaker 2 (Guest) | 94% |\n| 00:30 - 00:45 | Speaker 1 (Host) | 97% |',
}

let convoCounter = 0

function generateId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export class MockAIService implements IAIService {
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
    try {
      const providerModels = await AIProviderRegistry.getProvider().getModels()
      return [...MODELS, ...providerModels] as AIModel[]
    } catch {
      return [...MODELS]
    }
  }

  async getDefaultModel(): Promise<AIModel> {
    try {
      const models = await this.getModels()
      return models[0]
    } catch {
      return 'gpt-4o'
    }
  }

  async *sendMessage(
    conversationId: string,
    prompt: string,
    model: AIModel,
    action?: AIAction,
  ): AsyncGenerator<AIStreamChunk> {
    this.cancelFlag.set(conversationId, false)
    this.usage.model = model

    const response = action ? RESPONSE_MAP[action] : undefined

    if (response) {
      const words = response.split(' ')
      const delayPerChunk = model === 'gpt-4o-mini' || model === 'claude-3-haiku' ? 15 : 25

      this.usage.promptTokens += prompt.length
      this.usage.completionTokens += words.length

      for (let i = 0; i < words.length; i++) {
        if (this.cancelFlag.get(conversationId)) {
          yield { content: '\n\n[Generation cancelled]', done: true }
          return
        }

        await new Promise((resolve) => setTimeout(resolve, delayPerChunk))
        yield { content: (i === 0 ? '' : ' ') + words[i], done: false }
      }
    } else {
      const aiProvider = AIProviderRegistry.getProvider()
      try {
        const stream = aiProvider.generateStream(prompt, model)
        for await (const chunk of stream) {
          if (this.cancelFlag.get(conversationId)) {
            yield { content: '\n\n[Generation cancelled]', done: true }
            return
          }
          yield { content: chunk.text, done: false }
        }
      } catch (err) {
        yield { content: `\n\nError calling AI Provider: ${(err as Error).message}`, done: true }
        return
      }
    }

    this.usage.totalTokens = this.usage.promptTokens + this.usage.completionTokens
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
    convoCounter++
    const convo: AIConversation = {
      id: generateId(),
      title: title || `Conversation ${convoCounter}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.conversations.push(convo)
    return { ...convo, messages: [] }
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations = this.conversations.filter((c) => c.id !== id)
  }
}
