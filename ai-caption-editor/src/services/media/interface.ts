import type {
  MediaAsset,
  AssetFolder,
  UploadProgress,
  StockSearchParams,
  StockSearchResult,
  AIGenerationRequest,
  AIGenerationResult,
  MediaFilter,
} from './types'

export interface IMediaService {
  getAssets(projectId: string, filter: MediaFilter): Promise<MediaAsset[]>
  getAsset(id: string): Promise<MediaAsset | null>
  uploadFiles(projectId: string, files: File[]): AsyncGenerator<UploadProgress, MediaAsset[], unknown>
  deleteAssets(ids: string[]): Promise<void>
  renameAsset(id: string, name: string): Promise<MediaAsset>
  duplicateAsset(id: string): Promise<MediaAsset>
  toggleFavorite(id: string): Promise<MediaAsset>
  addTags(id: string, tags: string[]): Promise<MediaAsset>
  removeTags(id: string, tags: string[]): Promise<MediaAsset>

  getFolders(projectId: string): Promise<AssetFolder[]>
  createFolder(projectId: string, name: string, parentId?: string): Promise<AssetFolder>
  deleteFolder(id: string): Promise<void>
  renameFolder(id: string, name: string): Promise<AssetFolder>
  moveAssetsToFolder(assetIds: string[], folderId: string | null): Promise<void>

  searchStock(params: StockSearchParams): Promise<StockSearchResult>
  getStockCategories(): Promise<{ id: string; name: string; count: number }[]>

  generateAI(request: AIGenerationRequest): AsyncGenerator<{ status: string; progress: number }, AIGenerationResult, unknown>
  getGenerationHistory(projectId: string): Promise<AIGenerationResult[]>
}
