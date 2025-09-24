'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Order, api } from '../lib/api'
import { ensureStarted } from '../lib/signalr'

interface ActiveCountBadgeProps {
  count: number
  onClick?: () => void
  className?: string
}

export function ActiveCountBadge({ count, onClick, className = '' }: ActiveCountBadgeProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push('/kitchen')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-blue-50 hover:bg-blue-100 border border-blue-200
        text-blue-800 font-medium text-sm transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${className}
      `}
      aria-label={`Ir para a Cozinha, ${count} pedidos ativos`}
      title="Clique para ir ao painel da cozinha"
    >
      <span className="text-xs">🍽️</span>
      <span aria-live="polite">
        Ativos na Cozinha: <strong>{count}</strong>
      </span>
    </button>
  )
}

// Hook para usar o contador de pedidos ativos
export function useActiveOrdersCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Função para atualizar contagem
    const updateCount = (orders: Order[]) => {
      const activeCount = orders.filter(o => o.status !== 'Completed').length
      setCount(activeCount)
    }

    // Carrega contagem inicial
    api.listOrders().then(orders => {
      updateCount(orders.filter(o => o.status !== 'Completed'))
    })

    // Conecta ao SignalR para atualizações em tempo real
    ensureStarted().then(conn => {
      // Remove listeners anteriores para evitar duplicatas
      conn.off('order:created')
      conn.off('order:updated')

      // Listener para novos pedidos
      conn.on('order:created', (order: Order) => {
        if (order.status !== 'Completed') {
          setCount(prev => prev + 1)
        }
      })

      // Listener para atualizações de pedidos
      conn.on('order:updated', (order: any) => {
        const map = ['Pending', 'InProgress', 'Completed', 'Cancelled'] as const
        const status: typeof map[number] = typeof order.status === 'number' ? map[order.status] : order.status

        if (status === 'Completed') {
          setCount(prev => Math.max(0, prev - 1))
        }
        // Note: Não precisamos incrementar aqui pois order:created já faz isso
      })
    })

    // Cleanup não é necessário pois a conexão é reutilizada
  }, [])

  return count
}