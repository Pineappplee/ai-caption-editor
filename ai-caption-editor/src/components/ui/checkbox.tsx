import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode
  label: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, icon, label, id, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn(
          'peer size-4 appearance-none rounded border border-zinc-600 bg-zinc-900 checked:border-purple-500 checked:bg-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          className,
        )}
        {...props}
      />
      {icon && <span className="text-zinc-500">{icon}</span>}
      <label
        htmlFor={id}
        className="cursor-pointer text-sm text-zinc-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  ),
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
