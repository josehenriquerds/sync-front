export function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
      <div className="h-full bg-neutral-900" style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: 'width .4s ease' }} />
    </div>
  )
}
