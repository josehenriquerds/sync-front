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

type Density = 'normal' | 'dense' | 'ultra'

export function OrderCard({
  o,
  onComplete,
  density = 'normal',
}: {
  o: Order
  onComplete: () => void
  density?: Density
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

  const aspect =
    density === 'ultra' ? 'aspect-[5/4]' :
    density === 'dense' ? 'aspect-[4/3]' : 'aspect-[4/3]'

  const pad = density === 'ultra' ? 'p-3' : density === 'dense' ? 'p-4' : 'p-5'
  const listSpace = density === 'ultra' ? 'space-y-1.5' : density === 'dense' ? 'space-y-2' : 'space-y-3'

  // ✨ TIPOGRAFIA AUMENTADA (mantém densidade de cards)
  const titleSize = density === 'ultra'
    ? 'text-xl leading-tight'        // 20px (antes: text-lg/18px)
    : density === 'dense'
    ? 'text-2xl leading-tight'       // 24px (antes: text-xl/20px)
    : 'text-[clamp(28px,3.5vw,40px)]' // 28-40px (antes: 24-36px)

  const qtySize = density === 'ultra'
    ? 'text-xl'                       // 20px (antes: text-lg/18px)
    : density === 'dense'
    ? 'text-2xl'                      // 24px (antes: text-xl/20px)
    : 'text-[clamp(24px,3vw,32px)]'   // 24-32px (antes: 20-28px)

  const btnH = density === 'ultra' ? 'h-12' : density === 'dense' ? 'h-14' : 'h-16'
  const btnText = density === 'ultra' ? 'text-xl' : density === 'dense' ? 'text-2xl' : 'text-[clamp(28px,3.5vw,40px)]'

  const badgeText = density === 'ultra' ? 'text-lg' : density === 'dense' ? 'text-xl' : 'text-[clamp(24px,3vw,32px)]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <Card
        className={[
          'card', aspect, 'overflow-hidden rounded-2xl border-2 bg-white shadow-sm',
          pad, urgentRing,
          // ✨ PISCAR RESTAURADO
          o.isUrgent ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : '',
        ].join(' ')}
      >
        {/* Cabeçalho compacto */}
        <div className="flex items-start justify-between gap-1.5">
          {o.isUrgent ? (
            <span className={`px-2 py-1 rounded-full font-bold bg-red-600 text-white border-2 border-red-700 ${badgeText}`}>
              {density === 'ultra' ? 'URG' : 'URGENTE'}
            </span>
          ) : (
            <PriorityBadge pctLeft={pctLeft} />
          )}
        </div>

        {/* Lista de itens */}
        <ul className={`mt-2 pr-1 overflow-auto ${listSpace}`}>
          {o.items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <span className={`font-bold tracking-tight line-clamp-2 ${titleSize}`}>
                  {i.productName}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full border-2 border-neutral-300 font-bold flex-shrink-0 ${qtySize}`}>
                x{i.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Botão Concluir */}
        {o.status !== 'Completed' && (
          <div className={density === 'ultra' ? 'mt-1.5' : 'mt-2'}>
            <Button
              className={`w-full ${btnH} ${btnText} font-bold bg-green-600 hover:bg-green-500 text-white transition-colors`}
              onClick={onComplete}
              title="Marcar como 'Concluído'"
            >
              {density === 'ultra' ? 'OK' : 'Concluir'}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
