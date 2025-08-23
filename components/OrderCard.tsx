'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Order } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { PriorityBadge } from './PriorityBadge'

function secsBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 1000))
}

export function OrderCard({
  o,
  onStart,
  onComplete,
}: {
  o: Order
  onStart: () => void
  onComplete: () => void
}) {
  // Tempo alvo = item mais demorado (mín. 60s)
  const maxPrep = useMemo(
    () => Math.max(60, ...o.items.map((i) => i.prepSeconds)),
    [o]
  )
  const created = useMemo(() => new Date(o.createdAt), [o.createdAt])
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = secsBetween(created, now)
  const left = Math.max(0, maxPrep - elapsed)
  const pctLeft = Math.round((left / maxPrep) * 100)
  const pctBar = Math.min(100, Math.round((elapsed / maxPrep) * 100))

  // cor do status (texto) por tempo restante
  const leftColor =
    pctLeft > 60 ? 'text-emerald-700' : pctLeft > 30 ? 'text-amber-700' : 'text-red-700'
  const leftBg =
    pctLeft > 60 ? 'bg-emerald-100' : pctLeft > 30 ? 'bg-amber-100' : 'bg-red-100'
  const urgentRing = o.isUrgent ? 'ring-4 ring-red-300 border-red-400' : 'border-neutral-200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <Card
        className={[
          'p-6 md:p-8 rounded-2xl border-2 shadow-lg bg-white',
          urgentRing,
          o.isUrgent ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : '',
        ].join(' ')}
      >
        {/* Cabeçalho grande */}
        <div className="flex items-start justify-between gap-4">
          {/* <div className="flex flex-col">
            <div className="text-2xl font-extrabold tracking-tight">
              Pedido #{o.id.slice(0, 6)}
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              Itens: {o.items.length}
            </div>
          </div> */}

          <div className="flex items-center gap-2">
            {o.isUrgent ? (
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-200">
                URGENTE
              </span>
            ) : (
              <PriorityBadge pctLeft={pctLeft} />
            )}
            <span
              className={[
                'px-3 py-1 rounded-full text-sm font-semibold border',
                leftBg,
                leftColor,
              ].join(' ')}
              title="Tempo restante estimado"
            >
              ~{Math.max(0, Math.ceil(left / 60))} min
            </span>
          </div>
        </div>

        {/* Lista de itens - fonte grande */}
        <ul className="mt-6 space-y-3">
          {o.items.map((i, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between text-lg md:text-xl leading-tight"
            >
              <div className="min-w-0 pr-3">
                <span className="text-2xl font-extrabold tracking-tight">{i.productName}</span>{' '}
                <span className="text-neutral-500 text-base">
                  (~{Math.round(i.prepSeconds / 60)}m)
                </span>
              </div>
              <span className="px-3 py-1 rounded-full border text-base font-bold">
                x{i.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Barra de progresso mais grossa */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-neutral-600">
            <span>Progresso</span>
            <span>{pctBar}%</span>
          </div>
          <div className="h-4 md:h-5">
            <Progress value={pctBar} />
          </div>
        </div>

        {/* Ações grandes */}
        {/* <div className="mt-6 flex gap-3">
          {o.status === 'Pending' && (
            <Button
              className="flex-1 h-14 text-lg font-semibold"
              onClick={onStart}
              title="Marcar como 'Em preparo'"
            >
              Iniciar preparo
            </Button>
          )}
          {o.status !== 'Completed' && (
            <Button
              className="flex-1 h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
              onClick={onComplete}
              title="Marcar como 'Concluído'"
            >
              Concluir
            </Button>
          )}
        </div> */}
      </Card>
    </motion.div>
  )
}
