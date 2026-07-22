'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MonthYearField } from './MonthYearField'
import { toMonthYear, monthYearToISO } from '@/lib/career-fields'
import type { ExperienceDTO } from './types'

export interface ExperiencePayload {
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string | null
}

export function ExperienceModal({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: ExperienceDTO | null
  onSubmit: (payload: ExperiencePayload) => Promise<boolean>
}) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [startMonth, setStartMonth] = useState<number | ''>('')
  const [startYear, setStartYear] = useState('')
  const [current, setCurrent] = useState(false)
  const [endMonth, setEndMonth] = useState<number | ''>('')
  const [endYear, setEndYear] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setCompany(editing.company)
      setRole(editing.role)
      const s = toMonthYear(editing.startDate)
      setStartMonth(s?.month ?? '')
      setStartYear(s ? String(s.year) : '')
      setCurrent(editing.current)
      const e = toMonthYear(editing.endDate)
      setEndMonth(e?.month ?? '')
      setEndYear(e ? String(e.year) : '')
      setDescription(editing.description ?? '')
    } else {
      setCompany('')
      setRole('')
      setStartMonth('')
      setStartYear('')
      setCurrent(false)
      setEndMonth('')
      setEndYear('')
      setDescription('')
    }
    setError(null)
  }, [open, editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!company.trim() || !role.trim()) {
      setError('Company and job title are required.')
      return
    }
    if (startMonth === '' || !startYear) {
      setError('Start date is required.')
      return
    }
    if (!current && (endMonth === '' || !endYear)) {
      setError('End date is required unless this is your current role.')
      return
    }

    const startDate = monthYearToISO(Number(startMonth), Number(startYear))
    const endDate = current ? null : monthYearToISO(Number(endMonth), Number(endYear))

    setSaving(true)
    const okFlag = await onSubmit({
      company: company.trim(),
      role: role.trim(),
      startDate,
      endDate,
      current,
      description: description.trim() || null,
    })
    setSaving(false)
    if (okFlag) onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit Experience' : 'Add Experience'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company name"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
        />
        <Input
          label="Job title"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Software Engineer"
        />
        <MonthYearField
          label="Start date"
          month={startMonth}
          year={startYear}
          onMonthChange={setStartMonth}
          onYearChange={setStartYear}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={current}
            onChange={(e) => setCurrent(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          I currently work here
        </label>
        {!current && (
          <MonthYearField
            label="End date"
            month={endMonth}
            year={endYear}
            onMonthChange={setEndMonth}
            onYearChange={setEndYear}
          />
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Experience
          </Button>
        </div>
      </form>
    </Modal>
  )
}
