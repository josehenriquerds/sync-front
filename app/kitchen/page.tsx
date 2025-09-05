'use client'

import { KitchenBoard } from "../../components/KitchenBoard"
import { BackButton } from "../../components/ui/back-button"

export default function KitchenPage() {
  return (
    <div className="space-y-3">
      <BackButton />
      <h1 className="text-xl font-semibold">Painel da Cozinha</h1>
      <KitchenBoard />
    </div>
  )
}
