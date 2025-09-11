'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Order } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
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
  const maxPrep = useMemo(() => Math.max(60, ...o.items.map(i => i.prepSeconds)), [o])
  const created = useMemo(() => new Date(o.createdAt), [o.createdAt])
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = secsBetween(created, now)
  const left = Math.max(0, maxPrep - elapsed)
  const pctLeft = Math.round((left / maxPrep) * 100)

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
          // proporção fixa + container queries + compact
          'card aspect-[4/3] overflow-hidden',
          'rounded-2xl border-2 bg-white shadow-sm',
          'p-[clamp(10px,1vw,16px)]',
          urgentRing,
          o.isUrgent ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : '',
        ].join(' ')}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {o.isUrgent ? (
              <span className="px-2 py-0.5 rounded-full text-[clamp(11px,0.85vw,13px)] font-bold bg-red-100 text-red-800 border border-red-200">
                URGENTE
              </span>
            ) : (
              <PriorityBadge pctLeft={pctLeft} />
            )}
          </div>

          <span
            className={[
              'px-2 py-0.5 rounded-full border font-semibold tabular-nums',
              'text-[clamp(11px,0.9vw,14px)]',
              leftBg,
              leftColor,
            ].join(' ')}
            title="Tempo restante estimado"
          >
            ~{Math.max(0, Math.ceil(left / 60))} min
          </span>
        </div>

        {/* Lista de itens */}
        <ul className="mt-[clamp(6px,0.8vw,12px)] pr-1 overflow-auto space-y-1.5
                       text-[clamp(13px,1vw,16px)] leading-tight">
          {o.items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="font-semibold tracking-tight line-clamp-1">
                  {i.productName}
                </span>{' '}
                <span className="text-neutral-500 text-[clamp(11px,0.85vw,13px)]">
                  (~{Math.round(i.prepSeconds / 60)}m)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full border text-[clamp(12px,0.95vw,14px)] font-bold">
                x{i.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Ações */}
        {o.status !== 'Completed' && (
          <div className="mt-[clamp(8px,1vw,12px)]">
            <Button
              className="w-full h-[clamp(40px,2.6vw,48px)] text-[clamp(14px,1vw,16px)] font-semibold
                         bg-green-600 hover:bg-green-500 text-white"
              onClick={onComplete}
              title="Marcar como 'Concluído'"
            >
              Concluir
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
