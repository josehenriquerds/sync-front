'use client'
import { motion } from 'framer-motion'
import { PriorityBadge } from './PriorityBadge'
import { useEffect, useMemo, useState } from 'react'
import { Order } from '../lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'

function secsBetween(a: Date, b: Date) { return Math.max(0, Math.floor((b.getTime()-a.getTime())/1000)) }

export function OrderCard({ o, onStart, onComplete }:
  { o: Order; onStart: ()=>void; onComplete: ()=>void }) {
  const maxPrep = useMemo(()=> Math.max(60, ...o.items.map(i => i.prepSeconds)), [o])
  const created = useMemo(()=> new Date(o.createdAt), [o.createdAt])
  const [now, setNow] = useState<Date>(new Date())

  useEffect(()=>{ const id = setInterval(()=> setNow(new Date()), 1000); return ()=> clearInterval(id) }, [])

  const elapsed = secsBetween(created, now)
  const left = Math.max(0, maxPrep - elapsed)
  const pctLeft = Math.round((left / maxPrep) * 100)
  const pctBar = Math.round((elapsed / maxPrep) * 100)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}>
      <Card className={`p-4 ${o.isUrgent ? 'border-red-400 ring-2 ring-red-200' : ''}`}>
  <div className="flex items-center justify-between">
    <div className="font-semibold">#{o.id.slice(0,8)}</div>
    {o.isUrgent ? (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
        URGENTE
      </span>
    ) : (
      <PriorityBadge pctLeft={pctLeft} />
    )}
  </div>
        <ul className="mt-2 text-sm text-neutral-700 space-y-1">
          {o.items.map((i, idx) => (
            <li key={idx}>• {i.productName} x{i.quantity} <span className="text-neutral-500">(~{Math.round(i.prepSeconds/60)}m)</span></li>
          ))}
        </ul>
        <div className="mt-3">
          <Progress value={pctBar} />
          <div className="text-xs text-neutral-500 mt-1">restante ~ {Math.max(0, Math.ceil(left/60))}m</div>
        </div>
        <div className="mt-3 flex gap-2">
          {o.status === 'Pending' && <Button onClick={onStart}>Iniciar preparo</Button>}
          {o.status !== 'Completed' && <Button onClick={onComplete}>Concluir</Button>}
        </div>
      </Card>
    </motion.div>
  )
}
