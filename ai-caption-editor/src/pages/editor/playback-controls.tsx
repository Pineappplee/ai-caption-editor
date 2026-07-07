import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'

export function PlaybackControls() {
  const currentTime = useEditorStore((s) => s.currentTime)
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime)
  const playbackState = useEditorStore((s) => s.playbackState)
  const setPlaybackState = useEditorStore((s) => s.setPlaybackState)
  const volume = useEditorStore((s) => s.volume)
  const setVolume = useEditorStore((s) => s.setVolume)
  const isMuted = useEditorStore((s) => s.isMuted)
  const toggleMute = useEditorStore((s) => s.toggleMute)
  const project = useEditorStore((s) => s.project)
  const formatTime = useEditorStore((s) => s.formatTime)

  if (!project) return null

  return (
    <div className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
      <button
        type="button"
        onClick={() => setCurrentTime(0)}
        className="flex size-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      >
        <SkipBack className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setPlaybackState(playbackState === 'playing' ? 'paused' : 'playing')}
        className="flex size-7 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {playbackState === 'playing' ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
      </button>

      <button
        type="button"
        className="flex size-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      >
        <SkipForward className="size-3.5" />
      </button>

      <div className="h-4 w-px bg-zinc-800" />

      <span className="min-w-[90px] text-center text-[11px] text-zinc-400 font-mono tabular-nums">
        {formatTime(currentTime)} / {formatTime(project.duration)}
      </span>

      <input
        type="range"
        min={0}
        max={project.duration}
        step={0.01}
        value={currentTime}
        onChange={(e) => setCurrentTime(Number(e.target.value))}
        className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-600 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
      />

      <div className="h-4 w-px bg-zinc-800" />

      <button
        type="button"
        onClick={toggleMute}
        className="flex size-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      >
        {isMuted || volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={isMuted ? 0 : volume}
        onChange={(e) => {
          setVolume(Number(e.target.value))
          if (Number(e.target.value) > 0 && isMuted) toggleMute()
        }}
        className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-600 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
      />
    </div>
  )
}
