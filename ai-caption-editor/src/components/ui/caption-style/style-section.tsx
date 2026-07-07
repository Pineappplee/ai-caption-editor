import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function StyleSection({ title, children }: Props) {
  return (
    <div className="border-b border-zinc-800/60 pb-3">
      <p className="mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        {title}
      </p>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}
