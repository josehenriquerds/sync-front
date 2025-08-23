// app/salon/page.tsx
'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductsToolbar, { Filter } from '../../components/ProductsToolbar'
import ProductGrid from '../../components/ProductGrid'
import { listProducts, type Product } from '../../lib/api'
import { BackButton } from '../../components/ui/back-button'

export default function SalonPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Carregando…</div>}>
      <SalonInner />
    </Suspense>
  )
}

function SalonInner() {
  const sp = useSearchParams()
  const initialCats = useMemo(() => {
    const raw = sp.get('cat') || ''
    return raw ? raw.split(',') : []
  }, [sp])

  const [filter, setFilter] = useState<Filter>({
    q: sp.get('q') || '',
    categories: initialCats,
    onlyAvailable: true,
    sort: 'az',
  })

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await listProducts({
        q: filter.q,
        categories: filter.categories,
        onlyAvailable: filter.onlyAvailable,
        sort: filter.sort,
        // se a sua toolbar tiver toggles de porção/recorrente, passe aqui:
        // portion: filter.portion,
        // recurring: filter.recurring,
      })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // categorias de macro do backend:
  const allCategories = [
    'Saladas',
    'Carnes',
    'Acompanhamentos',
    'Guarnições',
    'Frituras',
    'Caldos/Ensopados',
    'Massas',
    'Pratos',
    'Especiais',
  ]

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-xl font-semibold">Pedido Rápido</h1>
        <a href="/categories" className="text-sm underline">
          Categorias
        </a>
      </div>

      <ProductsToolbar allCategories={allCategories} initial={filter} onChange={setFilter} />

      {loading && <div className="text-sm text-neutral-500">Carregando…</div>}
      {!loading && <ProductGrid items={items} />}
      {!loading && items.length === 0 && (
        <div className="text-sm text-neutral-500">Sem resultados para os filtros atuais.</div>
      )}
    </div>
  )
}
