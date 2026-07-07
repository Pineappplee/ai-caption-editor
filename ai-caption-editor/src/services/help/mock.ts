import type { DocSection, DocContent, FAQItem, ReleaseNote, TutorialItem } from './types'
import { HELP_SECTIONS, TUTORIALS } from './types'
import type { IHelpService } from './interface'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const MOCK_FAQS: FAQItem[] = [
  { id: 'faq-1', question: 'What video formats are supported?', answer: 'MP4, MOV, WebM, and AVI. Audio: MP3, WAV, AAC, FLAC.', category: 'general' },
  { id: 'faq-2', question: 'How accurate is auto-transcription?', answer: 'Over 95% for clear speech. Accuracy varies with noise and accents.', category: 'transcription' },
  { id: 'faq-3', question: 'Can I export captions without video?', answer: 'Yes. Export as SRT, VTT, ASS, TXT, or JSON standalone files.', category: 'export' },
  { id: 'faq-4', question: 'How do I translate captions?', answer: 'Use the AI Assistant with a translation prompt.', category: 'translation' },
  { id: 'faq-5', question: 'Is there a file size limit?', answer: 'Pro: 4GB per file. Free: 500MB per file.', category: 'limits' },
]

const MOCK_RELEASE_NOTES: ReleaseNote[] = [
  { version: '1.2.0', date: '2026-07-01', title: 'Timeline Improvements', changes: [{ type: 'feature', description: 'Multi-track timeline support' }, { type: 'feature', description: 'Waveform visualization' }, { type: 'improvement', description: 'Snap-to-grid behavior' }, { type: 'feature', description: 'Keyboard shortcut customization' }] },
  { version: '1.1.0', date: '2026-06-15', title: 'AI Enhancements', changes: [{ type: 'feature', description: 'AI caption suggestions' }, { type: 'feature', description: 'Translation support' }, { type: 'feature', description: 'AI media generation panel' }] },
  { version: '1.0.0', date: '2026-06-01', title: 'Initial Release', changes: [{ type: 'feature', description: 'Auto-transcription engine' }, { type: 'feature', description: 'Caption editing and styling' }, { type: 'feature', description: 'Multi-format export' }] },
]

export class MockHelpService implements IHelpService {
  async getSections(): Promise<DocSection[]> {
    await sleep(100)
    return HELP_SECTIONS
  }

  async getSection(id: string): Promise<DocSection | null> {
    await sleep(50)
    return HELP_SECTIONS.find((s) => s.id === id) ?? null
  }

  async search(query: string): Promise<{ sectionId: string; content: DocContent }[]> {
    await sleep(200)
    const q = query.toLowerCase()
    const results: { sectionId: string; content: DocContent }[] = []
    for (const section of HELP_SECTIONS) {
      for (const content of section.content) {
        if (content.title.toLowerCase().includes(q) || content.body.toLowerCase().includes(q)) {
          results.push({ sectionId: section.id, content })
        }
      }
    }
    return results
  }

  async getFAQs(): Promise<FAQItem[]> {
    await sleep(80)
    return MOCK_FAQS
  }

  async getFAQsByCategory(category: string): Promise<FAQItem[]> {
    await sleep(50)
    return MOCK_FAQS.filter((f) => f.category === category)
  }

  async getReleaseNotes(): Promise<ReleaseNote[]> {
    await sleep(80)
    return MOCK_RELEASE_NOTES
  }

  async getTutorials(): Promise<TutorialItem[]> {
    await sleep(80)
    return TUTORIALS
  }
}
