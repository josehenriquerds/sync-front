'use client'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useToast } from '../../components/ui/toast'
import { Product, api } from '../../lib/api'

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<Omit<Product,'id'>>({ name: '', category: '', prepSeconds: 300, available: true })
  const { toast } = useToast()

  const refresh = () => api.listProducts().then(setItems)
  useEffect(() => { refresh() }, [])

  async function submit() {
    try {
      await api.createProduct(form)
      toast({ title: 'Produto cadastrado', description: form.name })
      setForm({ name: '', category: '', prepSeconds: 300, available: true })
      refresh()
    } catch { toast({ title: 'Erro ao cadastrar' }) }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold">Novo produto</h2>
        <input className="w-full border rounded-xl p-2" placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="w-full border rounded-xl p-2" placeholder="Categoria" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
        <input type="number" className="w-full border rounded-xl p-2" placeholder="Prep (s)" value={form.prepSeconds} onChange={e=>setForm({...form, prepSeconds: Number(e.target.value)})} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={e=>setForm({...form, available: e.target.checked})}/> Disponível</label>
        <Button onClick={submit}>Salvar</Button>
      </Card>
      <div className="space-y-2">
        <h2 className="font-semibold">Produtos</h2>
        <div className="grid gap-2">
          {items.map(p => (
            <Card key={p.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-neutral-500">{p.category} • ~{Math.round(p.prepSeconds/60)}m</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={p.available} onChange={async (e)=>{await api.updateProduct(p.id, { ...p, available: e.target.checked }); refresh()}}/> Disp.</label>
                <Button onClick={async ()=>{ await api.deleteProduct(p.id); refresh() }}>Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
