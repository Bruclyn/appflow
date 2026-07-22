'use client'

import { useState } from 'react'
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { EducationModal } from './EducationModal'
import type { EducationPayload } from './EducationModal'
import { formatDateRange } from '@/lib/career-fields'
import type { EducationDTO } from './types'

export interface EducationSectionProps {
  education: EducationDTO[]
  onAdd: (payload: EducationPayload) => Promise<boolean>
  onUpdate: (id: string, payload: EducationPayload) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

export function EducationSection({
  education,
  onAdd,
  onUpdate,
  onDelete,
}: EducationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EducationDTO | null>(null)
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
      id="education"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">Education</h2>
      </div>

      {education.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No education added yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {education.map((edu) => (
            <li key={edu.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{edu.institution}</p>
                  <p className="text-sm text-slate-500">
                    {edu.degree}
                    {edu.field ? ` · ${edu.field}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </p>
                </div>
                <div className="flex flex-none gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(edu)
                      setModalOpen(true)
                    }}
                    aria-label="Edit education"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(edu.id)}
                    aria-label="Delete education"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-danger-light hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {confirmId === edu.id && (
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
                    onClick={() => handleDelete(edu.id)}
                    disabled={deletingId === edu.id}
                    className="rounded bg-danger px-2 py-1 font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {deletingId === edu.id ? 'Deleting…' : 'Delete'}
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
        Add Education
      </button>

      <EducationModal
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
