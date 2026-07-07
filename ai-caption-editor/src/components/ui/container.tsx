import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'header' | 'footer'
}

export function Container({ className, as: Comp = 'div', ...props }: ContainerProps) {
  return (
    <Comp
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}
