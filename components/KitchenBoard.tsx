'use client'

import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Order, api } from "../lib/api";
import { ensureStarted } from "../lib/signalr";
import { AlertOverlay } from "./AlertOverlay";
import { OrderCard } from "./OrderCard";
import { useToast } from "./ui/toast";
import { useSound } from "./useSound";

const keepActive = (list: Order[]) => list.filter(o => o.status !== 'Completed')

export function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alert, setAlert] = useState<{show: boolean; text: string}>({ show: false, text: '' }) // ⬅️ novo
  const { toast } = useToast()
  const { enabled, ensureSound, beep } = useSound() // ⬅️ novo
   


  //
  useEffect(() => {
    api.listOrders().then(data => setOrders(keepActive(data)))

    ensureStarted().then(conn => {
      conn.off('order:created'); conn.off('order:updated')

      conn.on('order:created', (o: Order) => {
        // atualiza lista
        setOrders(prev => keepActive([o, ...prev.filter(p => p.id !== o.id)]))
        // mostra overlay em tela cheia com os itens do pedido
        const items = o.items.map(i => `${i.productName} x${i.quantity}`).join(' • ')
        setAlert({ show: true, text: items })
        // som (se permitido)
        ensureSound().then(ok => { if (ok) beep(3) })
      })

      conn.on('order:updated', (o: any) => {
  // normaliza status: número -> string
  const map = ['Pending','InProgress','Completed','Cancelled'] as const
  const status: typeof map[number] = typeof o.status === 'number' ? map[o.status] : o.status
  const normalized = { ...o, status }

  setOrders(prev => {
    if (normalized.status === 'Completed') return prev.filter(x => x.id === normalized.id ? false : true)
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
  if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1      // ⬅️ urgentes no topo
  const rank = (s: Order['status']) => (s === 'Pending' ? 0 : s === 'InProgress' ? 1 : 2)
  const r = rank(a.status) - rank(b.status)
  return r !== 0 ? r : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
})


  return (
    <>
      {/* barra superior com botão de habilitar som */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="sr-only">Pedidos ativos</h2>
        <div />
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

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <AnimatePresence initial={false}>
          {sorted.map(o => (
            <OrderCard key={o.id} o={o} onStart={() => start(o)} onComplete={() => complete(o)} />
          ))}
        </AnimatePresence>
      </div>

      <AlertOverlay
        show={alert.show}
        text={alert.text}
        onDone={() => setAlert({ show: false, text: '' })}
      />
    </>
  )
}
