import { Search, X, ArrowUpDown, Languages, Filter, Replace } from 'lucide-react'
import { useTranscriptStore } from '@/stores/transcript-store'
import type { LineFilter } from '@/services/transcript'
import { useCallback, useEffect, useRef } from 'react'

const FILTERS: { value: LineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high-confidence', label: 'High conf.' },
  { value: 'low-confidence', label: 'Low conf.' },
  { value: 'needs-review', label: 'Needs review' },
]

const LANGUAGES = [
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
  { value: 'fr', label: 'FR' },
  { value: 'de', label: 'DE' },
  { value: 'zh', label: 'ZH' },
]

export function TranscriptToolbar() {
  const searchQuery = useTranscriptStore((s) => s.searchQuery)
  const replaceQuery = useTranscriptStore((s) => s.replaceQuery)
  const activeFilter = useTranscriptStore((s) => s.activeFilter)
  const isSearchOpen = useTranscriptStore((s) => s.isSearchOpen)
  const isReplaceOpen = useTranscriptStore((s) => s.isReplaceOpen)
  const searchResults = useTranscriptStore((s) => s.searchResults)
  const searchIndex = useTranscriptStore((s) => s.searchIndex)
  const language = useTranscriptStore((s) => s.language)

  const setSearchQuery = useTranscriptStore((s) => s.setSearchQuery)
  const setReplaceQuery = useTranscriptStore((s) => s.setReplaceQuery)
  const setActiveFilter = useTranscriptStore((s) => s.setActiveFilter)
  const toggleSearch = useTranscriptStore((s) => s.toggleSearch)
  const toggleReplace = useTranscriptStore((s) => s.toggleReplace)
  const setLanguage = useTranscriptStore((s) => s.setLanguage)
  const search = useTranscriptStore((s) => s.search)
  const nextMatch = useTranscriptStore((s) => s.nextMatch)
  const prevMatch = useTranscriptStore((s) => s.prevMatch)
  const replaceCurrent = useTranscriptStore((s) => s.replaceCurrent)
  const replaceAll = useTranscriptStore((s) => s.replaceAll)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) prevMatch()
      else nextMatch()
    }
    if (e.key === 'Escape') toggleSearch()
  }, [nextMatch, prevMatch, toggleSearch])

  return (
    <div className="border-b border-zinc-800">
      {/* Search bar */}
      {isSearchOpen && (
        <div className="border-b border-zinc-800 px-2 py-1.5">
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); search() }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search transcript..."
                className="w-full rounded border border-zinc-700 bg-zinc-800/50 py-1 pl-7 pr-2 text-[11px] text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setReplaceQuery(''); search() }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 tabular-nums min-w-[4ch] text-center">
              {searchResults.length > 0 ? `${searchIndex + 1}/${searchResults.length}` : ''}
            </span>
            {searchResults.length > 0 && (
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={prevMatch}
                  className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
                  title="Previous match (Shift+Enter)"
                >
                  <ArrowUpDown className="size-3 -rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={nextMatch}
                  className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
                  title="Next match (Enter)"
                >
                  <ArrowUpDown className="size-3 rotate-90" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={toggleReplace}
              className={`flex size-5 items-center justify-center rounded ${isReplaceOpen ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200'}`}
              title="Replace"
            >
              <Replace className="size-3" />
            </button>
            <button
              type="button"
              onClick={toggleSearch}
              className="flex size-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
              title="Close search"
            >
              <X className="size-3" />
            </button>
          </div>

          {/* Replace bar */}
          {isReplaceOpen && (
            <div className="mt-1 flex items-center gap-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') replaceCurrent(); if (e.key === 'Escape') toggleReplace() }}
                  placeholder="Replace with..."
                  className="w-full rounded border border-zinc-700 bg-zinc-800/50 py-1 pl-2 pr-2 text-[11px] text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500/50"
                />
              </div>
              <button
                type="button"
                onClick={replaceCurrent}
                disabled={searchResults.length === 0}
                className="rounded bg-blue-600/20 px-2 py-1 text-[10px] text-blue-400 hover:bg-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={replaceAll}
                disabled={!searchQuery}
                className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter + Language row */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-1">
          <Filter className="size-3 text-zinc-500" />
          <div className="flex gap-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                  activeFilter === f.value
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Languages className="size-3 text-zinc-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none rounded border border-zinc-700 bg-zinc-800/50 px-1.5 py-0.5 text-[9px] text-zinc-400 outline-none cursor-pointer hover:text-zinc-200"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
