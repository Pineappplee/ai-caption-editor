export interface IAIProvider {
  name: string
  generateStream(prompt: string, model: string): AsyncGenerator<{ text: string }>
  getModels(): Promise<string[]>
}

export class MockAIProvider implements IAIProvider {
  name = 'mock'

  async *generateStream(prompt: string, model: string): AsyncGenerator<{ text: string }> {
    const text = `Mock response using model ${model} for prompt: "${prompt}"`
    const words = text.split(' ')
    for (const word of words) {
      yield { text: word + ' ' }
      await new Promise((r) => setTimeout(r, 60))
    }
  }

  async getModels(): Promise<string[]> {
    return ['mock-gpt-4', 'mock-claude-3', 'mock-gemini-1.5']
  }
}

export class OllamaAIProvider implements IAIProvider {
  name = 'ollama'
  private host: string

  constructor(host = 'http://localhost:11434') {
    this.host = host
  }

  async *generateStream(prompt: string, model: string): AsyncGenerator<{ text: string }> {
    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: true }),
      })
      if (!response.body) throw new Error('No body in Ollama response')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          const parsed = JSON.parse(line)
          yield { text: parsed.response }
        }
      }
    } catch {
      const mock = new MockAIProvider()
      for await (const chunk of mock.generateStream(prompt, model)) {
        yield chunk
      }
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.host}/api/tags`)
      const data = await response.json()
      return data.models.map((m: any) => m.name)
    } catch {
      return ['llama3', 'mistral', 'phi3']
    }
  }
}

class AIProviderRegistryClass {
  private providers = new Map<string, IAIProvider>()
  private activeProviderName = 'mock'

  constructor() {
    this.register(new MockAIProvider())
    this.register(new OllamaAIProvider())
  }

  register(provider: IAIProvider) {
    this.providers.set(provider.name, provider)
  }

  setProvider(name: string) {
    if (!this.providers.has(name)) {
      throw new Error(`AI Provider not registered: ${name}`)
    }
    this.activeProviderName = name
  }

  getProvider(): IAIProvider {
    const provider = this.providers.get(this.activeProviderName)
    if (!provider) {
      throw new Error('No active AI Provider configured')
    }
    return provider
  }
}

export const AIProviderRegistry = new AIProviderRegistryClass()
