export type AssetType = 'video' | 'image' | 'gif' | 'audio' | 'subtitle' | 'font' | 'sticker'

export type AssetSource = 'upload' | 'stock' | 'ai-generated'

export interface MediaAsset {
  id: string
  type: AssetType
  source: AssetSource
  filename: string
  thumbnailUrl: string
  originalUrl: string
  fileSize: number
  width: number
  height: number
  duration?: number
  format: string
  createdAt: string
  folderId?: string
  isFavorite: boolean
  tags: string[]
  prompt?: string
}

export interface AssetFolder {
  id: string
  name: string
  parentId?: string
  assetCount: number
  color?: string
}

export interface UploadProgress {
  id: string
  filename: string
  progress: number
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface StockSearchParams {
  query: string
  type: AssetType | 'all'
  page: number
  perPage: number
}

export interface StockSearchResult {
  assets: MediaAsset[]
  totalCount: number
  page: number
  hasMore: boolean
}

export interface AIGenerationRequest {
  prompt: string
  model: string
  assetType: 'image' | 'video'
  negativePrompt?: string
  style?: string
}

export interface AIGenerationResult {
  id: string
  prompt: string
  model: string
  asset: MediaAsset
  createdAt: string
}

export type SortField = 'name' | 'date' | 'size' | 'type'
export type SortDirection = 'asc' | 'desc'

export interface MediaFilter {
  searchQuery: string
  types: AssetType[]
  folderId: string | null
  favoritesOnly: boolean
  sortField: SortField
  sortDirection: SortDirection
  tags: string[]
  dateRange: [number, number] | null
}
