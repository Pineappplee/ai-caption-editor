import type { LucideIcon } from 'lucide-react'
import { Film, FileImage, FileAudio, FileText, Type, Sticker } from 'lucide-react'
import type { AssetType } from '@/services/media'

interface FileIconProps {
  type: AssetType
  className?: string
}

const iconMap: Partial<Record<AssetType, LucideIcon>> = {
  video: Film,
  image: FileImage,
  gif: FileImage,
  audio: FileAudio,
  subtitle: FileText,
  font: Type,
  sticker: Sticker,
}

export function FileIcon({ type, className }: FileIconProps) {
  const Icon = iconMap[type]
  if (!Icon) return null
  return <Icon className={className} />
}
