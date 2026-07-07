import { Sparkles, Image, Video, Loader2, Plus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIGenerationResult } from '@/services/media'

const MODELS = [
  { id: 'FLUX.2', name: 'FLUX.2' },
  { id: 'DALL-E 3', name: 'DALL-E 3' },
  { id: 'Stable Diffusion', name: 'Stable Diffusion' },
  { id: 'Pika 2.2', name: 'Pika 2.2' },
]

interface AIGeneratorProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  model: string
  onModelChange: (model: string) => void
  assetType: 'image' | 'video'
  onAssetTypeChange: (type: 'image' | 'video') => void
  isGenerating: boolean
  onGenerate: () => void
  result: AIGenerationResult | null
  history: AIGenerationResult[]
  onAddToProject: (assetId: string) => void
}

export function AIGenerator({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  assetType,
  onAssetTypeChange,
  isGenerating,
  onGenerate,
  result,
  history,
  onAddToProject,
}: AIGeneratorProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="space-y-2 border-b border-zinc-800 px-2 py-2">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the image or video you want to generate..."
          rows={3}
          className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800/50 p-2 text-[11px] text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
        />

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-zinc-700">
            <button
              type="button"
              onClick={() => onAssetTypeChange('image')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors',
                assetType === 'image'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <Image className="size-3" />
              Image
            </button>
            <button
              type="button"
              onClick={() => onAssetTypeChange('video')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors',
                assetType === 'video'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <Video className="size-3" />
              Video
            </button>
          </div>

          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-purple-500/50"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              Generate
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        {result && (
          <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-500/5 p-2">
            <p className="mb-1.5 text-[10px] font-medium text-purple-400">Generated Result</p>
            <div className="overflow-hidden rounded-md bg-zinc-800">
              <img
                src={result.asset.thumbnailUrl}
                alt={result.asset.filename}
                className="w-full aspect-video object-cover"
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAddToProject(result.asset.id)}
                className="flex items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-purple-500 transition-colors"
              >
                <Plus className="size-3" />
                Add to Project
              </button>
              <button
                type="button"
                onClick={onGenerate}
                className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="size-3" />
                Regenerate
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">History</p>
            <div className="grid grid-cols-2 gap-1.5">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="group relative overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/50"
                >
                  {h.asset.thumbnailUrl ? (
                    <img
                      src={h.asset.thumbnailUrl}
                      alt={h.asset.filename}
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-zinc-800">
                      <Image className="size-6 text-zinc-600" />
                    </div>
                  )}
                  <div className="px-1.5 py-1">
                    <p className="truncate text-[10px] text-zinc-400">{h.prompt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToProject(h.asset.id)}
                    className="absolute right-1 top-1 hidden rounded bg-purple-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white hover:bg-purple-500 group-hover:block"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && history.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Sparkles className="size-5 text-purple-400" />
            </div>
            <p className="mt-2 text-[11px] font-medium text-zinc-500">
              AI Media Generation
            </p>
            <p className="mt-1 text-[10px] text-zinc-600 max-w-[180px]">
              Describe what you want to create and AI will generate it for you.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
