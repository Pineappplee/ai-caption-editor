import type { AIModel, AIAction, AIStreamChunk, AIUsage, AIConversation } from './types'

export interface IAIService {
  getModels(): Promise<AIModel[]>
  getDefaultModel(): Promise<AIModel>

  sendMessage(
    conversationId: string,
    prompt: string,
    model: AIModel,
    action?: AIAction,
  ): AsyncGenerator<AIStreamChunk>

  cancelGeneration(conversationId: string): Promise<void>

  getUsage(): Promise<AIUsage>

  getConversations(): Promise<AIConversation[]>
  createConversation(title?: string): Promise<AIConversation>
  deleteConversation(id: string): Promise<void>
}
