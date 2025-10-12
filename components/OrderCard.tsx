'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Order } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'

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

  // FONTES GRANDES (3x maior) - Visível de longe + MAIS ALTURA
  const titleSize = density === 'ultra'
    ? 'text-2xl leading-snug'
    : density === 'dense'
    ? 'text-3xl leading-snug'
    : 'text-[clamp(36px,4.5vw,54px)] leading-snug'

  const qtySize = density === 'ultra'
    ? 'text-xl'
    : density === 'dense'
    ? 'text-2xl'
    : 'text-[clamp(28px,3.5vw,40px)]'

  const btnH = density === 'ultra' ? 'h-9' : density === 'dense' ? 'h-11' : 'h-[clamp(56px,5vw,72px)]'
  const btnText = density === 'ultra' ? 'text-lg font-extrabold' : density === 'dense' ? 'text-xl font-extrabold' : 'text-[clamp(26px,3.2vw,38px)] font-extrabold'

  const badgeText = density === 'ultra' ? 'text-base' : density === 'dense' ? 'text-lg' : 'text-[clamp(22px,2.8vw,32px)]'
  const timerText = density === 'ultra' ? 'text-xs' : density === 'dense' ? 'text-sm' : 'text-[clamp(12px,1vw,14px)]'

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
        {/* Cabeçalho - Apenas URGENTE se necessário */}
        {o.isUrgent && (
          <div className="mb-1.5">
            <span className={`px-2.5 py-1 rounded-full font-extrabold bg-red-100 text-red-800 border-2 border-red-300 ${badgeText}`}>
              {density === 'ultra' ? 'URGENTE' : 'URGENTE'}
            </span>
          </div>
        )}

        {/* Lista de itens - APENAS NOME DO PRODUTO (SEM QUANTIDADE) */}
        <ul className={`pr-1 overflow-auto ${listSpace}`}>
          {o.items.map((i, idx) => (
            <li key={idx} className="w-full">
              <div className="w-full">
                <span className={`font-black tracking-tight line-clamp-2 block ${titleSize}`}>
                  {i.productName}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Ação - BOTÃO GRANDE E VISÍVEL */}
        {o.status !== 'Completed' && (
          <div className={density === 'ultra' ? 'mt-1.5' : 'mt-2.5'}>
            <Button
              className={`w-full ${btnH} ${btnText} bg-green-600 hover:bg-green-500 text-white transition-colors rounded-xl shadow-md`}
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
