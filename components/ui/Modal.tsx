'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-elevated focus:outline-none">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-bold text-slate-900">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="text-slate-400 transition hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
