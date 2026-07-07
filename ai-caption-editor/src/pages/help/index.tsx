import { useEffect, useState } from 'react'
import {
  Compass, BookOpen, FileText, Keyboard, HelpCircle, Megaphone,
  Bug, Lightbulb, Users, Info, ExternalLink, ChevronRight, Star,
  Clock, MessageSquare, Globe, Code, Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HELP_SECTIONS, TUTORIALS } from '@/services/help'
import type { DocContent, ReleaseNote } from '@/services/help'
import { useServices } from '@/services'

type HelpTab = 'docs' | 'tutorials' | 'faq' | 'release-notes' | 'community' | 'about'

const NAV_ITEMS: { id: HelpTab; label: string; icon: typeof Compass }[] = [
  { id: 'docs', label: 'Documentation', icon: FileText },
  { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'release-notes', label: 'Release Notes', icon: Megaphone },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'about', label: 'About', icon: Info },
]

const SECTION_NAV: { id: string; label: string; icon: typeof Compass }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: Compass },
  { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'release-notes', label: 'Release Notes', icon: Megaphone },
  { id: 'report-bug', label: 'Report a Bug', icon: Bug },
  { id: 'request-feature', label: 'Request a Feature', icon: Lightbulb },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'about', label: 'About', icon: Info },
]

function ContentRenderer({ content }: { content: DocContent }) {
  return (
    <div className="mb-6 last:mb-0">
      {content.type === 'tip' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2.5">
            <Star className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">{content.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{content.body}</p>
            </div>
          </div>
        </div>
      )}
      {content.type === 'warning' && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs font-bold">!</div>
            <div>
              <p className="text-sm font-medium text-red-300">{content.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{content.body}</p>
            </div>
          </div>
        </div>
      )}
      {content.type === 'code' && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-zinc-200">{content.title}</p>
          <pre className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-300 font-mono">{content.body}</pre>
        </div>
      )}
      {content.type === 'steps' && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-zinc-200">{content.title}</p>
          {content.body && <p className="mb-3 text-sm text-zinc-400">{content.body}</p>}
          <ol className="space-y-2">
            {content.steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      {content.type === 'list' && (
        <div>
          {content.title && <p className="mb-1.5 text-sm font-medium text-zinc-200">{content.title}</p>}
          {content.body && <p className="mb-3 text-sm text-zinc-400">{content.body}</p>}
          <ul className="space-y-1.5">
            {content.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-purple-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(content.type === 'text' || !content.type) && (
        <div>
          {content.title && <p className="mb-1.5 text-sm font-medium text-zinc-200">{content.title}</p>}
          {content.body && <p className="text-sm text-zinc-400 leading-relaxed">{content.body}</p>}
        </div>
      )}
    </div>
  )
}

function OnboardingCard() {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-300">
        <Compass className="size-4" />
        Welcome to AI Caption Editor
      </h3>
      <p className="mt-1.5 text-sm text-zinc-400">
        New here? Start with the Getting Started guide to learn the basics, or browse tutorials to master advanced features.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-400">
          🌟 5 min quick start
        </span>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400">
          📖 12 documentation articles
        </span>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
          ⌨️ 15 keyboard shortcuts
        </span>
      </div>
    </div>
  )
}

function ContextualHelpCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
          <MessageSquare className="size-4 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">Need help right now?</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Search the documentation, ask the community, or report an issue. We are here to help.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Bug className="size-3" />
              Report Bug
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Lightbulb className="size-3" />
              Feature Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentationView({ activeDocSection, setActiveDocSection }: { activeDocSection: string; setActiveDocSection: (id: string) => void }) {
  const section = HELP_SECTIONS.find((s) => s.id === activeDocSection)

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-52 shrink-0 border-r border-zinc-800 overflow-y-auto">
        <div className="px-3 py-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Sections</p>
        </div>
        <nav className="px-2 pb-2 space-y-0.5">
          {SECTION_NAV.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDocSection(item.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  activeDocSection === item.id
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <OnboardingCard />
        <div className="mt-5 space-y-5">
          {section ? (
            section.content.map((content) => (
              <ContentRenderer key={content.id} content={content} />
            ))
          ) : (
            <p className="text-sm text-zinc-500">Select a section from the sidebar.</p>
          )}
        </div>
        <div className="mt-6">
          <ContextualHelpCard />
        </div>
      </div>
    </div>
  )
}

function TutorialsView() {
  const difficultyColor = { beginner: 'text-green-400 bg-green-500/10', intermediate: 'text-amber-400 bg-amber-500/10', advanced: 'text-red-400 bg-red-500/10' }

  const grouped = TUTORIALS.reduce<Record<string, typeof TUTORIALS>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Tutorials</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Step-by-step guides to help you master every feature.</p>
      </div>
      {Object.entries(grouped).map(([category, tutorials]) => (
        <div key={category}>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">{category}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-700 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-zinc-200">{tutorial.title}</h4>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-600" />
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{tutorial.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                    <Clock className="size-3" />
                    {tutorial.duration}
                  </span>
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', difficultyColor[tutorial.difficulty])}>
                    {tutorial.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FAQView() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [faqCategory, setFaqCategory] = useState<string | null>(null)

  const faqs = HELP_SECTIONS.find((s) => s.id === 'faq')?.content ?? []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Frequently Asked Questions</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Quick answers to common questions.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFaqCategory(null)}
          className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', !faqCategory ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300')}
        >
          All
        </button>
        {['general', 'export', 'transcription', 'translation', 'limits'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFaqCategory(cat)}
            className={cn('rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors', faqCategory === cat ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300')}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/30 transition-colors"
            >
              {faq.title}
              <ChevronRight className={cn('size-4 shrink-0 text-zinc-500 transition-transform', openId === faq.id && 'rotate-90')} />
            </button>
            {openId === faq.id && (
              <div className="border-t border-zinc-800 px-4 py-3">
                <p className="text-sm text-zinc-400">{faq.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ReleaseNotesView() {
  const { help: service } = useServices()
  const [notes, setNotes] = useState<ReleaseNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    service.getReleaseNotes().then((n) => { setNotes(n); setLoading(false) })
  }, [service])

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" /></div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Release Notes</h2>
        <p className="mt-0.5 text-sm text-zinc-500">What is new in each version.</p>
      </div>
      {notes.map((note) => (
        <div key={note.version} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">{note.title}</h3>
              <p className="text-xs text-zinc-500">v{note.version} &middot; {new Date(note.date).toLocaleDateString()}</p>
            </div>
            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">v{note.version}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {note.changes.map((change, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                {change.type === 'feature' && <span className="mt-0.5 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400 shrink-0">New</span>}
                {change.type === 'improvement' && <span className="mt-0.5 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 shrink-0">Improved</span>}
                {change.type === 'fix' && <span className="mt-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 shrink-0">Fix</span>}
                <span className="text-zinc-400">{change.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CommunityView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Community</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Connect with other users and contribute to the project.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href="#" className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
            <Code className="size-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">GitHub Repository</p>
            <p className="text-xs text-zinc-500">Browse source code, report issues, contribute</p>
          </div>
          <ExternalLink className="size-4 shrink-0 text-zinc-600" />
        </a>
        <a href="#" className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
            <MessageSquare className="size-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">Discord Server</p>
            <p className="text-xs text-zinc-500">Chat with the community and get help</p>
          </div>
          <ExternalLink className="size-4 shrink-0 text-zinc-600" />
        </a>
        <a href="#" className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
            <Globe className="size-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">Twitter / X</p>
            <p className="text-xs text-zinc-500">Follow for updates and tips</p>
          </div>
          <ExternalLink className="size-4 shrink-0 text-zinc-600" />
        </a>
        <a href="#" className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
            <Video className="size-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">YouTube Channel</p>
            <p className="text-xs text-zinc-500">Video tutorials and demos</p>
          </div>
          <ExternalLink className="size-4 shrink-0 text-zinc-600" />
        </a>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-sm font-semibold text-zinc-100">Get Involved</h3>
        <p className="mt-1 text-sm text-zinc-500">
          We welcome contributions of all kinds. Whether you are reporting a bug, suggesting a feature,
          or contributing code, your help makes this project better for everyone.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-400">
            🌟 Star on GitHub
          </span>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400">
            🐛 Report a Bug
          </span>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
            💡 Feature Request
          </span>
        </div>
      </div>
    </div>
  )
}

function AboutView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">About</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Application information and licenses.</p>
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex size-14 items-center justify-center rounded-xl bg-purple-600">
          <span className="text-2xl font-bold text-white">AC</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-100">AI Caption Editor</h3>
          <p className="text-sm text-zinc-500">Version 1.2.0</p>
          <p className="text-xs text-zinc-600">Build 2026.07.01 &middot; MIT License</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs text-zinc-500">Engine</p>
          <p className="text-sm font-medium text-zinc-200">React + Vite + TypeScript</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs text-zinc-500">Styling</p>
          <p className="text-sm font-medium text-zinc-200">Tailwind CSS + shadcn/ui</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs text-zinc-500">State</p>
          <p className="text-sm font-medium text-zinc-200">Zustand</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-xs text-zinc-500">Routing</p>
          <p className="text-sm font-medium text-zinc-200">React Router v7</p>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-sm font-semibold text-zinc-100">Open Source Licenses</h3>
        <p className="mt-1 text-sm text-zinc-500">
          This application is licensed under the MIT License. The following open-source components are used:
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
          {['React (MIT)', 'Vite (MIT)', 'TypeScript (Apache 2.0)', 'Tailwind CSS (MIT)', 'Zustand (MIT)', 'Lucide Icons (ISC)', 'Radix UI (MIT)', 'shadcn/ui (MIT)'].map((lib) => (
            <p key={lib} className="text-xs text-zinc-600">{lib}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

const TAB_RENDERERS: Record<HelpTab, (props: { activeDocSection: string; setActiveDocSection: (id: string) => void }) => React.ReactNode> = {
  docs: DocumentationView,
  tutorials: TutorialsView,
  faq: FAQView,
  'release-notes': ReleaseNotesView,
  community: CommunityView,
  about: AboutView,
}

export function HelpPage() {
  const [activeTab, setActiveTab] = useState<HelpTab>('docs')
  const [activeDocSection, setActiveDocSection] = useState('getting-started')

  const Renderer = TAB_RENDERERS[activeTab]

  return (
    <div className="flex h-full min-h-0">
      {/* Left nav */}
      <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/30">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Help</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3 shrink-0">
          <h1 className="text-sm font-semibold text-zinc-100">
            {NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'Help'}
          </h1>
        </div>
        <div className="flex-1 min-h-0">
          <Renderer activeDocSection={activeDocSection} setActiveDocSection={setActiveDocSection} />
        </div>
      </div>
    </div>
  )
}
