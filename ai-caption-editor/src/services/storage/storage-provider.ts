export interface IStorageProvider {
  name: string
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
}

export class LocalStorageProvider implements IStorageProvider {
  name = 'local-storage'

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}

export class MemoryStorageProvider implements IStorageProvider {
  name = 'memory'
  private data = new Map<string, string>()

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key)
  }

  async clear(): Promise<void> {
    this.data.clear()
  }
}

class StorageRegistryClass {
  private provider: IStorageProvider = new LocalStorageProvider()

  setProvider(provider: IStorageProvider) {
    this.provider = provider
  }

  getProvider(): IStorageProvider {
    return this.provider
  }
}

export const StorageRegistry = new StorageRegistryClass()
