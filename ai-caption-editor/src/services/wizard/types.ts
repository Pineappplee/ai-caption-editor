export type InputMethod = 'upload' | 'import' | 'template' | 'blank'

export interface ProjectConfig {
  name: string
  language: string
  aspectRatio: string
  frameRate: number
  outputResolution: string
}

export interface Template {
  id: string
  name: string
  description: string
  thumbnailUrl?: string
}

export interface RecentFile {
  id: string
  name: string
  path: string
  size: string
  type: 'video' | 'audio'
}

export interface WizardStep {
  id: string
  label: string
  description: string
}
