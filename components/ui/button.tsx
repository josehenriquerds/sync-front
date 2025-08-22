import { cn } from './utils'
export function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm border border-neutral-200 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none', className)}
      {...props}
    >
      {children}
    </button>
  )
}
