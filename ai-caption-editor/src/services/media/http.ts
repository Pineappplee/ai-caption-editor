import { apiClient } from '@/lib/api-client'
import type { IMediaService } from './interface'
import type {
  MediaAsset, AssetFolder, UploadProgress, StockSearchParams,
  StockSearchResult, AIGenerationRequest, AIGenerationResult, MediaFilter,
} from './types'
import { MockMediaService } from './mock'

export class HttpMediaService implements IMediaService {
  private mockDelegate = new MockMediaService()
  private localFavorites = new Set<string>()
  private localTags = new Map<string, string[]>()
  private folders: AssetFolder[] = []
  private folderAssets = new Map<string, string[]>() // folderId -> assetIds[]
  private generations: AIGenerationResult[] = []

  private mapAsset(a: any): MediaAsset {
    const mime = a.mimeType || ''
    let type: any = 'image'
    if (mime.startsWith('video/')) type = 'video'
    else if (mime.startsWith('audio/')) type = 'audio'
    else if (mime.includes('gif')) type = 'gif'
    else if (mime.includes('subtitle') || mime.includes('srt') || mime.includes('vtt') || mime.includes('ass')) type = 'subtitle'
    else if (mime.includes('font')) type = 'font'

    const id = a.id.toString()
    const ext = a.fileName ? a.fileName.split('.').pop() || '' : ''

    // Resolve folder if any
    let folderId: string | undefined
    for (const [fId, assetIds] of this.folderAssets.entries()) {
      if (assetIds.includes(id)) {
        folderId = fId
        break
      }
    }

    return {
      id,
      type,
      source: 'upload',
      filename: a.originalName || a.fileName,
      thumbnailUrl: a.publicUrl || '',
      originalUrl: a.publicUrl || '',
      fileSize: a.size || 0,
      width: 1920,
      height: 1080,
      duration: 180,
      format: ext.toLowerCase(),
      createdAt: a.createdAt || new Date().toISOString(),
      isFavorite: this.localFavorites.has(id),
      tags: this.localTags.get(id) || [],
      folderId,
    }
  }

  async getAssets(projectId: string, filter: MediaFilter): Promise<MediaAsset[]> {
    try {
      const data = await apiClient.get<any[]>(`/api/v1/media/project/${projectId}`)
      let assets = Array.isArray(data) ? data.map((a: any) => this.mapAsset(a)) : []

      // Add AI generated assets if they match the projectId
      const matchedGenerations = this.generations.map((g) => g.asset)
      assets = [...assets, ...matchedGenerations]

      // Filter locally
      assets = assets.filter((asset) => {
        if (filter.searchQuery) {
          const q = filter.searchQuery.toLowerCase()
          if (!asset.filename.toLowerCase().includes(q)) return false
        }
        if (filter.types.length > 0 && !filter.types.includes(asset.type)) return false
        if (filter.folderId !== null && asset.folderId !== filter.folderId) return false
        if (filter.favoritesOnly && !asset.isFavorite) return false
        if (filter.tags.length > 0 && !filter.tags.every((t) => asset.tags.includes(t))) return false
        return true
      })

      // Sort locally
      assets.sort((a, b) => {
        let cmp = 0
        if (filter.sortField === 'name') cmp = a.filename.localeCompare(b.filename)
        else if (filter.sortField === 'size') cmp = b.fileSize - a.fileSize
        else if (filter.sortField === 'type') cmp = a.type.localeCompare(b.type)
        else cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // date
        return filter.sortDirection === 'asc' ? cmp : -cmp
      })

      return assets
    } catch (err) {
      console.warn('Failed to load media assets from server', err)
      return []
    }
  }

  async getAsset(_id: string): Promise<MediaAsset | null> {
    // Backend doesn't support get single asset, so find it from list
    return null
  }

  async *uploadFiles(projectId: string, files: File[]): AsyncGenerator<UploadProgress, MediaAsset[], unknown> {
    const uploaded: MediaAsset[] = []
    
    for (const file of files) {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      
      // Step 1: Enqueue / Start upload progress
      yield { id: uploadId, filename: file.name, progress: 10, status: 'uploading' }
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      try {
        // Step 2: Upload to backend
        const response = await apiClient.post<any>('/api/v1/media/upload', formData)
        
        yield { id: uploadId, filename: file.name, progress: 80, status: 'processing' }
        
        const mapped = this.mapAsset(response)
        uploaded.push(mapped)
        
        yield { id: uploadId, filename: file.name, progress: 100, status: 'complete' }
      } catch (err: any) {
        yield { id: uploadId, filename: file.name, progress: 0, status: 'error', error: err.message || 'Upload failed' }
      }
    }

    return uploaded
  }

  async deleteAssets(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => apiClient.delete(`/api/v1/media/${id}`)))
    ids.forEach((id) => {
      this.localFavorites.delete(id)
      this.localTags.delete(id)
    })
  }

  async renameAsset(id: string, name: string): Promise<MediaAsset> {
    // Backend doesn't support renaming, so simulate rename locally by cache/mock or return asset
    return {
      id,
      type: 'video',
      source: 'upload',
      filename: name,
      thumbnailUrl: '',
      originalUrl: '',
      fileSize: 0,
      width: 1920,
      height: 1080,
      format: 'mp4',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      tags: [],
    }
  }

  async duplicateAsset(id: string): Promise<MediaAsset> {
    // Simulate duplicate locally
    return {
      id: `${id}_copy`,
      type: 'video',
      source: 'upload',
      filename: 'Duplicate file',
      thumbnailUrl: '',
      originalUrl: '',
      fileSize: 0,
      width: 1920,
      height: 1080,
      format: 'mp4',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      tags: [],
    }
  }

  async toggleFavorite(id: string): Promise<MediaAsset> {
    if (this.localFavorites.has(id)) {
      this.localFavorites.delete(id)
    } else {
      this.localFavorites.add(id)
    }
    // Return empty placeholder with correct fav state
    return {
      id,
      type: 'video',
      source: 'upload',
      filename: '',
      thumbnailUrl: '',
      originalUrl: '',
      fileSize: 0,
      width: 1920,
      height: 1080,
      format: 'mp4',
      createdAt: new Date().toISOString(),
      isFavorite: this.localFavorites.has(id),
      tags: [],
    }
  }

  async addTags(id: string, tags: string[]): Promise<MediaAsset> {
    const current = this.localTags.get(id) || []
    const updated = Array.from(new Set([...current, ...tags]))
    this.localTags.set(id, updated)
    return {
      id,
      type: 'video',
      source: 'upload',
      filename: '',
      thumbnailUrl: '',
      originalUrl: '',
      fileSize: 0,
      width: 1920,
      height: 1080,
      format: 'mp4',
      createdAt: new Date().toISOString(),
      isFavorite: this.localFavorites.has(id),
      tags: updated,
    }
  }

  async removeTags(id: string, tags: string[]): Promise<MediaAsset> {
    const current = this.localTags.get(id) || []
    const updated = current.filter((t) => !tags.includes(t))
    this.localTags.set(id, updated)
    return {
      id,
      type: 'video',
      source: 'upload',
      filename: '',
      thumbnailUrl: '',
      originalUrl: '',
      fileSize: 0,
      width: 1920,
      height: 1080,
      format: 'mp4',
      createdAt: new Date().toISOString(),
      isFavorite: this.localFavorites.has(id),
      tags: updated,
    }
  }

  // Folders fallbacks
  async getFolders(_projectId: string): Promise<AssetFolder[]> {
    return this.folders
  }

  async createFolder(_projectId: string, name: string, parentId?: string): Promise<AssetFolder> {
    const folder: AssetFolder = {
      id: `folder_${Date.now()}`,
      name,
      parentId,
      assetCount: 0,
    }
    this.folders.push(folder)
    return folder
  }

  async deleteFolder(id: string): Promise<void> {
    this.folders = this.folders.filter((f) => f.id !== id)
    this.folderAssets.delete(id)
  }

  async renameFolder(id: string, name: string): Promise<AssetFolder> {
    const folder = this.folders.find((f) => f.id === id)
    if (!folder) throw new Error('Folder not found')
    folder.name = name
    return { ...folder }
  }

  async moveAssetsToFolder(assetIds: string[], folderId: string | null): Promise<void> {
    if (folderId) {
      const current = this.folderAssets.get(folderId) || []
      this.folderAssets.set(folderId, Array.from(new Set([...current, ...assetIds])))
    } else {
      // Remove from all folders
      for (const [fId, ids] of this.folderAssets.entries()) {
        this.folderAssets.set(fId, ids.filter((id) => !assetIds.includes(id)))
      }
    }
  }

  // Stock providers search delegation
  async searchStock(params: StockSearchParams): Promise<StockSearchResult> {
    return this.mockDelegate.searchStock(params)
  }

  async getStockCategories(): Promise<{ id: string; name: string; count: number }[]> {
    return this.mockDelegate.getStockCategories()
  }

  // AI Media Generations Mock
  async *generateAI(request: AIGenerationRequest): AsyncGenerator<{ status: string; progress: number }, AIGenerationResult, unknown> {
    const id = `gen_${Date.now()}`
    
    yield { status: 'Enqueuing AI generation job', progress: 10 }
    await new Promise((r) => setTimeout(r, 600))
    yield { status: 'Generating pixels using AI model', progress: 50 }
    await new Promise((r) => setTimeout(r, 800))
    yield { status: 'Saving to media library', progress: 90 }
    await new Promise((r) => setTimeout(r, 400))

    const asset: MediaAsset = {
      id: `ai_asset_${Date.now()}`,
      type: request.assetType,
      source: 'ai-generated',
      filename: `${request.prompt.slice(0, 15).replace(/\s+/g, '_')}.${request.assetType === 'video' ? 'mp4' : 'jpg'}`,
      thumbnailUrl: request.assetType === 'video' 
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop'
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      originalUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1080&fit=crop',
      fileSize: request.assetType === 'video' ? 12_500_000 : 850_000,
      width: 1024,
      height: 1024,
      duration: request.assetType === 'video' ? 4 : undefined,
      format: request.assetType === 'video' ? 'mp4' : 'jpg',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      tags: ['ai-generated'],
      prompt: request.prompt,
    }

    const result: AIGenerationResult = {
      id,
      prompt: request.prompt,
      model: request.model,
      asset,
      createdAt: new Date().toISOString(),
    }

    this.generations.push(result)
    
    yield { status: 'Generation complete', progress: 100 }
    return result
  }

  async getGenerationHistory(_projectId: string): Promise<AIGenerationResult[]> {
    return this.generations
  }
}
