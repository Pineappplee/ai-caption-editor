import { AIProviderRegistry } from '@/services/ai/ai-provider'
import type { IAIProvider } from '@/services/ai/ai-provider'
import { StorageRegistry } from '@/services/storage/storage-provider'
import type { IStorageProvider } from '@/services/storage/storage-provider'
import { MediaProviderRegistry } from '@/services/media/media-provider'
import type { IMediaProvider } from '@/services/media/media-provider'

export interface IPluginRegistry {
  registerAIProvider(provider: IAIProvider): void
  registerStorageProvider(provider: IStorageProvider): void
  registerMediaProvider(provider: IMediaProvider): void
  registerExporter(name: string, exporter: any): void
  registerCaptionAnimation(name: string, animation: any): void
  registerFont(name: string, fontConfig: any): void
  registerTemplate(name: string, template: any): void
  registerTimelineTool(name: string, tool: any): void
}

export interface IPlugin {
  name: string
  version: string
  description?: string
  register(registry: IPluginRegistry): void
}

class PluginManagerClass {
  private plugins = new Map<string, IPlugin>()
  private exporters = new Map<string, any>()
  private animations = new Map<string, any>()
  private fonts = new Map<string, any>()
  private templates = new Map<string, any>()
  private timelineTools = new Map<string, any>()

  private registry: IPluginRegistry = {
    registerAIProvider: (provider) => AIProviderRegistry.register(provider),
    registerStorageProvider: (provider) => StorageRegistry.setProvider(provider),
    registerMediaProvider: (provider) => MediaProviderRegistry.setProvider(provider),
    registerExporter: (name, exporter) => this.exporters.set(name, exporter),
    registerCaptionAnimation: (name, animation) => this.animations.set(name, animation),
    registerFont: (name, fontConfig) => this.fonts.set(name, fontConfig),
    registerTemplate: (name, template) => this.templates.set(name, template),
    registerTimelineTool: (name, tool) => this.timelineTools.set(name, tool),
  }

  install(plugin: IPlugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin already installed: ${plugin.name}`)
      return
    }
    try {
      plugin.register(this.registry)
      this.plugins.set(plugin.name, plugin)
      console.log(`[PluginManager] Successfully installed plugin: ${plugin.name} (v${plugin.version})`)
    } catch (err) {
      console.error(`[PluginManager] Failed to install plugin ${plugin.name}:`, err)
    }
  }

  getPlugins(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  getExporters() {
    return this.exporters
  }

  getAnimations() {
    return this.animations
  }

  getFonts() {
    return this.fonts
  }

  getTemplates() {
    return this.templates
  }

  getTimelineTools() {
    return this.timelineTools
  }
}

export const PluginManager = new PluginManagerClass()
