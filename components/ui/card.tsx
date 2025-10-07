import { cn } from './utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl border border-neutral-200 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
