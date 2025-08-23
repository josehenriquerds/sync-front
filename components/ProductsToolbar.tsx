
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './ui/utils'

export type Filter = {
  q: string
  categories: string[]
  onlyAvailable: boolean
  sort: 'az'|'sold'|'fast'
}

export default function ProductsToolbar({
  allCategories,
  initial,
  onChange
}:{
  allCategories: string[]
  initial?: Partial<Filter>
  onChange:(f:Filter)=>void
}) {
  const [state, set] = useState<Filter>({
    q: '', categories: [], onlyAvailable: true, sort: 'az',
    ...initial
  })
  const deb = useRef<any>()

  useEffect(()=>{ onChange(state) }, [state]) // eslint-disable-line

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b p-3 space-y-3">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="Buscar por nome ou tag…"
          defaultValue={state.q}
          onChange={(e)=>{
            clearTimeout(deb.current)
            const q = e.target.value
            deb.current = setTimeout(()=> set(s=>({ ...s, q })), 250)
          }}
        />
        <label className="ml-2 flex items-center gap-2 text-sm select-none">
          <input type="checkbox"
                 checked={state.onlyAvailable}
                 onChange={e=> set(s=>({ ...s, onlyAvailable: e.target.checked }))}/>
          Disponíveis
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {allCategories.map(c=>{
          const active = state.categories.includes(c)
          return (
            <button
              key={c}
              className={cn(
                "px-3 py-1 rounded-full border text-sm",
                active && "bg-black text-white border-black"
              )}
              onClick={()=>
                set(s=>{
                  const on = s.categories.includes(c)
                  return { ...s, categories: on ? s.categories.filter(x=>x!==c) : [...s.categories, c] }
                })
              }
            >
              {c}
            </button>
          )
        })}
        {state.categories.length>0 && (
          <button
            className="px-3 py-1 rounded-full border text-sm text-neutral-600"
            onClick={()=> set(s=>({ ...s, categories: [] }))}
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
