import { container } from './container'
import { MockServiceProvider } from './providers/mock-provider'
import { HttpServiceProvider } from './providers/http-provider'
import type { IServiceProvider } from './providers/types'

// Determine active provider based on environment variable
const mode = import.meta.env.VITE_SERVICE_MODE || 'mock'
const defaultProvider = mode === 'http' ? new HttpServiceProvider() : new MockServiceProvider()

defaultProvider.initialize()
const defaultServices = defaultProvider.getServices()

// Register default services in container
for (const [key, instance] of Object.entries(defaultServices)) {
  if (instance) {
    container.register(key as any, instance)
  }
}

// Function to register custom provider (e.g. Firebase, Supabase, REST APIs)
export async function registerProvider(provider: IServiceProvider) {
  await provider.initialize()
  const customServices = provider.getServices()
  for (const [key, instance] of Object.entries(customServices)) {
    if (instance) {
      container.register(key as any, instance)
    }
  }
}

// Global services accessor using ES getters for late resolution
export const services = {
  get auth() { return container.get('auth') },
  get settings() { return container.get('settings') },
  get projects() { return container.get('projects') },
  get transcript() { return container.get('transcript') },
  get wizard() { return container.get('wizard') },
  get captionStyle() { return container.get('captionStyle') },
  get dashboard() { return container.get('dashboard') },
  get profile() { return container.get('profile') },
  get ai() { return container.get('ai') },
  get templates() { return container.get('templates') },
  get export() { return container.get('export') },
  get timeline() { return container.get('timeline') },
  get editor() { return container.get('editor') },
  get help() { return container.get('help') },
  get media() { return container.get('media') },
}

// Re-export provider types and container for advanced usage
export type { IServiceProvider } from './providers/types'
export { container } from './container'
export { ServicesProvider, useServices } from './context'
export type { ServicesProviderProps } from './context'

