import { cn } from './utils'
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border border-neutral-200 bg-white shadow-sm', className)}>{children}</div>
}
