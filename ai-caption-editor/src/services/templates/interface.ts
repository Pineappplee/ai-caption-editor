import type {
  Template, TemplateDetail, TemplateCategory, TemplateFilter,
  RecentlyUsedTemplate,
} from './types'

export interface ITemplateMarketService {
  getFeatured(): Promise<Template[]>
  getTrending(): Promise<Template[]>
  getRecentlyUsed(): Promise<RecentlyUsedTemplate[]>
  getCategories(): Promise<TemplateCategory[]>
  search(filter: TemplateFilter): Promise<Template[]>
  getTemplate(id: string): Promise<TemplateDetail | null>
  toggleFavorite(id: string, favorite: boolean): Promise<Template>
  getFavorites(): Promise<Template[]>
  applyTemplate(projectId: string, templateId: string): Promise<boolean>
}
