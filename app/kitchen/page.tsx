'use client'

import { KitchenBoard } from "../../components/KitchenBoard"

export default function KitchenPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Painel da Cozinha</h1>
      <p className="text-sm text-neutral-600">Pedidos em tempo real. Badge muda de cor conforme o tempo restante.</p>
      <KitchenBoard />
    </div>
  )
}
