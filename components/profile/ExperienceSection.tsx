'use client'

import { useState } from 'react'
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react'
import { ExperienceModal } from './ExperienceModal'
import type { ExperiencePayload } from './ExperienceModal'
import { formatDateRange } from '@/lib/career-fields'
import type { ExperienceDTO } from './types'

export interface ExperienceSectionProps {
  experiences: ExperienceDTO[]
  onAdd: (payload: ExperiencePayload) => Promise<boolean>
  onUpdate: (id: string, payload: ExperiencePayload) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

export function ExperienceSection({
  experiences,
  onAdd,
  onUpdate,
  onDelete,
}: ExperienceSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExperienceDTO | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  return (
    <section
      id="experience"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">Experience</h2>
      </div>

      {experiences.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No experience added yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {experiences.map((exp) => (
            <li key={exp.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{exp.company}</p>
                  <p className="text-sm text-slate-500">{exp.role}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                  {exp.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-none gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(exp)
                      setModalOpen(true)
                    }}
                    aria-label="Edit experience"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(exp.id)}
                    aria-label="Delete experience"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-danger-light hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {confirmId === exp.id && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-danger-light px-3 py-2 text-sm">
                  <span className="mr-auto font-medium text-danger">
                    Are you sure?
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded px-2 py-1 text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="rounded bg-danger px-2 py-1 font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {deletingId === exp.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setEditing(null)
          setModalOpen(true)
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add Experience
      </button>

      <ExperienceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        onSubmit={(payload) =>
          editing ? onUpdate(editing.id, payload) : onAdd(payload)
        }
      />
    </section>
  )
}
