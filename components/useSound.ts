'use client'
import { useCallback, useRef, useState } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [enabled, setEnabled] = useState(false)

  const ensureSound = useCallback(async () => {
    if (typeof window === 'undefined') return false
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch { /* ignore */ }
    }
    setEnabled(ctx.state === 'running')
    return ctx.state === 'running'
  }, [])

  const beep = useCallback((times = 3) => {
    const ctx = ctxRef.current
    if (!ctx || ctx.state !== 'running') return
    const now = ctx.currentTime
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 880 // tom de alerta
      gain.gain.setValueAtTime(0.0001, now + i * 0.4)
      gain.gain.exponentialRampToValueAtTime(0.6, now + i * 0.4 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.4 + 0.25)

      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(now + i * 0.4)
      osc.stop(now + i * 0.4 + 0.26)
    }
  }, [])

  return { enabled, ensureSound, beep }
}
