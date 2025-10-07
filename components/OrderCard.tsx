'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState, memo } from 'react'
import { Order } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { PriorityBadge } from './PriorityBadge'

function secsBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 1000))
}

interface OrderCardProps {
  o: Order
  onComplete: () => Promise<void>
}

export const OrderCard = memo(function OrderCard({ o, onComplete }: OrderCardProps) {
  const maxPrep = useMemo(() => Math.max(60, ...o.items.map(i => i.prepSeconds)), [o.items])
  const created = useMemo(() => new Date(o.createdAt), [o.createdAt])
  const [now, setNow] = useState<Date>(new Date())
  const [isCompleting, setIsCompleting] = useState(false)

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

  async function handleComplete() {
    if (isCompleting) return

    setIsCompleting(true)
    try {
      await onComplete()
    } catch (error) {
      // Rollback em caso de erro
      setIsCompleting(false)
      throw error
    }
  }

  const cardClasses = [
    'kitchen-card',
    'overflow-hidden rounded-2xl border-2 bg-white transition-all',
    'shadow-sm hover:shadow-md',
    isCompleting ? 'opacity-60' : '',
    o.isUrgent ? 'urgent-pulse urgent-glow' : 'border-neutral-200',
  ].filter(Boolean).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <Card
        className={cardClasses}
        style={{
          padding: 'var(--card-padding)',
          aspectRatio: 'var(--card-aspect-ratio)',
        }}
        data-testid={`order-card-${o.id}`}
      >
        {/* Cabeçalho com badges */}
        <div
          className="flex items-start justify-between gap-2 mb-[var(--card-spacing)]"
          style={{ fontSize: 'var(--card-badge-size)' }}
        >
          {o.isUrgent ? (
            <div
              className="px-3 py-1.5 rounded-full font-bold bg-red-600 text-white border-2 border-red-700 shadow-lg"
              style={{ fontSize: 'var(--card-badge-size)' }}
              role="status"
              aria-live="assertive"
              data-testid="urgent-badge"
            >
              🚨 URGENTE
            </div>
          ) : (
            <PriorityBadge pctLeft={pctLeft} />
          )}
        </div>

        {/* Lista de itens */}
        <ul
          className="overflow-auto pr-2 flex-1 min-h-0"
          style={{
            marginBottom: 'var(--card-spacing)',
            gap: 'calc(var(--card-spacing) * 0.8)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {o.items.map((i, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <span
                  className="font-bold tracking-tight line-clamp-2"
                  style={{ fontSize: 'var(--card-title-size)' }}
                >
                  {i.productName}
                </span>
              </div>
              <span
                className="px-3 py-1 rounded-full border-2 border-neutral-300 font-bold flex-shrink-0 bg-white"
                style={{ fontSize: 'var(--card-body-size)', minWidth: '60px', textAlign: 'center' }}
              >
                x{i.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Botão Concluir */}
        {o.status !== 'Completed' && (
          <Button
            className="complete-button w-full font-bold bg-green-600 hover:bg-green-500 disabled:hover:bg-green-600 text-white transition-all"
            onClick={handleComplete}
            disabled={isCompleting}
            aria-label={`Concluir pedido ${o.id.slice(0, 8)}`}
            data-testid="complete-button"
          >
            {isCompleting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Concluindo...
              </span>
            ) : (
              'Concluir'
            )}
          </Button>
        )}
      </Card>
    </motion.div>
  )
})
