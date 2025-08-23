'use client'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function AlertOverlay({
  show, text, onDone,
}: { show: boolean; text: string; onDone: () => void }) {
  useEffect(() => {
    if (!show) return
    const id = setTimeout(onDone, 5000) // 5s e some
    return () => clearTimeout(id)
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* fundo piscando */}
          <div className="absolute inset-0 kitchen-flash" />
          {/* conteúdo */}
          <div className="relative text-center px-10">
            <div className="text-8xl md:text-10xl font-extrabold mix-blend-difference text-white drop-shadow">
              {text}
            </div>
            <div className="mt-2 text-white/70 mix-blend-difference">novo pedido</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
