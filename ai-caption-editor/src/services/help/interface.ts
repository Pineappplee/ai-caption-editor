import type { DocSection, DocContent, FAQItem, ReleaseNote, TutorialItem } from './types'

export interface IHelpService {
  getSections(): Promise<DocSection[]>
  getSection(id: string): Promise<DocSection | null>
  search(query: string): Promise<{ sectionId: string; content: DocContent }[]>
  getFAQs(): Promise<FAQItem[]>
  getFAQsByCategory(category: string): Promise<FAQItem[]>
  getReleaseNotes(): Promise<ReleaseNote[]>
  getTutorials(): Promise<TutorialItem[]>
}
