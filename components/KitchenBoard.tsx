'use client'

import { AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Order, api } from "../lib/api"
import { ensureStarted } from "../lib/signalr"
import { AlertOverlay } from "./AlertOverlay"
import { OrderCard } from "./OrderCard"
import { useToast } from "./ui/toast"
import { useSound } from "./useSound"

const keepActive = (list: Order[]) => list.filter(o => o.status !== 'Completed')

type DensityMode = 'compact' | 'normal' | 'comfortable'

export function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alert, setAlert] = useState<{show: boolean; text: string}>({ show: false, text: '' })
  const [density, setDensity] = useState<DensityMode>('normal')
  const { toast } = useToast()
  const { enabled, ensureSound, beep } = useSound()

  useEffect(() => {
    api.listOrders().then(data => setOrders(keepActive(data)))
    ensureStarted().then(conn => {
      conn.off('order:created')
      conn.off('order:updated')

      conn.on('order:created', (o: Order) => {
        setOrders(prev => keepActive([o, ...prev.filter(p => p.id !== o.id)]))
        const items = o.items.map(i => `${i.productName} x${i.quantity}`).join(' • ')
        setAlert({ show: true, text: items })
        ensureSound().then(ok => { if (ok) beep(3) })
      })

      conn.on('order:updated', (o: any) => {
        const map = ['Pending','InProgress','Completed','Cancelled'] as const
        const status: typeof map[number] = typeof o.status === 'number' ? map[o.status] : o.status
        const normalized = { ...o, status }
        setOrders(prev => {
          if (normalized.status === 'Completed') return prev.filter(x => x.id !== normalized.id)
          return prev.map(x => (x.id === normalized.id ? normalized : x))
        })
      })
    })
  }, [beep, ensureSound])

  const complete = useCallback(async (o: Order) => {
    try {
      await api.updateOrderStatus(o.id, 'Completed')
      setOrders(prev => prev.filter(x => x.id !== o.id))
      toast({ title: 'Pedido concluído', description: `#${o.id.slice(0, 8)}` })
    } catch (error) {
      toast({
        title: '❌ Erro ao concluir pedido',
        description: 'Tente novamente'
      })
      throw error
    }
  }, [toast])

  const sorted = [...orders].sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1
    const rank = (s: Order['status']) => (s === 'Pending' ? 0 : s === 'InProgress' ? 1 : 2)
    const r = rank(a.status) - rank(b.status)
    return r !== 0 ? r : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const densityClass = density === 'compact' ? 'density-compact' : density === 'comfortable' ? 'density-comfortable' : ''

  return (
    <div className={`h-full flex flex-col min-h-0 ${densityClass}`}>
      {/* Topbar com controles */}
      <div className="mb-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Controle de densidade */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Densidade:</span>
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden shadow-sm">
            <button
              onClick={() => setDensity('compact')}
              className={`px-4 py-2 text-sm font-medium transition-colors touch-target ${
                density === 'compact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
              aria-label="Densidade compacta"
              aria-pressed={density === 'compact'}
              data-testid="density-compact"
            >
              Compacta
            </button>
            <button
              onClick={() => setDensity('normal')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-x border-neutral-300 touch-target ${
                density === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
              aria-label="Densidade padrão"
              aria-pressed={density === 'normal'}
              data-testid="density-normal"
            >
              Padrão
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-4 py-2 text-sm font-medium transition-colors touch-target ${
                density === 'comfortable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
              aria-label="Densidade confortável"
              aria-pressed={density === 'comfortable'}
              data-testid="density-comfortable"
            >
              Confortável
            </button>
          </div>
        </div>

        {/* Botão de som */}
        {!enabled && (
          <button
            className="text-sm rounded-xl border border-neutral-300 px-4 py-2 shadow-sm hover:shadow transition touch-target bg-white"
            onClick={() => ensureSound()}
            title="Alguns navegadores exigem clique para liberar áudio"
            aria-label="Ativar som"
          >
            🔊 Ativar som
          </button>
        )}
      </div>

      {/* Grid de cards com scroll */}
      <div className="flex-1 min-h-0 scrollable-board">
        <div
          className="grid min-h-0 content-start"
          style={{
            gap: 'var(--card-gap)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(var(--card-min), 1fr))',
          }}
          data-testid="orders-grid"
        >
          <AnimatePresence initial={false}>
            {sorted.map(o => (
              <OrderCard
                key={o.id}
                o={o}
                onComplete={() => complete(o)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AlertOverlay
        show={alert.show}
        text={alert.text}
        onDone={() => setAlert({ show: false, text: '' })}
      />
    </div>
  )
}
