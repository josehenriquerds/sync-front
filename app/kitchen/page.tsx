'use client'

import { useSearchParams } from 'next/navigation'
import { KitchenBoard } from "../../components/KitchenBoard"
import { BackButton } from "../../components/ui/back-button"

export default function KitchenPage() {
  const sp = useSearchParams()
  const isTV = sp.get('tv') === '1' // ative com ?tv=1

  return (
    <div
      className={
        isTV
          ? // Tela cheia sem scroll para TV
            "h-[100svh] w-screen overflow-hidden p-[clamp(8px,1.2vw,24px)]"
          : // Layout normal com header
            "space-y-3"
      }
    >
      {!isTV && (
        <>
          <BackButton />
          <h1 className="text-xl font-semibold">Painel da Cozinha</h1>
        </>
      )}

      <KitchenBoard tv={isTV} />
    </div>
  )
}
