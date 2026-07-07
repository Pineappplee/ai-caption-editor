import { useEffect, useCallback, useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { useMediaStore } from '@/stores/media-store'
import { SourceTabs } from '@/components/media/source-tabs'
import { FolderTree } from '@/components/media/folder-tree'
import { UploadToolbar } from '@/components/media/upload-toolbar'
import { AssetGrid } from '@/components/media/asset-grid'
import { UploadZone } from '@/components/media/upload-zone'
import { StockSearch } from '@/components/media/stock-search'
import { AIGenerator } from '@/components/media/ai-generator'
import { AssetPreviewModal } from '@/components/media/asset-preview-modal'
import { ContextMenu } from '@/components/media/context-menu'
import { useServices } from '@/services'

export function MediaAssetsPanel() {
  const services = useServices()
  const projectId = useEditorStore((s) => s.project?.id ?? '')
  const {
    assets,
    folders,
    filter,
    selectedAssetIds,
    previewAsset,
    uploads,
    sourceTab,
    isUploading,
    stockResults,
    stockQuery,
    stockCategory,
    aiPrompt,
    aiModel,
    aiAssetType,
    aiGenerating,
    aiGenerationResult,
    aiHistory,
    loading,
    contextMenu,
    loadAssets,
    loadFolders,
    setSearchQuery,
    setFolderFilter,
    setFavoritesOnly,
    setSort,
    toggleAssetSelection,
    clearSelection,
    setPreviewAsset,
    uploadFiles,
    deleteSelected,
    duplicateAsset,
    toggleFavorite,
    moveToFolder,
    createFolder,
    deleteFolder,
    setSourceTab,
    searchStock,
    setStockQuery,
    setStockCategory,
    setAIPrompt,
    setAIModel,
    setAIAssetType,
    generateAI,
    loadAIHistory,
    setContextMenu,
  } = useMediaStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (projectId) {
      loadAssets(projectId)
      loadFolders(projectId)
      loadAIHistory(projectId)
    }
  }, [projectId, loadAssets, loadFolders, loadAIHistory])

  useEffect(() => {
    if (projectId && sourceTab === 'upload') {
      loadAssets(projectId)
    }
  }, [
    sourceTab,
    filter.searchQuery,
    filter.favoritesOnly,
    filter.sortField,
    filter.sortDirection,
    filter.folderId,
    projectId,
    loadAssets,
  ])

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (!projectId) return
      uploadFiles(projectId, files)
    },
    [projectId, uploadFiles],
  )

  const handleContextMenuAction = useCallback(
    async (action: string, asset: { id: string }) => {
      switch (action) {
        case 'preview': {
          const found = assets.find((a) => a.id === asset.id)
          if (found) setPreviewAsset(found)
          break
        }
        case 'rename': {
          const name = prompt('Rename file:', assets.find((a) => a.id === asset.id)?.filename ?? '')
          if (name && name.trim()) {
            useMediaStore.getState().renameAsset(asset.id, name.trim())
            if (projectId) loadAssets(projectId)
          }
          break
        }
        case 'duplicate':
          await duplicateAsset(asset.id)
          break
        case 'toggle-favorite':
          await toggleFavorite(asset.id)
          break
        case 'delete':
          clearSelection()
          toggleAssetSelection(asset.id)
          if (projectId) await deleteSelected(projectId)
          break
        case 'add-to-timeline':
          // In a real app, this would add the asset to the timeline
          break
        case 'download':
          // In a real app, this would trigger a download
          break
        case 'move-to-folder': {
          const folderId = prompt('Enter folder ID to move to (or leave blank for root):')
          if (folderId !== null) {
            moveToFolder([asset.id], folderId || null)
          }
          break
        }
        case 'add-tags': {
          const tagsStr = prompt('Enter tags (comma separated):')
          if (tagsStr) {
            const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
            if (tags.length > 0) {
              const service = services.media
              await service.addTags(asset.id, tags)
              if (projectId) loadAssets(projectId)
            }
          }
          break
        }
        default:
          break
      }
    },
    [assets, projectId, loadAssets, duplicateAsset, toggleFavorite, clearSelection, toggleAssetSelection, deleteSelected, setPreviewAsset, moveToFolder, services],
  )

  const handleStockSearch = useCallback(() => {
    searchStock({ query: stockQuery })
  }, [searchStock, stockQuery])

  const handleCreateFolder = useCallback(() => {
    if (!projectId) return
    const name = prompt('Folder name:')
    if (name && name.trim()) createFolder(projectId, name.trim())
  }, [projectId, createFolder])

  const handleDeleteFolder = useCallback(
    (id: string) => {
      if (!projectId) return
      if (confirm('Delete this folder? Files will be unassigned.')) deleteFolder(projectId, id)
    },
    [projectId, deleteFolder],
  )

  const handleRenameFolder = useCallback(
    (_id: string, _name: string) => {
      // handled inline in folder-tree
    },
    [],
  )

  const handleGenerateAI = useCallback(() => {
    if (!projectId) return
    generateAI(projectId)
  }, [projectId, generateAI])

  const handleAddAIToProject = useCallback(
    (_assetId: string) => {
      // In a real app, this would add the AI-generated asset to the project's uploads
      setSourceTab('upload')
    },
    [setSourceTab],
  )

  const selectedCount = selectedAssetIds.length

  return (
    <div className="flex h-full flex-col">
      {/* Source tabs: Upload / Stock / AI Gen */}
      <SourceTabs activeTab={sourceTab} onTabChange={setSourceTab} />

      {/* Selection bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1 border-b border-zinc-800 bg-blue-500/10 px-2 py-1">
          <Check className="size-3 text-blue-400" />
          <span className="flex-1 text-[10px] font-medium text-blue-400">{selectedCount} selected</span>
          <button
            type="button"
            onClick={clearSelection}
            className="flex size-5 items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Upload tab */}
      {sourceTab === 'upload' && (
        <div className="flex flex-1 flex-col min-h-0">
          {/* Folder tree */}
          <FolderTree
            folders={folders}
            selectedFolderId={filter.folderId}
            onSelectFolder={setFolderFilter}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
          />

          {/* Search / sort / filter toolbar */}
          <UploadToolbar
            searchQuery={filter.searchQuery}
            onSearchChange={setSearchQuery}
            favoritesOnly={filter.favoritesOnly}
            onToggleFavorites={() => setFavoritesOnly(!filter.favoritesOnly)}
            sortField={filter.sortField}
            sortDirection={filter.sortDirection}
            onSortChange={setSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Asset grid */}
          <div className="flex-1 overflow-y-auto min-h-0" onScroll={() => setContextMenu(null)}>
            <AssetGrid
              assets={assets}
              loading={loading}
              selectedIds={selectedAssetIds}
              onSelect={toggleAssetSelection}
              onDoubleClick={(a) => setPreviewAsset(a)}
              onContextMenu={(e, a) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, asset: a })
                if (!selectedAssetIds.includes(a.id)) {
                  clearSelection()
                  toggleAssetSelection(a.id)
                }
              }}
              onToggleFavorite={toggleFavorite}
              onDragStart={() => {}}
            />
          </div>

          {/* Upload zone */}
          <UploadZone
            onFilesSelected={handleFilesSelected}
            uploads={uploads}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Stock tab */}
      {sourceTab === 'stock' && (
        <div className="flex flex-1 flex-col min-h-0">
          <StockSearch
            query={stockQuery}
            onQueryChange={setStockQuery}
            category={stockCategory}
            onCategoryChange={setStockCategory}
            onSearch={handleStockSearch}
          />
          <div className="flex-1 overflow-y-auto min-h-0">
            {stockResults === null && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-800/50">
                  <svg className="size-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <p className="mt-3 text-[11px] font-medium text-zinc-500">Search Stock Footage</p>
                <p className="mt-1 text-[10px] text-zinc-600 max-w-[180px]">
                  Find the perfect video clips and images for your project.
                </p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
            {stockResults && stockResults.assets.length > 0 && (
              <AssetGrid
                assets={stockResults.assets}
                loading={false}
                selectedIds={selectedAssetIds}
                onSelect={toggleAssetSelection}
                onDoubleClick={(a) => setPreviewAsset(a)}
                onContextMenu={(e, a) => {
                  e.preventDefault()
                  setContextMenu({ x: e.clientX, y: e.clientY, asset: a })
                }}
                onToggleFavorite={toggleFavorite}
                onDragStart={() => {}}
              />
            )}
            {stockResults && stockResults.assets.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[11px] text-zinc-500">No stock results found</p>
                <p className="mt-1 text-[10px] text-zinc-600">Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Gen tab */}
      {sourceTab === 'ai' && (
        <AIGenerator
          prompt={aiPrompt}
          onPromptChange={setAIPrompt}
          model={aiModel}
          onModelChange={setAIModel}
          assetType={aiAssetType}
          onAssetTypeChange={setAIAssetType}
          isGenerating={aiGenerating}
          onGenerate={handleGenerateAI}
          result={aiGenerationResult}
          history={aiHistory}
          onAddToProject={handleAddAIToProject}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          asset={contextMenu.asset}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Preview modal */}
      {previewAsset && (
        <AssetPreviewModal
          asset={previewAsset}
          onClose={() => setPreviewAsset(null)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}
