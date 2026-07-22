'use client'

import { useState } from 'react'
import { ExternalLink, Globe, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SourceCard } from './SourceCard'

interface PortfolioSourceCardProps {
  url: string | null
  onSave: (url: string) => Promise<boolean>
  onRemove: () => Promise<void>
}

export function PortfolioSourceCard({
  url,
  onSave,
  onRemove,
}: PortfolioSourceCardProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(url ?? '')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    setSaving(true)
    const okSaved = await onSave(trimmed)
    setSaving(false)
    if (okSaved) setEditing(false)
  }

  async function remove() {
    setRemoving(true)
    await onRemove()
    setRemoving(false)
    setConfirmingRemove(false)
  }

  const showForm = !url || editing

  return (
    <SourceCard
      icon={<Globe className="h-6 w-6" />}
      title="Portfolio Website"
      description="Add your portfolio URL so AppFlow can reference your work"
    >
      {showForm ? (
        <form onSubmit={submit} className="space-y-2">
          <Input
            type="url"
            inputMode="url"
            placeholder="https://your-portfolio.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Portfolio URL"
            autoFocus={editing}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={saving} className="flex-1">
              {url ? 'Save' : 'Add Portfolio'}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue(url ?? '')
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 truncate text-sm font-medium text-primary hover:underline"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          </a>

          {confirmingRemove ? (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                isLoading={removing}
                onClick={remove}
              >
                Remove
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingRemove(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue(url)
                  setEditing(true)
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-light"
                onClick={() => setConfirmingRemove(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            </div>
          )}
        </div>
      )}
    </SourceCard>
  )
}
