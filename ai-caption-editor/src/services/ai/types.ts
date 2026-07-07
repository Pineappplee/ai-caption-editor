export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-haiku' | 'claude-3-sonnet'

export type AIAction =
  | 'generate-captions'
  | 'rewrite'
  | 'translate'
  | 'summarize'
  | 'fix-grammar'
  | 'change-tone'
  | 'shorten'
  | 'expand'
  | 'remove-filler'
  | 'speaker-detection'

export const AI_ACTION_LABELS: Record<AIAction, string> = {
  'generate-captions': 'Generate Captions',
  'rewrite': 'Rewrite',
  'translate': 'Translate',
  'summarize': 'Summarize',
  'fix-grammar': 'Fix Grammar',
  'change-tone': 'Change Tone',
  'shorten': 'Shorten',
  'expand': 'Expand',
  'remove-filler': 'Remove Filler Words',
  'speaker-detection': 'Speaker Detection',
}

export const AI_ACTION_DESCRIPTIONS: Record<AIAction, string> = {
  'generate-captions': 'Auto-generate captions from video',
  'rewrite': 'Rewrite selected text',
  'translate': 'Translate to another language',
  'summarize': 'Summarize the selection',
  'fix-grammar': 'Fix grammar and punctuation',
  'change-tone': 'Change the tone (formal, casual, etc.)',
  'shorten': 'Make text more concise',
  'expand': 'Add more detail',
  'remove-filler': 'Remove filler words (um, uh, like)',
  'speaker-detection': 'Detect and label speakers',
}

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error'

export interface AIMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  status: MessageStatus
  action?: AIAction
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: number
  updatedAt: number
}

export interface AIStreamChunk {
  content: string
  done: boolean
}

export interface AIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: AIModel
}

export interface AIQuickAction {
  id: AIAction
  label: string
  description: string
}

export interface SuggestedPrompt {
  id: string
  text: string
  category: string
}
