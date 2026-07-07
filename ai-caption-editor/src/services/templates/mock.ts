import type {
  Template, TemplateDetail, TemplateCategory, TemplateFilter,
  RecentlyUsedTemplate,
} from './types'
import type { ITemplateMarketService } from './interface'
import { TEMPLATE_CATEGORIES } from './types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_TEMPLATES: Template[] = [
  { id: 't-1', name: 'Modern Caption Box', description: 'Clean dark rounded caption box with accent underline. Perfect for cinematic content.', thumbnail: '/thumbnails/modern-caption.jpg', type: 'caption', categoryId: 'cat-caption', tags: ['modern', 'dark', 'rounded', 'cinematic'], rating: 4.8, ratingCount: 234, creator: { id: 'c-1', name: 'Flowstep Studio', avatar: '/avatars/flowstep.jpg', verified: true }, version: '2.1.0', isFavorite: true, usageCount: 12453, createdAt: '2025-11-15', compatibleFormats: ['MP4', 'SRT', 'VTT', 'ASS'] },
  { id: 't-2', name: 'Minimal Light', description: 'Subtle light caption style with thin font and minimal background.', thumbnail: '/thumbnails/minimal-light.jpg', type: 'caption', categoryId: 'cat-caption', tags: ['minimal', 'light', 'thin', 'elegant'], rating: 4.6, ratingCount: 187, creator: { id: 'c-2', name: 'TypoDesigns', avatar: '/avatars/typo.jpg', verified: true }, version: '1.3.0', isFavorite: false, usageCount: 8321, createdAt: '2025-09-20', compatibleFormats: ['MP4', 'SRT', 'VTT'] },
  { id: 't-3', name: 'Neon Glow', description: 'Vibrant neon-style captions with glow effects and bold typography.', thumbnail: '/thumbnails/neon-glow.jpg', type: 'caption', categoryId: 'cat-caption', tags: ['neon', 'vibrant', 'glow', 'bold', 'gaming'], rating: 4.9, ratingCount: 412, creator: { id: 'c-3', name: 'NeonPixel', avatar: '/avatars/neon.jpg', verified: true }, version: '3.0.0', isFavorite: true, usageCount: 28765, createdAt: '2026-01-10', compatibleFormats: ['MP4', 'SRT', 'VTT', 'ASS'] },
  { id: 't-4', name: 'Cinema Subtitles', description: 'Professional cinema-style subtitle strip at bottom of frame.', thumbnail: '/thumbnails/cinema-sub.jpg', type: 'subtitle', categoryId: 'cat-subtitle', tags: ['cinema', 'professional', 'strip', 'classic'], rating: 4.7, ratingCount: 156, creator: { id: 'c-1', name: 'Flowstep Studio', avatar: '/avatars/flowstep.jpg', verified: true }, version: '2.0.0', isFavorite: false, usageCount: 9821, createdAt: '2025-07-05', compatibleFormats: ['SRT', 'VTT', 'ASS', 'TXT'] },
  { id: 't-5', name: 'Karaoke Style', description: 'Sing-along subtitle style with word-by-word highlighting.', thumbnail: '/thumbnails/karaoke.jpg', type: 'subtitle', categoryId: 'cat-subtitle', tags: ['karaoke', 'highlight', 'fun', 'music'], rating: 4.4, ratingCount: 89, creator: { id: 'c-4', name: 'LyricMaster', avatar: '/avatars/lyric.jpg', verified: false }, version: '1.1.0', isFavorite: false, usageCount: 4567, createdAt: '2025-05-12', compatibleFormats: ['SRT', 'VTT', 'ASS'] },
  { id: 't-6', name: 'Fade In/Out', description: 'Smooth fade in/out animation for subtitle appearance.', thumbnail: '/thumbnails/fade.jpg', type: 'animation', categoryId: 'cat-animation', tags: ['fade', 'smooth', 'transition', 'elegant'], rating: 4.5, ratingCount: 134, creator: { id: 'c-2', name: 'TypoDesigns', avatar: '/avatars/typo.jpg', verified: true }, version: '1.0.0', isFavorite: true, usageCount: 6543, createdAt: '2026-02-14' },
  { id: 't-7', name: 'Typewriter Effect', description: 'Classic typewriter text animation for a nostalgic feel.', thumbnail: '/thumbnails/typewriter.jpg', type: 'animation', categoryId: 'cat-animation', tags: ['typewriter', 'retro', 'nostalgic', 'text'], rating: 4.3, ratingCount: 78, creator: { id: 'c-5', name: 'RetroVibe', avatar: '/avatars/retro.jpg', verified: false }, version: '2.0.0', isFavorite: false, usageCount: 3456, createdAt: '2025-08-22' },
  { id: 't-8', name: 'News Anchor', description: 'Professional lower third for news and interview content.', thumbnail: '/thumbnails/news-anchor.jpg', type: 'lower-third', categoryId: 'cat-lower-third', tags: ['news', 'professional', 'anchor', 'corporate'], rating: 4.8, ratingCount: 201, creator: { id: 'c-1', name: 'Flowstep Studio', avatar: '/avatars/flowstep.jpg', verified: true }, version: '1.5.0', isFavorite: false, usageCount: 11234, createdAt: '2025-10-01', compatibleFormats: ['MP4', 'MOV'] },
  { id: 't-9', name: 'Gaming Overlay', description: 'Bold lower third with gradient backgrounds for gaming content.', thumbnail: '/thumbnails/gaming-overlay.jpg', type: 'lower-third', categoryId: 'cat-lower-third', tags: ['gaming', 'bold', 'gradient', 'overlay'], rating: 4.6, ratingCount: 167, creator: { id: 'c-3', name: 'NeonPixel', avatar: '/avatars/neon.jpg', verified: true }, version: '2.2.0', isFavorite: true, usageCount: 8765, createdAt: '2026-03-05' },
  { id: 't-10', name: 'Instagram Stories', description: 'Vertical caption layout optimized for Instagram Stories and Reels.', thumbnail: '/thumbnails/ig-stories.jpg', type: 'social', categoryId: 'cat-social', tags: ['instagram', 'stories', 'vertical', 'reels', 'social'], rating: 4.7, ratingCount: 298, creator: { id: 'c-6', name: 'SocialCut', avatar: '/avatars/social.jpg', verified: true }, version: '3.1.0', isFavorite: false, usageCount: 15432, createdAt: '2026-04-18', compatibleFormats: ['MP4'] },
  { id: 't-11', name: 'TikTok Captions', description: 'Trendy caption style with large emoji support for TikTok.', thumbnail: '/thumbnails/tiktok.jpg', type: 'social', categoryId: 'cat-social', tags: ['tiktok', 'trendy', 'emoji', 'large'], rating: 4.5, ratingCount: 145, creator: { id: 'c-7', name: 'TrendSetter', avatar: '/avatars/trend.jpg', verified: false }, version: '1.2.0', isFavorite: false, usageCount: 12345, createdAt: '2026-05-01' },
  { id: 't-12', name: 'YouTube Lower Third', description: 'Polished lower third with channel branding for YouTube.', thumbnail: '/thumbnails/yt-lower.jpg', type: 'social', categoryId: 'cat-social', tags: ['youtube', 'lower-third', 'channel', 'branding'], rating: 4.4, ratingCount: 112, creator: { id: 'c-8', name: 'ContentPro', avatar: '/avatars/contentpro.jpg', verified: false }, version: '1.0.0', isFavorite: false, usageCount: 6789, createdAt: '2025-12-11' },
  { id: 't-13', name: 'Corporate Brand Kit', description: 'Complete brand kit with logo placement, colors, and fonts.', thumbnail: '/thumbnails/corp-brand.jpg', type: 'brand-kit', categoryId: 'cat-brand', tags: ['corporate', 'brand', 'logo', 'fonts', 'colors'], rating: 4.9, ratingCount: 89, creator: { id: 'c-1', name: 'Flowstep Studio', avatar: '/avatars/flowstep.jpg', verified: true }, version: '1.0.0', isFavorite: true, usageCount: 5432, createdAt: '2026-06-01' },
  { id: 't-14', name: 'Handwritten Captions', description: 'Whimsical handwritten font style for casual vlogs.', thumbnail: '/thumbnails/handwritten.jpg', type: 'caption', categoryId: 'cat-caption', tags: ['handwritten', 'casual', 'vlog', 'whimsical'], rating: 4.2, ratingCount: 67, creator: { id: 'c-9', name: 'ArtType', avatar: '/avatars/arttype.jpg', verified: false }, version: '1.0.0', isFavorite: false, usageCount: 2345, createdAt: '2025-04-30' },
  { id: 't-15', name: '3D Text Pop', description: 'Eye-catching 3D text animation with depth and perspective.', thumbnail: '/thumbnails/3d-pop.jpg', type: 'animation', categoryId: 'cat-animation', tags: ['3d', 'pop', 'depth', 'perspective', 'dynamic'], rating: 4.7, ratingCount: 203, creator: { id: 'c-3', name: 'NeonPixel', avatar: '/avatars/neon.jpg', verified: true }, version: '2.0.0', isFavorite: false, usageCount: 9876, createdAt: '2026-02-28' },
  { id: 't-16', name: 'Clean Minimal Lower Third', description: 'Ultra-minimal lower third with just text and thin line.', thumbnail: '/thumbnails/minimal-lower.jpg', type: 'lower-third', categoryId: 'cat-lower-third', tags: ['minimal', 'clean', 'thin', 'line'], rating: 4.5, ratingCount: 98, creator: { id: 'c-2', name: 'TypoDesigns', avatar: '/avatars/typo.jpg', verified: true }, version: '1.2.0', isFavorite: true, usageCount: 4567, createdAt: '2025-06-15' },
]

const MOCK_DETAILS: Record<string, TemplateDetail> = {
  't-1': {
    ...MOCK_TEMPLATES[0],
    fullDescription: 'Modern Caption Box is our most popular caption style. It features a clean dark rounded rectangle with a subtle accent underline. The background has a gentle gradient that adapts to video content. Perfect for cinematic content, documentaries, and professional presentations.',
    features: ['Dark rounded rectangle background', 'Accent color underline', 'Gradient adaptation', 'Custom border radius', 'Padding adjustment', 'Shadow control', 'Font weight options'],
    versions: [
      { version: '2.1.0', date: '2026-03-10', changes: ['Added gradient background option', 'Improved shadow rendering', 'Fixed padding issue on mobile'] },
      { version: '2.0.0', date: '2025-12-01', changes: ['Complete redesign', 'Added accent underline feature', 'New border radius options'] },
      { version: '1.0.0', date: '2025-11-15', changes: ['Initial release'] },
    ],
    previewImages: ['/previews/modern-caption-1.jpg', '/previews/modern-caption-2.jpg', '/previews/modern-caption-3.jpg'],
    recommendedSettings: { font: 'Inter', size: '28px', color: '#ffffff', background: '#1a1a2e' },
  },
  't-10': {
    ...MOCK_TEMPLATES[9],
    fullDescription: 'Designed specifically for Instagram Stories and Reels, this vertical caption layout ensures your text looks perfect on mobile screens. Features large readable fonts, emoji support, and safe-zone aware positioning.',
    features: ['Vertical optimized layout', 'Safe zone aware positioning', 'Emoji support', 'Story-compatible aspect ratio', 'Quick style variants'],
    versions: [
      { version: '3.1.0', date: '2026-05-20', changes: ['Added new font options', 'Improved emoji rendering'] },
      { version: '3.0.0', date: '2026-02-14', changes: ['Major redesign for Reels support', 'New animated variants'] },
      { version: '2.0.0', date: '2025-08-10', changes: ['Added highlight text feature', 'Multiple line spacing options'] },
    ],
    previewImages: ['/previews/ig-1.jpg', '/previews/ig-2.jpg', '/previews/ig-3.jpg'],
    recommendedSettings: { font: 'SF Pro Display', size: '32px', color: '#ffffff', background: '#00000080' },
  },
  't-13': {
    ...MOCK_TEMPLATES[12],
    fullDescription: 'Complete corporate brand identity pack that includes logo placement templates, brand color palettes, font pairings, and consistent styling across all caption types. Ensure brand consistency across all your video content.',
    features: ['Logo placement templates', 'Brand color palettes', 'Font pairings', 'Consistent styling', 'Multi-format support', 'Guidelines document'],
    versions: [
      { version: '1.0.0', date: '2026-06-01', changes: ['Initial release with 5 color schemes', '3 font pairings included'] },
    ],
    previewImages: ['/previews/brand-1.jpg', '/previews/brand-2.jpg'],
    recommendedSettings: { font: 'Roboto', size: '26px', color: '#1a1a2e', background: '#ffffff' },
  },
}

const MOCK_RECENTLY_USED: RecentlyUsedTemplate[] = [
  { templateId: 't-1', lastUsed: '2026-07-01T14:30:00Z', projectName: 'Summer Recap Video' },
  { templateId: 't-10', lastUsed: '2026-06-28T09:15:00Z', projectName: 'Product Launch Reel' },
  { templateId: 't-8', lastUsed: '2026-06-25T16:45:00Z', projectName: 'Interview with CEO' },
  { templateId: 't-3', lastUsed: '2026-06-20T11:00:00Z', projectName: 'Gaming Montage' },
]

const favorites = new Set(['t-1', 't-3', 't-6', 't-9', 't-13', 't-16'])

export class MockTemplateMarketService implements ITemplateMarketService {
  private templates: Template[] = [...MOCK_TEMPLATES]

  async getFeatured(): Promise<Template[]> {
    await sleep(200)
    return this.templates.filter((t) => t.rating >= 4.7).slice(0, 5)
  }

  async getTrending(): Promise<Template[]> {
    await sleep(150)
    return [...this.templates]
      .filter((t) => t.usageCount > 5000)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6)
  }

  async getRecentlyUsed(): Promise<RecentlyUsedTemplate[]> {
    await sleep(100)
    return MOCK_RECENTLY_USED.map((r) => ({
      ...r,
      templateId: r.templateId,
      lastUsed: r.lastUsed,
      projectName: r.projectName,
    }))
  }

  async getCategories(): Promise<TemplateCategory[]> {
    await sleep(100)
    return TEMPLATE_CATEGORIES
  }

  async search(filter: TemplateFilter): Promise<Template[]> {
    await sleep(250)
    let results = [...this.templates]

    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
    }

    if (filter.type !== 'all') {
      results = results.filter((t) => t.type === filter.type)
    }

    if (filter.categoryId && filter.categoryId !== 'cat-all') {
      results = results.filter((t) => t.categoryId === filter.categoryId)
    }

    if (filter.minRating > 0) {
      results = results.filter((t) => t.rating >= filter.minRating)
    }

    if (filter.showFavoritesOnly) {
      results = results.filter((t) => favorites.has(t.id))
    }

    switch (filter.sortBy) {
      case 'popular':
        results.sort((a, b) => b.usageCount - a.usageCount)
        break
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return results
  }

  async getTemplate(id: string): Promise<TemplateDetail | null> {
    await sleep(200)
    const detail = MOCK_DETAILS[id]
    if (detail) return { ...detail, isFavorite: favorites.has(id) }
    const base = this.templates.find((t) => t.id === id)
    if (!base) return null
    return {
      ...base,
      fullDescription: base.description,
      features: [],
      versions: [{ version: base.version, date: base.createdAt, changes: ['Initial release'] }],
      previewImages: [base.thumbnail],
      recommendedSettings: {},
    }
  }

  async toggleFavorite(id: string, favorite: boolean): Promise<Template> {
    await sleep(150)
    if (favorite) {
      favorites.add(id)
    } else {
      favorites.delete(id)
    }
    const template = this.templates.find((t) => t.id === id)
    if (!template) throw new Error(`Template ${id} not found`)
    template.isFavorite = favorite
    return { ...template, isFavorite: favorite }
  }

  async getFavorites(): Promise<Template[]> {
    await sleep(200)
    return this.templates.filter((t) => favorites.has(t.id))
  }

  async applyTemplate(_projectId: string, _templateId: string): Promise<boolean> {
    await sleep(300)
    return true
  }
}
