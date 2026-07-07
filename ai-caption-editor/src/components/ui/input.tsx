import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            icon && 'pl-10',
            error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 hover:border-zinc-600',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
