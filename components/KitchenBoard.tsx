'use client'

import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { Order, api } from "../lib/api";
import { ensureStarted } from "../lib/signalr";
import { AlertOverlay } from "./AlertOverlay";
import { OrderCard } from "./OrderCard";
import { useToast } from "./ui/toast";
import { useSound } from "./useSound";

const keepActive = (list: Order[]) => list.filter(o => o.status !== 'Completed')

// detecta Fire TV / Silk / Fire Stick
function useIsTV() {
  const [isTV, setIsTV] = useState(false)
  useEffect(() => {
    const ua = navigator.userAgent || ''
    const tv = /Silk|AFT|AmazonWebAppPlatform|SmartTV/i.test(ua)
    setIsTV(tv)
  }, [])
  return isTV
}

export function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alert, setAlert] = useState<{show: boolean; text: string}>({ show: false, text: '' })
  const { toast } = useToast()
  const { enabled, ensureSound, beep } = useSound()
  const topBarRef = useRef<HTMLDivElement | null>(null)
  const isTV = useIsTV()

  useEffect(() => { ensureSound().catch(() => {}) }, [ensureSound])

  useEffect(() => {
    api.listOrders().then(data => setOrders(keepActive(data)))
    ensureStarted().then(conn => {
      conn.off('order:created'); 
      conn.off('order:updated')

      conn.on('order:created', (o: Order) => {
        setOrders(prev => keepActive([o, ...prev.filter(p => p.id !== o.id)]))
        const items = o.items.map(i => `${i.productName} x${i.quantity}`).join(' • ')
        setAlert({ show: true, text: items })
        ensureSound().then(ok => { if (ok) beep(5) })
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

  async function start(o: Order) {
    await api.updateOrderStatus(o.id, 'InProgress')
    setOrders(prev => keepActive(prev.map(x => (x.id === o.id ? { ...x, status: 'InProgress' } : x))))
  }

  async function complete(o: Order) {
    await api.updateOrderStatus(o.id, 'Completed')
    setOrders(prev => prev.filter(x => x.id !== o.id))
    toast({ title: 'Pedido concluído', description: `#${o.id.slice(0, 8)}` })
  }

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1
      const rank = (s: Order['status']) => (s === 'Pending' ? 0 : s === 'InProgress' ? 1 : 2)
      const r = rank(a.status) - rank(b.status)
      return r !== 0 ? r : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [orders])

  return (
    <>
      <style jsx global>{`
        @keyframes blinkRed { 0%,49%,100%{color:#ef4444;} 50%{color:transparent;} }
        .blink-red { animation: blinkRed 1s linear infinite; }
      `}</style>

      {/* barra superior */}
      <div ref={topBarRef} className={clsx("mb-3 flex items-center justify-between", !isTV && "px-6")}>
        <h2 className="sr-only">Pedidos ativos</h2>
        <div />
        {!enabled && (
          <button
            className="text-sm rounded-xl border px-3 py-1 shadow-sm hover:shadow transition"
            onClick={() => ensureSound()}
          >
            🔊 Ativar som
          </button>
        )}
      </div>

      {/* GRID */}
      <div
        className={clsx(
          // TV: full-bleed; Desktop: segue o container padrão
          isTV ? "full-bleed" : "",
        )}
      >
        <div
          className={clsx(
            "grid gap-4",
            isTV ? "px-3" : "px-4 md:px-6 lg:px-8 xl:px-10",
            "[grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]",
            "2xl:[grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]"
          )}
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
