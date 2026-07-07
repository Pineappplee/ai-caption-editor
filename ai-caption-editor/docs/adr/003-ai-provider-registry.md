# ADR 003: AI Provider Registry

## Status
Accepted

## Context
AI caption assistant features were tied to mock AI outputs. To enable future community LLMs (Gemini, Claude, OpenAI) and allow developers to test locally for free (via Ollama), we needed an abstraction layer.

## Decision
We introduced:
1.  An `IAIProvider` interface defining stream generation and model lists.
2.  `OllamaAIProvider` to stream from a local Ollama server (running on `http://localhost:11434` via Docker or Desktop) for free.
3.  `MockAIProvider` as a fallback if the local server is offline.
4.  An `AIProviderRegistry` managing active backends.

## Consequences
- No AI API keys or paid accounts are required for development.
- Developers can easily plug in Gemini or Anthropic adapters without editing the captioning UI.
