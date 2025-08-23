// app/categories/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ProductGrid from '../../components/ProductGrid'
import { listProducts } from '../../lib/api'
import { BackButton } from '../../components/ui/back-button'

const MACROS = [
  'Saladas',
  'Carnes',
  'Acompanhamentos',
  'Guarnições',
  'Frituras',
  'Porções',
//   'Sobremesas',
  'Especiais',
]

export default function CategoriesPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])

  // busca em tempo real
  useEffect(()=>{
    let cancel = false
    async function run() {
      if (!q.trim()) { setItems([]); return }
      setLoading(true)
      try {
        const data = await listProducts({ q, take: 30 }) // limita primeiros 30
        if (!cancel) setItems(data)
      } finally { if (!cancel) setLoading(false) }
    }
    const t = setTimeout(run, 250)
    return ()=>{ clearTimeout(t); cancel = true }
  }, [q])

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <p className="text-sm text-neutral-600">Toque em uma macro para ver os itens ou pesquise abaixo e envie direto.</p>
      </div>

      {/* Busca global */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border rounded-xl p-3">
        <input
          placeholder="Buscar item por nome ou tag…"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          value={q}
          onChange={(e)=> setQ(e.target.value)}
        />
        {q && (
          <div className="mt-2 text-sm text-neutral-500">
            {loading ? 'Buscando…' : `${items.length} resultado(s)`}
          </div>
        )}
      </div>

      {/* Grid de macro-categorias */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {MACROS.map(c => (
          <Link
            key={c}
            href={`/salon?cat=${encodeURIComponent(c)}`}
            className="rounded-2xl border p-4 hover:shadow transition focus:outline-none focus:ring"
          >
            <div className="text-lg font-medium">{c}</div>
            {/* você pode exibir contagem por categoria se expor /api/categories */}
          </Link>
        ))}
      </div>

      {/* Resultados da busca (quando q != '') */}
      {q && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Resultados</div>
          <ProductGrid items={items} />
        </div>
      )}
    </div>
  )
}
