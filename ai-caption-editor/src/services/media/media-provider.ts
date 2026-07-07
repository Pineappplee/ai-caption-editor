export interface IMediaProvider {
  name: string
  upload(projectId: string, file: File, onProgress?: (progress: number) => void): Promise<{ url: string; size: number }>
  delete(url: string): Promise<void>
  getDownloadUrl(url: string): Promise<string>
  generateThumbnail(url: string): Promise<string>
}

export class MockMediaProvider implements IMediaProvider {
  name = 'mock'

  async upload(_projectId: string, file: File, onProgress?: (progress: number) => void): Promise<{ url: string; size: number }> {
    if (onProgress) {
      for (let p = 0; p <= 100; p += 25) {
        onProgress(p)
        await new Promise((r) => setTimeout(r, 100))
      }
    }
    return {
      url: `/assets/mock-uploads/${file.name}`,
      size: file.size,
    }
  }

  async delete(_url: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100))
  }

  async getDownloadUrl(url: string): Promise<string> {
    return url
  }

  async generateThumbnail(_url: string): Promise<string> {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60'
  }
}

class MediaProviderRegistryClass {
  private provider: IMediaProvider = new MockMediaProvider()

  setProvider(provider: IMediaProvider) {
    this.provider = provider
  }

  getProvider(): IMediaProvider {
    return this.provider
  }
}

export const MediaProviderRegistry = new MediaProviderRegistryClass()
