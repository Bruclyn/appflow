'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  error?: string
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required,
  minLength,
  error,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full rounded-md border bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border',
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}
