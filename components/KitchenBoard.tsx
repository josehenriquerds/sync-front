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

// calcula a melhor min-width para caber o maior nº de colunas possível
function calcMinCardWidth(containerWidth: number, gap: number) {
  // ajuste estes limites conforme sua densidade mínima aceitada
  const MIN = 260; // menor largura aceitável do card (legibilidade)
  const MAX = 480; // evita cards gigantes em 4K
  // tenta do maior nº de colunas para o menor e para quando couber >= MIN
  for (const cols of [8,7,6,5,4,3,2]) {
    const w = Math.floor((containerWidth - gap * (cols - 1)) / cols);
    if (w >= MIN) return Math.min(w, MAX);
  }
  return MIN;
}

export function KitchenBoard({ tv = false }: { tv?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [alert, setAlert] = useState<{show: boolean; text: string}>({ show: false, text: '' })
  const { toast } = useToast()
  const { enabled, ensureSound, beep } = useSound()

  // === cálculo dinâmico do grid ===
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [minCard, setMinCard] = useState<number>(320)
  const GAP = 16 // deve bater com gap-4 (16px)

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0
      if (w) setMinCard(calcMinCardWidth(w, GAP))
    })
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // === dados + signalR ===
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
  }, [])

  async function start(o: Order) {
    await api.updateOrderStatus(o.id, 'InProgress')
    setOrders(prev => keepActive(prev.map(x => (x.id === o.id ? { ...x, status: 'InProgress' } : x))))
  }

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
    <>
      {/* topbar minimalista: na TV, mostramos só o botão de som (se necessário) */}
      <div className={tv ? "mb-2 flex items-center justify-end" : "mb-3 flex items-center justify-between"}>
        {!tv && <h2 className="text-sm font-medium text-neutral-600">Pedidos ativos</h2>}
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

      {/* wrapper que mede a largura para ajustar --card-min */}
      <div ref={wrapRef} className={tv ? "h-[calc(100svh-48px)]" : ""}>
        <div
          className="
            grid
            gap-4
            // grade fluida: caber o máximo de colunas com min-width controlada
            [grid-template-columns:repeat(auto-fit,minmax(var(--card-min),1fr))]
            h-full
          "
          style={{ ['--card-min' as any]: `${minCard}px` }}
        >
          <AnimatePresence initial={false}>
            {sorted.map(o => (
              <OrderCard
                key={o.id}
                o={o}
                onStart={() => start(o)}
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
    </>
  )
}
