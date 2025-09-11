// app/kitchen/page.tsx
export const dynamic = 'force-dynamic'

import { KitchenBoard } from "../../components/KitchenBoard"
import { BackButton } from "../../components/ui/back-button"

type SearchParams = { tv?: string }

export default function KitchenPage({ searchParams }: { searchParams?: SearchParams }) {
  const isTV = (searchParams?.tv ?? '') === '1'

  return (
    <div className={isTV
      ? "h-[100svh] w-screen overflow-hidden p-[clamp(8px,1.2vw,24px)]"
      : "space-y-3"}
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
