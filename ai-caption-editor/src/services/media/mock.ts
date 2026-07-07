import type {
  MediaAsset,
  AssetFolder,
  UploadProgress,
  StockSearchParams,
  StockSearchResult,
  AIGenerationRequest,
  AIGenerationResult,
  MediaFilter,
  AssetType,
} from './types'
import type { IMediaService } from './interface'
import { MediaProviderRegistry } from './media-provider'

const MOCK_ASSETS: MediaAsset[] = [
  {
    id: 'ma-1',
    type: 'video',
    source: 'upload',
    filename: 'interview-broll.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
    originalUrl: '#',
    fileSize: 45_000_000,
    width: 1920,
    height: 1080,
    duration: 32.5,
    format: 'mp4',
    createdAt: '2026-06-28T10:00:00Z',
    isFavorite: true,
    tags: ['b-roll', 'interview'],
  },
  {
    id: 'ma-2',
    type: 'image',
    source: 'upload',
    filename: 'logo-white.png',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620577438192-f58e4f8985d5?w=400&h=400&fit=crop',
    originalUrl: '#',
    fileSize: 1_200_000,
    width: 500,
    height: 500,
    format: 'png',
    createdAt: '2026-06-27T14:30:00Z',
    isFavorite: true,
    tags: ['logo', 'branding'],
  },
  {
    id: 'ma-3',
    type: 'image',
    source: 'upload',
    filename: 'thumbnail-bg.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878370-6a1e0bf7b3c6?w=400&h=400&fit=crop',
    originalUrl: '#',
    fileSize: 3_500_000,
    width: 1920,
    height: 1080,
    format: 'jpg',
    createdAt: '2026-06-25T09:15:00Z',
    isFavorite: false,
    tags: ['background'],
  },
  {
    id: 'ma-4',
    type: 'video',
    source: 'upload',
    filename: 'intro-animation.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=225&fit=crop',
    originalUrl: '#',
    fileSize: 12_000_000,
    width: 1920,
    height: 1080,
    duration: 8.0,
    format: 'mp4',
    createdAt: '2026-06-24T16:45:00Z',
    isFavorite: false,
    tags: ['intro', 'animation'],
  },
  {
    id: 'ma-5',
    type: 'gif',
    source: 'upload',
    filename: 'celebration.gif',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
    originalUrl: '#',
    fileSize: 800_000,
    width: 480,
    height: 360,
    duration: 3.0,
    format: 'gif',
    createdAt: '2026-06-23T11:20:00Z',
    isFavorite: true,
    tags: ['fun', 'celebration'],
  },
  {
    id: 'ma-6',
    type: 'image',
    source: 'upload',
    filename: 'lower-third.png',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    originalUrl: '#',
    fileSize: 450_000,
    width: 800,
    height: 200,
    format: 'png',
    createdAt: '2026-06-22T08:00:00Z',
    isFavorite: false,
    tags: ['lower-third', 'overlay'],
  },
  {
    id: 'ma-7',
    type: 'audio',
    source: 'upload',
    filename: 'background-music.mp3',
    thumbnailUrl: '',
    originalUrl: '#',
    fileSize: 5_200_000,
    width: 0,
    height: 0,
    duration: 180,
    format: 'mp3',
    createdAt: '2026-06-21T13:10:00Z',
    isFavorite: false,
    tags: ['music', 'background'],
  },
  {
    id: 'ma-8',
    type: 'video',
    source: 'stock',
    filename: 'beach-sunset.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop',
    originalUrl: '#',
    fileSize: 18_000_000,
    width: 1920,
    height: 1080,
    duration: 15.0,
    format: 'mp4',
    createdAt: '2026-06-20T10:00:00Z',
    isFavorite: false,
    tags: ['nature', 'beach'],
  },
  {
    id: 'ma-9',
    type: 'image',
    source: 'stock',
    filename: 'office-team.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    originalUrl: '#',
    fileSize: 2_800_000,
    width: 1920,
    height: 1280,
    format: 'jpg',
    createdAt: '2026-06-19T09:00:00Z',
    isFavorite: false,
    tags: ['business', 'people'],
  },
  {
    id: 'ma-10',
    type: 'image',
    source: 'stock',
    filename: 'city-night.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
    originalUrl: '#',
    fileSize: 3_100_000,
    width: 1920,
    height: 1280,
    format: 'jpg',
    createdAt: '2026-06-18T15:30:00Z',
    isFavorite: false,
    tags: ['city', 'night'],
  },
  {
    id: 'ma-11',
    type: 'video',
    source: 'ai-generated',
    filename: 'ai-clouds-timelapse.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=225&fit=crop',
    originalUrl: '#',
    fileSize: 9_500_000,
    width: 1920,
    height: 1080,
    duration: 10.0,
    format: 'mp4',
    createdAt: '2026-06-17T12:00:00Z',
    isFavorite: false,
    tags: ['ai', 'clouds'],
    prompt: 'Timelapse of clouds moving across a mountain landscape',
  },
  {
    id: 'ma-12',
    type: 'image',
    source: 'ai-generated',
    filename: 'ai-product-mockup.png',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    originalUrl: '#',
    fileSize: 2_100_000,
    width: 1024,
    height: 1024,
    format: 'png',
    createdAt: '2026-06-16T11:00:00Z',
    isFavorite: false,
    tags: ['ai', 'product'],
    prompt: 'A modern product mockup on a clean white background',
  },
  {
    id: 'ma-13',
    type: 'subtitle',
    source: 'upload',
    filename: 'english-subtitles.srt',
    thumbnailUrl: '',
    originalUrl: '#',
    fileSize: 45_000,
    width: 0,
    height: 0,
    format: 'srt',
    createdAt: '2026-06-15T10:00:00Z',
    isFavorite: false,
    tags: ['subtitles', 'english'],
  },
  {
    id: 'ma-14',
    type: 'font',
    source: 'upload',
    filename: 'Inter-Bold.woff2',
    thumbnailUrl: '',
    originalUrl: '#',
    fileSize: 180_000,
    width: 0,
    height: 0,
    format: 'woff2',
    createdAt: '2026-06-14T09:00:00Z',
    isFavorite: true,
    tags: ['font', 'sans-serif'],
  },
  {
    id: 'ma-15',
    type: 'sticker',
    source: 'upload',
    filename: 'arrow-pointer.svg',
    thumbnailUrl: 'https://img.icons8.com/fluency/96/arrow.png',
    originalUrl: '#',
    fileSize: 12_000,
    width: 96,
    height: 96,
    format: 'svg',
    createdAt: '2026-06-13T16:00:00Z',
    isFavorite: false,
    tags: ['sticker', 'arrow'],
  },
]

const MOCK_FOLDERS: AssetFolder[] = [
  { id: 'mf-1', name: 'B-Roll', assetCount: 4, color: '#6366f1' },
  { id: 'mf-2', name: 'Branding', assetCount: 3, color: '#ec4899' },
  { id: 'mf-3', name: 'Backgrounds', assetCount: 2, color: '#14b8a6' },
  { id: 'mf-4', name: 'Audio', assetCount: 1, color: '#f59e0b' },
  { id: 'mf-5', name: 'AI Generated', assetCount: 2, color: '#8b5cf6' },
]

const STOCK_CATEGORIES = [
  { id: 'sc-1', name: 'Nature', count: 245 },
  { id: 'sc-2', name: 'Business', count: 189 },
  { id: 'sc-3', name: 'Technology', count: 156 },
  { id: 'sc-4', name: 'People', count: 312 },
  { id: 'sc-5', name: 'Lifestyle', count: 198 },
  { id: 'sc-6', name: 'Abstract', count: 87 },
]

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export class MockMediaService implements IMediaService {
  private assets = new Map(MOCK_ASSETS.map((a) => [a.id, { ...a }]))
  private folders = new Map(MOCK_FOLDERS.map((f) => [f.id, { ...f }]))
  private uploadCounter = 100

  async getAssets(_projectId: string, filter: MediaFilter): Promise<MediaAsset[]> {
    await sleep(150)
    let list = Array.from(this.assets.values())

    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      list = list.filter((a) => a.filename.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)))
    }
    if (filter.types.length > 0) {
      list = list.filter((a) => filter.types.includes(a.type))
    }
    if (filter.folderId !== null) {
      list = list.filter((a) => a.folderId === filter.folderId)
    }
    if (filter.favoritesOnly) {
      list = list.filter((a) => a.isFavorite)
    }
    if (filter.tags.length > 0) {
      list = list.filter((a) => filter.tags.some((t) => a.tags.includes(t)))
    }

    list.sort((a, b) => {
      let cmp = 0
      switch (filter.sortField) {
        case 'name': cmp = a.filename.localeCompare(b.filename); break
        case 'date': cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); break
        case 'size': cmp = b.fileSize - a.fileSize; break
        case 'type': cmp = a.type.localeCompare(b.type); break
      }
      return filter.sortDirection === 'asc' ? cmp : -cmp
    })

    return list
  }

  async getAsset(id: string): Promise<MediaAsset | null> {
    await sleep(50)
    return this.assets.get(id) ?? null
  }

  async *uploadFiles(projectId: string, files: File[]): AsyncGenerator<UploadProgress, MediaAsset[], unknown> {
    const results: MediaAsset[] = []
    const provider = MediaProviderRegistry.getProvider()
    for (const file of files) {
      const id = `ma-upload-${this.uploadCounter++}`
      const progress: UploadProgress = { id, filename: file.name, progress: 0, status: 'queued' }

      progress.status = 'uploading'
      
      const uploadPromise = provider.upload(projectId, file, (p) => {
        progress.progress = p
      })

      while (progress.progress < 100) {
        yield { ...progress }
        await sleep(50)
      }

      const uploadResult = await uploadPromise

      progress.status = 'processing'
      yield { ...progress }
      await sleep(200)

      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const typeMap: Record<string, { type: AssetType; format: string }> = {
        mp4: { type: 'video', format: 'mp4' },
        mov: { type: 'video', format: 'mov' },
        webm: { type: 'video', format: 'webm' },
        png: { type: 'image', format: 'png' },
        jpg: { type: 'image', format: 'jpg' },
        jpeg: { type: 'image', format: 'jpeg' },
        webp: { type: 'image', format: 'webp' },
        gif: { type: 'gif', format: 'gif' },
        mp3: { type: 'audio', format: 'mp3' },
        wav: { type: 'audio', format: 'wav' },
        srt: { type: 'subtitle', format: 'srt' },
        vtt: { type: 'subtitle', format: 'vtt' },
        woff2: { type: 'font', format: 'woff2' },
        svg: { type: 'sticker', format: 'svg' },
      }
      const info = typeMap[ext] ?? { type: 'image' as const, format: ext }

      const thumbnailUrl = info.type === 'image' ? await provider.generateThumbnail(uploadResult.url) : ''
      const originalUrl = await provider.getDownloadUrl(uploadResult.url)

      const asset: MediaAsset = {
        id,
        type: info.type,
        source: 'upload',
        filename: file.name,
        thumbnailUrl,
        originalUrl,
        fileSize: uploadResult.size,
        width: 0,
        height: 0,
        format: info.format,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        tags: [],
      }

      this.assets.set(asset.id, asset)
      results.push(asset)

      progress.status = 'complete'
      progress.progress = 100
      yield { ...progress }
    }
    return results
  }

  async deleteAssets(ids: string[]): Promise<void> {
    await sleep(100)
    const provider = MediaProviderRegistry.getProvider()
    for (const id of ids) {
      const a = this.assets.get(id)
      if (a) {
        await provider.delete(a.originalUrl)
        this.assets.delete(id)
      }
    }
  }

  async renameAsset(id: string, name: string): Promise<MediaAsset> {
    await sleep(100)
    const a = this.assets.get(id)
    if (!a) throw new Error('Asset not found')
    a.filename = name
    return { ...a }
  }

  async duplicateAsset(id: string): Promise<MediaAsset> {
    await sleep(100)
    const a = this.assets.get(id)
    if (!a) throw new Error('Asset not found')
    const dup: MediaAsset = { ...a, id: `ma-dup-${Date.now()}`, filename: `Copy of ${a.filename}`, createdAt: new Date().toISOString() }
    this.assets.set(dup.id, dup)
    return dup
  }

  async toggleFavorite(id: string): Promise<MediaAsset> {
    await sleep(50)
    const a = this.assets.get(id)
    if (!a) throw new Error('Asset not found')
    a.isFavorite = !a.isFavorite
    return { ...a }
  }

  async addTags(id: string, tags: string[]): Promise<MediaAsset> {
    await sleep(50)
    const a = this.assets.get(id)
    if (!a) throw new Error('Asset not found')
    a.tags = [...new Set([...a.tags, ...tags])]
    return { ...a }
  }

  async removeTags(id: string, tags: string[]): Promise<MediaAsset> {
    await sleep(50)
    const a = this.assets.get(id)
    if (!a) throw new Error('Asset not found')
    a.tags = a.tags.filter((t) => !tags.includes(t))
    return { ...a }
  }

  async getFolders(_projectId: string): Promise<AssetFolder[]> {
    await sleep(80)
    return Array.from(this.folders.values())
  }

  async createFolder(_projectId: string, name: string, parentId?: string): Promise<AssetFolder> {
    await sleep(100)
    const folder: AssetFolder = { id: `mf-${Date.now()}`, name, parentId, assetCount: 0 }
    this.folders.set(folder.id, folder)
    return folder
  }

  async deleteFolder(id: string): Promise<void> {
    await sleep(100)
    this.folders.delete(id)
    for (const a of this.assets.values()) {
      if (a.folderId === id) a.folderId = undefined
    }
  }

  async renameFolder(id: string, name: string): Promise<AssetFolder> {
    await sleep(100)
    const f = this.folders.get(id)
    if (!f) throw new Error('Folder not found')
    f.name = name
    return { ...f }
  }

  async moveAssetsToFolder(assetIds: string[], folderId: string | null): Promise<void> {
    await sleep(100)
    for (const aid of assetIds) {
      const a = this.assets.get(aid)
      if (a) a.folderId = folderId ?? undefined
    }
  }

  async searchStock(params: StockSearchParams): Promise<StockSearchResult> {
    await sleep(300)
    let list = Array.from(this.assets.values()).filter((a) => a.source === 'stock')
    if (params.query) {
      const q = params.query.toLowerCase()
      list = list.filter((a) => a.filename.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)))
    }
    if (params.type !== 'all') {
      list = list.filter((a) => a.type === params.type)
    }
    return { assets: list, totalCount: list.length, page: params.page, hasMore: false }
  }

  async getStockCategories(): Promise<{ id: string; name: string; count: number }[]> {
    await sleep(100)
    return STOCK_CATEGORIES
  }

  async *generateAI(request: AIGenerationRequest): AsyncGenerator<{ status: string; progress: number }, AIGenerationResult, unknown> {
    yield { status: 'generating', progress: 0 }
    await sleep(500)
    yield { status: 'generating', progress: 30 }
    await sleep(500)
    yield { status: 'generating', progress: 60 }
    await sleep(500)
    yield { status: 'generating', progress: 90 }
    await sleep(500)

    const id = `ma-ai-${Date.now()}`
    const asset: MediaAsset = {
      id,
      type: request.assetType,
      source: 'ai-generated',
      filename: `ai-${request.assetType}-${Date.now()}.${request.assetType === 'video' ? 'mp4' : 'png'}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop',
      originalUrl: '#',
      fileSize: request.assetType === 'video' ? 10_000_000 : 2_000_000,
      width: request.assetType === 'video' ? 1920 : 1024,
      height: request.assetType === 'video' ? 1080 : 1024,
      duration: request.assetType === 'video' ? 10 : undefined,
      format: request.assetType === 'video' ? 'mp4' : 'png',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      tags: ['ai', request.assetType],
      prompt: request.prompt,
    }
    this.assets.set(asset.id, asset)

    return { id, prompt: request.prompt, model: request.model, asset, createdAt: new Date().toISOString() }
  }

  async getGenerationHistory(_projectId: string): Promise<AIGenerationResult[]> {
    await sleep(100)
    return Array.from(this.assets.values())
      .filter((a) => a.source === 'ai-generated' && a.prompt)
      .map((a) => ({
        id: a.id,
        prompt: a.prompt ?? '',
        model: 'FLUX.2',
        asset: a,
        createdAt: a.createdAt,
      }))
  }
}
