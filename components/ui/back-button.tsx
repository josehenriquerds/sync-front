'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'

export function BackButton({ label = "Voltar" }: { label?: string }) {
  const router = useRouter()

  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => router.back()}
    >
      <ArrowLeft size={16} />
      {label}
    </Button>
  )
}
