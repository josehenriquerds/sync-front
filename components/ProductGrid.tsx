'use client'

import type { Product } from '../lib/api'
import { ProductCard } from './ProductCard'


type Props = {
  items: Product[]
  refresh: () => Promise<void>
}

export function ProductGrid({ items, refresh }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {items.map((p) => (
        <ProductCard
          key={p.id}                // 'key' é especial e não faz parte de Props
          id={p.id}
          name={p.name}
          category={p.category}
          prepSeconds={p.prepSeconds}
          available={p.available}
          refresh={refresh}         // passe se o card precisar chamar refresh()
        />
      ))}
    </div>
  )
}
