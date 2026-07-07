import { create } from 'zustand'
import { services } from '@/services'
import type {
  MediaAsset,
  AssetFolder,
  UploadProgress,
  StockSearchParams,
  StockSearchResult,
  AIGenerationResult,
  MediaFilter,
  SortField,
  SortDirection,
  AssetType,
} from '@/services/media'

const service = services.media

interface MediaState {
  assets: MediaAsset[]
  folders: AssetFolder[]
  filter: MediaFilter
  selectedAssetIds: string[]
  previewAsset: MediaAsset | null
  uploads: UploadProgress[]
  sourceTab: 'upload' | 'stock' | 'ai'
  isUploading: boolean

  stockResults: StockSearchResult | null
  stockQuery: string
  stockCategory: string | null

  aiPrompt: string
  aiModel: string
  aiAssetType: 'image' | 'video'
  aiGenerating: boolean
  aiGenerationResult: AIGenerationResult | null
  aiHistory: AIGenerationResult[]

  loading: boolean
  contextMenu: { x: number; y: number; asset: MediaAsset } | null

  loadAssets: (projectId: string) => Promise<void>
  loadFolders: (projectId: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setTypeFilter: (types: AssetType[]) => void
  setFolderFilter: (folderId: string | null) => void
  setFavoritesOnly: (only: boolean) => void
  setSort: (field: SortField, direction: SortDirection) => void
  toggleAssetSelection: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setPreviewAsset: (asset: MediaAsset | null) => void

  uploadFiles: (projectId: string, files: File[]) => Promise<void>
  deleteSelected: (projectId: string) => Promise<void>
  renameAsset: (id: string, name: string) => Promise<void>
  duplicateAsset: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  moveToFolder: (assetIds: string[], folderId: string | null) => Promise<void>

  createFolder: (projectId: string, name: string) => Promise<void>
  deleteFolder: (projectId: string, id: string) => Promise<void>

  setSourceTab: (tab: 'upload' | 'stock' | 'ai') => void
  searchStock: (params: Partial<StockSearchParams>) => Promise<void>
  setStockQuery: (query: string) => void
  setStockCategory: (id: string | null) => void

  setAIPrompt: (prompt: string) => void
  setAIModel: (model: string) => void
  setAIAssetType: (type: 'image' | 'video') => void
  generateAI: (projectId: string) => Promise<void>
  loadAIHistory: (projectId: string) => Promise<void>

  setContextMenu: (menu: { x: number; y: number; asset: MediaAsset } | null) => void
}

const defaultFilter: MediaFilter = {
  searchQuery: '',
  types: [],
  folderId: null,
  favoritesOnly: false,
  sortField: 'date',
  sortDirection: 'desc',
  tags: [],
  dateRange: null,
}

export const useMediaStore = create<MediaState>((set, get) => ({
  assets: [],
  folders: [],
  filter: { ...defaultFilter },
  selectedAssetIds: [],
  previewAsset: null,
  uploads: [],
  sourceTab: 'upload',
  isUploading: false,

  stockResults: null,
  stockQuery: '',
  stockCategory: null,

  aiPrompt: '',
  aiModel: 'FLUX.2',
  aiAssetType: 'image',
  aiGenerating: false,
  aiGenerationResult: null,
  aiHistory: [],

  loading: false,
  contextMenu: null,

  loadAssets: async (projectId: string) => {
    set({ loading: true })
    const assets = await service.getAssets(projectId, get().filter)
    set({ assets, loading: false })
  },

  loadFolders: async (projectId: string) => {
    const folders = await service.getFolders(projectId)
    set({ folders })
  },

  setSearchQuery: (query: string) => {
    set((s) => ({ filter: { ...s.filter, searchQuery: query } }))
  },

  setTypeFilter: (types: AssetType[]) => {
    set((s) => ({ filter: { ...s.filter, types } }))
  },

  setFolderFilter: (folderId: string | null) => {
    set((s) => ({ filter: { ...s.filter, folderId } }))
  },

  setFavoritesOnly: (only: boolean) => {
    set((s) => ({ filter: { ...s.filter, favoritesOnly: only } }))
  },

  setSort: (field: SortField, direction: SortDirection) => {
    set((s) => ({ filter: { ...s.filter, sortField: field, sortDirection: direction } }))
  },

  toggleAssetSelection: (id: string) => {
    set((s) => ({
      selectedAssetIds: s.selectedAssetIds.includes(id)
        ? s.selectedAssetIds.filter((i) => i !== id)
        : [...s.selectedAssetIds, id],
    }))
  },

  selectAll: () => {
    set((s) => ({ selectedAssetIds: s.assets.map((a) => a.id) }))
  },

  clearSelection: () => set({ selectedAssetIds: [] }),

  setPreviewAsset: (asset: MediaAsset | null) => set({ previewAsset: asset }),

  uploadFiles: async (projectId: string, files: File[]) => {
    set({ isUploading: true })
    const uploads: UploadProgress[] = files.map((f) => ({
      id: `temp-${Date.now()}-${f.name}`,
      filename: f.name,
      progress: 0,
      status: 'queued',
    }))
    set({ uploads })
    try {
      for await (const progress of service.uploadFiles(projectId, files)) {
        set((s) => ({
          uploads: s.uploads.map((u) => (u.id === progress.id ? progress : u)),
        }))
      }
      await get().loadAssets(projectId)
    } finally {
      set({ isUploading: false })
    }
  },

  deleteSelected: async (projectId: string) => {
    const ids = get().selectedAssetIds
    if (ids.length === 0) return
    await service.deleteAssets(ids)
    set({ selectedAssetIds: [] })
    await get().loadAssets(projectId)
  },

  renameAsset: async (id: string, name: string) => {
    await service.renameAsset(id, name)
    const pid = '' // projectId not stored, but loadAssets will refresh
    await get().loadAssets(pid)
  },

  duplicateAsset: async (id: string) => {
    await service.duplicateAsset(id)
    await get().loadAssets('')
  },

  toggleFavorite: async (id: string) => {
    await service.toggleFavorite(id)
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)),
    }))
  },

  moveToFolder: async (assetIds: string[], folderId: string | null) => {
    await service.moveAssetsToFolder(assetIds, folderId)
    set({ selectedAssetIds: [] })
    await get().loadAssets('')
  },

  createFolder: async (projectId: string, name: string) => {
    await service.createFolder(projectId, name)
    await get().loadFolders(projectId)
  },

  deleteFolder: async (projectId: string, id: string) => {
    await service.deleteFolder(id)
    await get().loadFolders(projectId)
    await get().loadAssets(projectId)
  },

  setSourceTab: (tab: 'upload' | 'stock' | 'ai') => set({ sourceTab: tab }),

  searchStock: async (params: Partial<StockSearchParams>) => {
    const q = get().stockQuery
    const result = await service.searchStock({
      query: q,
      type: 'all',
      page: 1,
      perPage: 20,
      ...params,
    })
    set({ stockResults: result })
  },

  setStockQuery: (query: string) => set({ stockQuery: query }),

  setStockCategory: (id: string | null) => set({ stockCategory: id }),

  setAIPrompt: (prompt: string) => set({ aiPrompt: prompt }),
  setAIModel: (model: string) => set({ aiModel: model }),
  setAIAssetType: (type: 'image' | 'video') => set({ aiAssetType: type }),

  generateAI: async (projectId: string) => {
    const { aiPrompt, aiModel, aiAssetType } = get()
    if (!aiPrompt.trim()) return
    set({ aiGenerating: true, aiGenerationResult: null })
    try {
      for await (const _progress of service.generateAI({
        prompt: aiPrompt,
        model: aiModel,
        assetType: aiAssetType,
      })) {
        // progress could update UI if needed
      }
      const history = await service.getGenerationHistory(projectId)
      const latest = history[0] ?? null
      set({ aiGenerating: false, aiGenerationResult: latest, aiHistory: history })
    } catch {
      set({ aiGenerating: false })
    }
  },

  loadAIHistory: async (projectId: string) => {
    const history = await service.getGenerationHistory(projectId)
    set({ aiHistory: history })
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),
}))
