import { Mic, Languages, Palette, Download, FolderKanban, FileEdit, Upload, Settings, HelpCircle, LayoutGrid, type LucideIcon } from 'lucide-react'

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
] as const

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

export const FEATURES: Feature[] = [
  {
    title: 'Auto-Transcribe',
    description: 'Fast speech-to-text',
    icon: Mic,
  },
  {
    title: 'AI Translation',
    description: 'Localize instantly',
    icon: Languages,
  },
  {
    title: 'Style Editor',
    description: 'Design captions beautifully',
    icon: Palette,
  },
  {
    title: 'One-Click Export',
    description: 'Deliver in minutes',
    icon: Download,
  },
] as const

export const SIDEBAR_NAV = [
  { label: 'Project', icon: FolderKanban, path: '/projects' },
  { label: 'Edit', icon: FileEdit, path: '/edit' },
  { label: 'Export', icon: Upload, path: '/export' },
  { label: 'Templates', icon: LayoutGrid, path: '/templates' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Help', icon: HelpCircle, path: '/help' },
] as const

export const FOOTER_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
] as const
