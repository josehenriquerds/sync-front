import { cn } from './utils'
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', className)}>{children}</span>
}
