import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Palette, Sparkles, Image, PanelRightClose, PanelRightOpen, ChevronUp } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { usePanelResize } from '@/hooks/usePanelResize'
import { EditorHeader } from './editor-header'
import { Toolbar } from './toolbar'
import { VideoPreview } from './video-preview'
import { PlaybackControls } from './playback-controls'
import { TimelineEditor } from '@/components/timeline'
import { ExportCenterModal } from '@/components/export/export-center-modal'
import { StatusBar } from './status-bar'
import { TranscriptPanel } from './transcript-panel'
import { CaptionStylingPanel } from './caption-styling-panel'
import { AIAssistantPanel } from './ai-assistant-panel'
import { MediaAssetsPanel } from './media-assets-panel'

type RightTab = 'transcript' | 'properties' | 'ai' | 'media'

const RIGHT_TABS: { id: RightTab; label: string; icon: typeof MessageSquare | typeof Palette | typeof Sparkles | typeof Image }[] = [
  { id: 'transcript', label: 'Captions', icon: MessageSquare },
  { id: 'properties', label: 'Style', icon: Palette },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'media', label: 'Media', icon: Image },
]

export function EditorLayout() {
  const { id } = useParams<{ id: string }>()
  const loadProject = useEditorStore((s) => s.loadProject)
  const project = useEditorStore((s) => s.project)
  const [rightTab, setRightTab] = useState<RightTab>('transcript')

  const {
    rightPanelWidth,
    timelineHeight,
    isRightCollapsed,
    isTimelineCollapsed,
    startResizeRight,
    startResizeTimeline,
    toggleRightPanel,
    toggleTimeline,
  } = usePanelResize()

  useEffect(() => {
    if (id) loadProject(id)
  }, [id, loadProject])

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 min-w-0">
      <EditorHeader />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Toolbar />

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <div className="flex flex-1 min-h-0">
            <div className="flex flex-1 flex-col min-w-0 min-h-0">
              <VideoPreview />
              <PlaybackControls />
            </div>

            {/* Resize handle for right panel */}
            <div
              className="flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-transparent hover:bg-zinc-700/50 active:bg-zinc-600/50 transition-colors group"
              onMouseDown={startResizeRight}
            >
              <div className="h-8 w-0.5 rounded-full bg-zinc-700 group-hover:bg-zinc-500 transition-colors" />
            </div>

            {/* Right panel */}
            <div
              className="flex flex-col border-l border-zinc-800 bg-zinc-900/50 shrink-0 overflow-hidden transition-[width] duration-150 ease-out"
              style={{ width: isRightCollapsed ? 0 : rightPanelWidth }}
            >
              <div className="flex items-center border-b border-zinc-800 shrink-0">
                {RIGHT_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRightTab(tab.id)}
                      className={`flex flex-1 items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors ${
                        rightTab === tab.id
                          ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-600/5'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={toggleRightPanel}
                  className="flex size-7 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                  title="Toggle panel"
                >
                  <PanelRightClose className="size-3.5" />
                </button>
              </div>

              <div className="flex-1 min-h-0">
                {rightTab === 'transcript' && <TranscriptPanel />}
                {rightTab === 'properties' && <CaptionStylingPanel />}
                {rightTab === 'ai' && <AIAssistantPanel />}
                {rightTab === 'media' && <MediaAssetsPanel />}
              </div>
            </div>
          </div>

          {isRightCollapsed && (
            <button
              type="button"
              onClick={toggleRightPanel}
              className="absolute right-0 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-l border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
              title="Show panel"
            >
              <PanelRightOpen className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Resize handle for timeline */}
      <div
        className="flex h-1.5 shrink-0 cursor-row-resize items-center justify-center bg-transparent hover:bg-zinc-700/50 active:bg-zinc-600/50 transition-colors group"
        onMouseDown={startResizeTimeline}
      >
        <div className="w-8 h-0.5 rounded-full bg-zinc-700 group-hover:bg-zinc-500 transition-colors" />
      </div>

      {/* Timeline */}
      <div
        className="shrink-0 overflow-hidden transition-[height] duration-150 ease-out"
        style={{ height: isTimelineCollapsed ? 0 : timelineHeight }}
      >
        <div className="h-full overflow-y-auto">
          <TimelineEditor />
        </div>
      </div>

      {isTimelineCollapsed && (
        <button
          type="button"
          onClick={toggleTimeline}
          className="flex w-full items-center justify-center border-t border-zinc-800 bg-zinc-900/60 py-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
        >
          <ChevronUp className="size-3.5" />
        </button>
      )}

      <StatusBar />

      <ExportCenterModal />
    </div>
  )
}
