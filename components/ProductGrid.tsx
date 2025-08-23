// components/ProductGrid.tsx
'use client'

import { Product } from "../lib/api"
import { ProductCard } from "./ProductCard"


export type ProductGridProps = {
  items: Product[]
  refresh?: () => Promise<void>
}

export default function ProductGrid({ items, refresh }: ProductGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          category={p.category}
          prepSeconds={p.prepSeconds}
          available={p.available}
          refresh={refresh}
        />
      ))}
    </div>
  )
}
