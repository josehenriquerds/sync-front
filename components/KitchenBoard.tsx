'use client'

import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Order, api } from "../lib/api";
import { ensureStarted } from "../lib/signalr";
import { AlertOverlay } from "./AlertOverlay";
import { OrderCard } from "./OrderCard";
import { useToast } from "./ui/toast";
import { useSound } from "./useSound";

const keepActive = (list: Order[]) => list.filter(o => o.status !== 'Completed')

type Layout = { minCard: number; gap: number; dense: boolean; ultra: boolean }

// Calcula layout para caber o MÁXIMO de colunas/linhas, inclusive < 960×540
function computeLayout(width: number, height: number): Layout {
  const small = (height < 560 || width < 960)
  const tiny = (height < 540 || width < 960)
  const targetMin = tiny ? 420 : small ? 480 : 660
  const MAX = 1440
  const gap = tiny ? 6 : small ? 8 : 16

  for (let cols = 12; cols >= 2; cols--) {
    const w = Math.floor((width - gap * (cols - 1)) / cols)
    if (w >= targetMin) {
      const minCard = Math.min(w, MAX)
      const dense = (minCard <= 600) || small
      const ultra = (minCard <= 450) || tiny
      return { minCard, gap, dense, ultra }
    }
  }
  return { minCard: targetMin, gap, dense: true, ultra: tiny }
}

export function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alert, setAlert] = useState<{show: boolean; text: string}>({ show: false, text: '' })
  const { toast } = useToast()
  const { enabled, ensureSound, beep } = useSound()

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<Layout>({ minCard: 320, gap: 16, dense: false, ultra: false })

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0
      const h = entry?.contentRect.height ?? 0
      if (w && h) setLayout(computeLayout(w, h))
    })
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    api.listOrders().then(data => setOrders(keepActive(data)))
    ensureStarted().then(conn => {
      conn.off('order:created'); conn.off('order:updated')

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

  async function complete(o: Order) {
    await api.updateOrderStatus(o.id, 'Completed')
    setOrders(prev => prev.filter(x => x.id !== o.id))
    toast({ title: 'Pedido concluído', description: `#${o.id.slice(0, 8)}` })
  }

  const sorted = [...orders].sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1
    const rank = (s: Order['status']) => (s === 'Pending' ? 0 : s === 'InProgress' ? 1 : 2)
    const r = rank(a.status) - rank(b.status)
    return r !== 0 ? r : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* topbar mínima */}
      <div className="mb-2 flex items-center justify-end">
        {!enabled && (
          <button
            className="text-sm rounded-xl border px-3 py-1 shadow-sm hover:shadow transition"
            onClick={() => ensureSound()}
            title="Alguns navegadores exigem clique para liberar áudio"
          >
            🔊 Ativar som
          </button>
        )}
      </div>

      {/* mede área útil */}
      <div ref={wrapRef} className="flex-1 min-h-0">
        <div
          className="grid min-h-0 content-start grid-flow-row-dense"
          /* content-start = evita “buracão” entre as linhas (alinhar topo) */
          style={{
            gap: `${layout.gap}px`,
            gridTemplateColumns: `repeat(auto-fit,minmax(${layout.minCard}px,1fr))`,
          }}
        >
          <AnimatePresence initial={false}>
            {sorted.map(o => (
              <OrderCard
                key={o.id}
                o={o}
                onComplete={() => complete(o)}
                density={layout.ultra ? 'ultra' : (layout.dense ? 'dense' : 'normal')}
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
