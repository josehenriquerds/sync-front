'use client'
import { createContext, useContext, useState } from 'react'

type ToastItem = { id: number; title: string; description?: string }
type ToastCtxType = { push: (t: Omit<ToastItem,'id'>) => void }

const ToastCtx = createContext<ToastCtxType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = (t: Omit<ToastItem,'id'>) => {
    const id = Date.now()
    setItems((s) => [...s, { id, ...t }])
    setTimeout(() => setItems((s) => s.filter(i => i.id !== id)), 3500)
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {items.map(i => (
          <div key={i.id} className="rounded-2xl bg-white border border-neutral-200 shadow-lg p-3 min-w-[240px]">
            <div className="font-semibold">{i.title}</div>
            {i.description && <div className="text-sm text-neutral-600">{i.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  return { toast: ctx ? ctx.push : (()=>{}) }
}
