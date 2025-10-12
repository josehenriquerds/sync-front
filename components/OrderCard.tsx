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

  // Aspect ratio MUITO horizontal para caber 16+ cards
  const aspect =
    density === 'ultra' ? 'aspect-[5/2]' :
    density === 'dense' ? 'aspect-[3/2]' : 'aspect-[4/3]'

  // Ultra compacto para maximizar cards visíveis
  const pad = density === 'ultra' ? 'p-2' : density === 'dense' ? 'p-3' : 'p-[clamp(18px,2.2vw,28px)]'
  const listSpace = density === 'ultra' ? 'space-y-1' : density === 'dense' ? 'space-y-2' : 'space-y-3.5'

  // Fontes compactas mas legíveis
  const titleSize = density === 'ultra'
    ? 'text-sm leading-tight'
    : density === 'dense'
    ? 'text-base leading-tight'
    : 'text-[clamp(20px,2.5vw,30px)]'

  const qtySize = density === 'ultra'
    ? 'text-sm'
    : density === 'dense'
    ? 'text-base'
    : 'text-[clamp(16px,2vw,24px)]'

  const btnH = density === 'ultra' ? 'h-8' : density === 'dense' ? 'h-10' : 'h-[clamp(52px,4.5vw,68px)]'
  const btnText = density === 'ultra' ? 'text-sm' : density === 'dense' ? 'text-base' : 'text-[clamp(20px,2.5vw,30px)]'

  const badgeText = density === 'ultra' ? 'text-xs' : density === 'dense' ? 'text-sm' : 'text-[clamp(16px,2vw,24px)]'
  const timerText = density === 'ultra' ? 'text-[9px]' : density === 'dense' ? 'text-[10px]' : 'text-[clamp(10px,0.85vw,12px)]'

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
          pad, urgentRing, o.isUrgent ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : '',
        ].join(' ')}
      >
        {/* Cabeçalho compacto */}
        <div className="flex items-start justify-between gap-1">
          {o.isUrgent ? (
            <span className={`px-1.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-200 ${badgeText}`}>
              {density === 'ultra' ? 'URG' : 'URGENTE'}
            </span>
          ) : (
            <PriorityBadge pctLeft={pctLeft} />
          )}

          {/* <span
            className={[
              'px-2 py-0.5 rounded-full border font-semibold tabular-nums',
              timerText,
              leftBg, leftColor,
            ].join(' ')}
            title="Tempo restante estimado"
          >
            ~{Math.max(0, Math.ceil(left / 60))} min
          </span> */}
        </div>

        {/* Lista de itens (ultra: mais enxuta) */}
        <ul className={`mt-1.5 pr-1 overflow-auto ${listSpace}`}>
          {o.items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <span className={`font-bold tracking-tight line-clamp-1 ${titleSize}`}>
                  {i.productName}
                </span>
                {/* {density !== 'ultra' && (
                  <span className={`text-neutral-500 ${density === 'dense' ? 'text-xs' : 'text-[clamp(11px,0.85vw,13px)]'}`}>
                    (~{Math.round(i.prepSeconds / 60)}m)
                  </span>
                )} */}
              </div>
              <span className={`px-1.5 py-0.5 rounded-full border font-bold flex-shrink-0 ${qtySize}`}>
                x{i.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Ação */}
        {o.status !== 'Completed' && (
          <div className={density === 'ultra' ? 'mt-1' : 'mt-2'}>
            <Button
              className={`w-full ${btnH} ${btnText} font-bold bg-green-600 hover:bg-green-500 text-white transition-colors rounded-lg`}
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
