'use client'

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { useToast } from "../../components/ui/toast"
import { Product, api, DishType } from "../../lib/api"
import { BackButton } from "../../components/ui/back-button"


type ProductForm = Omit<Product, 'id'>

const DEFAULT_FORM: ProductForm = {
  name: '',
  category: '',
  prepSeconds: 300,
  available: true,
  tags: [],
  isRecurring: false,
  type: 'Prato',
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM)
  const [tagsInput, setTagsInput] = useState<string>('') // edição de tags como string
  const { toast } = useToast()

  const refresh = () => api.listProducts().then(setItems)
  useEffect(() => { refresh() }, [])

  // mantém form.tags em sincronia com a string de entrada
  useEffect(() => {
    const tags = tagsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    setForm(f => ({ ...f, tags }))
  }, [tagsInput])

  async function submit() {
    try {
      await api.createProduct(form)
      toast({ title: 'Produto cadastrado', description: form.name })
      setForm(DEFAULT_FORM)
      setTagsInput('')
      refresh()
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao cadastrar' })
    }
  }

  // util para montar o payload de update sem 'id'
  function toUpdatePayload(p: Product): ProductForm {
    return {
      name: p.name,
      category: p.category,
      prepSeconds: p.prepSeconds,
      available: p.available,
      tags: p.tags,
      isRecurring: p.isRecurring,
      type: p.type,
    }
  }

  return (
    
    <div className="grid gap-4 md:grid-cols-2">
      
      {/* ====== Formulário ====== */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Novo produto</h2>

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Nome"
          value={form.name}
          onChange={e=>setForm({...form, name:e.target.value})}
        />

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Categoria (ex.: Carnes, Frituras, Acompanhamentos…)"
          value={form.category}
          onChange={e=>setForm({...form, category:e.target.value})}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="w-full border rounded-xl p-2"
            placeholder="Prep (s)"
            value={form.prepSeconds}
            onChange={e=>setForm({...form, prepSeconds: Number(e.target.value || 0)})}
          />
          <select
            className="w-full border rounded-xl p-2"
            value={form.type}
            onChange={e=>setForm({...form, type: e.target.value as DishType})}
          >
            <option value="Prato">Prato</option>
            <option value="Porcao">Porção</option>
          </select>
        </div>

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Tags (separe por vírgula)"
          value={tagsInput}
          onChange={e=>setTagsInput(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.available}
              onChange={e=>setForm({...form, available: e.target.checked})}
            />
            Disponível
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={e=>setForm({...form, isRecurring: e.target.checked})}
            />
            Recorrente
          </label>
        </div>

        <Button onClick={submit}>Salvar</Button>
      </Card>

      {/* ====== Lista ====== */}
      <div className="space-y-2">
        <BackButton />
        <h2 className="font-semibold">Produtos</h2>
        <div className="grid gap-2">
          {items.map(p => (
            <Card key={p.id} className="p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-neutral-500">
                  {p.category} • ~{Math.round(p.prepSeconds/60)}m
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.type === 'Porcao' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border">Porção</span>
                  )}
                  {p.isRecurring && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500 text-amber-700">
                      Recorrente
                    </span>
                  )}
                  {p.tags?.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={p.available}
                    onChange={async (e) => {
                      const payload = { ...toUpdatePayload(p), available: e.target.checked }
                      await api.updateProduct(p.id, payload)
                      refresh()
                    }}
                  />
                  Disp.
                </label>
                <Button
                  className="border bg-transparent hover:bg-neutral-50"
                  onClick={async () => {
                    await api.deleteProduct(p.id)
                    refresh()
                  }}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
