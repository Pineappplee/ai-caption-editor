export type TemplateType =
  | 'caption'
  | 'subtitle'
  | 'animation'
  | 'lower-third'
  | 'social'
  | 'brand-kit'

export interface Creator {
  id: string
  name: string
  avatar: string
  verified: boolean
}

export interface VersionInfo {
  version: string
  date: string
  changes: string[]
}

export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  type: TemplateType
  categoryId: string
  tags: string[]
  rating: number
  ratingCount: number
  creator: Creator
  version: string
  isFavorite: boolean
  usageCount: number
  createdAt: string
  previewUrl?: string
  compatibleFormats?: string[]
}

export interface TemplateDetail extends Template {
  fullDescription: string
  features: string[]
  versions: VersionInfo[]
  previewImages: string[]
  recommendedSettings: Record<string, string>
}

export interface TemplateCategory {
  id: string
  name: string
  icon: string
  count: number
  description: string
}

export interface TemplateFilter {
  searchQuery: string
  type: TemplateType | 'all'
  categoryId: string
  sortBy: 'popular' | 'rating' | 'newest' | 'name'
  minRating: number
  showFavoritesOnly: boolean
}

export interface RecentlyUsedTemplate {
  templateId: string
  lastUsed: string
  projectName: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'cat-all', name: 'All Templates', icon: 'LayoutGrid', count: 31, description: 'Browse all available templates' },
  { id: 'cat-caption', name: 'Caption Templates', icon: 'Subtitles', count: 8, description: 'Pre-designed caption layouts' },
  { id: 'cat-subtitle', name: 'Subtitle Styles', icon: 'TextSelect', count: 6, description: 'Elegant subtitle appearances' },
  { id: 'cat-animation', name: 'Animations', icon: 'Sparkles', count: 5, description: 'Animated text effects' },
  { id: 'cat-lower-third', name: 'Lower Thirds', icon: 'Minimize2', count: 4, description: 'Professional lower third graphics' },
  { id: 'cat-social', name: 'Social Media', icon: 'Share2', count: 5, description: 'Optimized for social platforms' },
  { id: 'cat-brand', name: 'Brand Kits', icon: 'Palette', count: 3, description: 'Complete brand identity packs' },
]

export const defaultTemplateFilter: TemplateFilter = {
  searchQuery: '',
  type: 'all',
  categoryId: 'cat-all',
  sortBy: 'popular',
  minRating: 0,
  showFavoritesOnly: false,
}
