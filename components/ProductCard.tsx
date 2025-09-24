'use client'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { Order, api } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useToast } from './ui/toast'

type Props = {
  id?: string
  name: string
  category: string
  prepSeconds: number
  available: boolean,
  refresh?: () => Promise<void>
}

export function ProductCard({ id, name, category, prepSeconds, available, refresh, }: Props) {
  const [loading, setLoading] = useState(false)
  const [normalOrder, setNormalOrder] = useState<Order | null>(null) // pedido “Enviar”
  const [urgentOrder, setUrgentOrder] = useState<Order | null>(null) // pedido “URGÊNCIA”
  const holdRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const hasAnyActive = !!normalOrder || !!urgentOrder

  async function sendNormal() {
    if (!available || loading || normalOrder || !id) return
    try {
      setLoading(true)
      const o = await api.createOrder([{ productId: id, quantity: 1 }], { urgent: false })
      setNormalOrder(o)
      toast({ title: 'Pedido enviado', description: `${name} x1` })
    } catch (e: any) {
      toast({ title: 'Erro ao enviar', description: e?.message || 'Falhou' })
    } finally {
      setLoading(false)
    }
  }

  async function sendUrgent() {
    if (!available || loading || !id) return
    try {
      setLoading(true)
      const o = await api.createOrder([{ productId: id, quantity: 1 }], { urgent: true })
      setUrgentOrder(o)
      toast({ title: 'URGÊNCIA enviada', description: `${name} x1` })
    } catch (e: any) {
      toast({ title: 'Erro ao enviar URGÊNCIA', description: e?.message || 'Falhou' })
    } finally {
      setLoading(false)
    }
  }

  // Conclui um por vez: prioriza URGENTE; se não houver, conclui o normal
  async function completeOne() {
    const target = urgentOrder ?? normalOrder
    if (!target) return
    try {
      setLoading(true)
      await api.updateOrderStatus(target.id, 'Completed')
      if (urgentOrder && target.id === urgentOrder.id) setUrgentOrder(null)
      else if (normalOrder && target.id === normalOrder.id) setNormalOrder(null)

      toast({ title: 'Pedido concluído', description: `#${target.id.slice(0, 8)}` })
    } catch (e: any) {
      toast({ title: 'Erro ao concluir', description: e?.message || 'Falhou' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`p-4 relative ${available ? 'border-green-200' : 'border-neutral-200 opacity-60'}`}>
        <div className="text-sm text-neutral-500">{category}</div>
        <div className="text-sm sm:text-base md:text-lg font-semibold leading-tight break-words hyphens-auto">{name}</div>
        <div className="text-xs text-neutral-500">prep ~ {Math.round(prepSeconds / 60)} min</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {/* Enviar normal — bloqueia se já houver normal ativo */}
          <Button onClick={sendNormal} disabled={!available || loading || !!normalOrder}>
            {normalOrder ? 'Aguardando…' : 'Enviar'}
          </Button>

          {/* URGÊNCIA — sempre pode enviar, mesmo com normal ativo */}
          <Button
            onClick={sendUrgent}
            onPointerDown={() => {
              holdRef.current = setTimeout(sendUrgent, 500) // mantém gesto de hold
            }}
            onPointerUp={() => {
              if (holdRef.current) clearTimeout(holdRef.current)
            }}
            onPointerLeave={() => {
              if (holdRef.current) clearTimeout(holdRef.current)
            }}
            className="border-red-300 text-red-700"
            disabled={!available || loading}
          >
            URGÊNCIA
          </Button>

          {/* Concluir — aparece se existir normal OU urgente; ao clicar, conclui um (urgente primeiro) */}
          {hasAnyActive && (
            <Button onClick={completeOne} className="border-emerald-300 text-emerald-700" disabled={loading}>
              Concluir
            </Button>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl grid place-items-center text-sm">
            Processando…
          </div>
        )}
      </Card>
    </motion.div>
  )
}
