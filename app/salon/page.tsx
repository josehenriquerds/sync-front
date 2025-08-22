'use client'
import { useEffect, useState } from 'react'
import { ProductGrid } from '../../components/ProductGrid'
import { Product, api } from '../../lib/api'
import { ensureStarted } from '../../lib/signalr'

export default function SalonPage() {
  const [items, setItems] = useState<Product[]>([])
  const refresh = () => api.listProducts().then(setItems)

  useEffect(() => { refresh(); ensureStarted() }, [])

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Pedido Rápido</h1>
      <p className="text-sm text-neutral-600">Toque ou segure 0,5s para enviar. Cards bloqueiam enquanto enviam.</p>
      <ProductGrid items={items} refresh={refresh} />
    </div>
  )
}
