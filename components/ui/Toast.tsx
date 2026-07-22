'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastProps {
  variant: ToastVariant
  title: string
  message?: string
  onDismiss: () => void
  duration?: number
}

const VARIANT: Record<
  ToastVariant,
  { border: string; icon: LucideIcon; iconColor: string; bar: string }
> = {
  success: { border: 'border-l-success', icon: Check, iconColor: 'text-success', bar: 'bg-success' },
  error: { border: 'border-l-danger', icon: X, iconColor: 'text-danger', bar: 'bg-danger' },
  info: { border: 'border-l-primary', icon: Info, iconColor: 'text-primary', bar: 'bg-primary' },
}

export function Toast({
  variant,
  title,
  message,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const { border, icon: Icon, iconColor, bar } = VARIANT[variant]
  const [entered, setEntered] = useState(false)

  // Keep the latest onDismiss without resetting the auto-dismiss timer.
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => dismissRef.current(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-lg border border-border border-l-4 bg-white p-4 shadow-elevated transition-all duration-300',
        border,
        entered ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 flex-none', iconColor)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {message && <p className="mt-0.5 text-sm text-slate-500">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex-none text-slate-400 transition hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <span
        className={cn('absolute bottom-0 left-0 h-1', bar)}
        style={{ animation: `toast-progress ${duration}ms linear forwards` }}
      />
    </div>
  )
}
