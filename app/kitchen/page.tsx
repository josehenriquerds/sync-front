// app/kitchen/page.tsx
export const dynamic = 'force-dynamic' // evita SSG/erro de prerender

import { KitchenBoard } from "../../components/KitchenBoard"
import { BackButton } from "../../components/ui/back-button"

export default function KitchenPage() {
  return (
    // cobre a viewport inteira, ignorando qualquer max-w do layout global
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-50">
      <BackButton />
      <div className="h-[100svh] w-screen overflow-hidden p-[clamp(8px,1.2vw,24px)]">
        <KitchenBoard />
      </div>
    </div>
  )
}
