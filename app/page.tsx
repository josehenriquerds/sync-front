'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/card'

export default function Home() {
  const cards = [
    { href: '/categories', title: 'Pedido por categoria', desc: 'Pedidos por categoria.' },
    { href: '/salon', title: 'Pedido Rápido (Salão)', desc: 'Envie pedidos em 1 toque ou hold.' },
    { href: '/kitchen', title: 'Painel da Cozinha', desc: 'Receba pedidos, timer e ações.' },
    { href: '/products', title: 'Gestão de Produtos', desc: 'Cadastre, edite e remova itens.' },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.href} href={c.href}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="text-sm text-neutral-600">{c.desc}</p>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
