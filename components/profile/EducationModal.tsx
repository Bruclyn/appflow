'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MonthYearField } from './MonthYearField'
import { DEGREES, toMonthYear, monthYearToISO } from '@/lib/career-fields'
import type { EducationDTO } from './types'

export interface EducationPayload {
  institution: string
  degree: string
  field: string | null
  startDate: string
  endDate: string | null
  current: boolean
}

export function EducationModal({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: EducationDTO | null
  onSubmit: (payload: EducationPayload) => Promise<boolean>
}) {
  const [institution, setInstitution] = useState('')
  const [degree, setDegree] = useState('')
  const [field, setField] = useState('')
  const [startMonth, setStartMonth] = useState<number | ''>('')
  const [startYear, setStartYear] = useState('')
  const [current, setCurrent] = useState(false)
  const [endMonth, setEndMonth] = useState<number | ''>('')
  const [endYear, setEndYear] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setInstitution(editing.institution)
      setDegree(editing.degree)
      setField(editing.field ?? '')
      const s = toMonthYear(editing.startDate)
      setStartMonth(s?.month ?? '')
      setStartYear(s ? String(s.year) : '')
      setCurrent(editing.current)
      const e = toMonthYear(editing.endDate)
      setEndMonth(e?.month ?? '')
      setEndYear(e ? String(e.year) : '')
    } else {
      setInstitution('')
      setDegree('')
      setField('')
      setStartMonth('')
      setStartYear('')
      setCurrent(false)
      setEndMonth('')
      setEndYear('')
    }
    setError(null)
  }, [open, editing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!institution.trim()) {
      setError('Institution name is required.')
      return
    }
    if (!degree) {
      setError('Degree is required.')
      return
    }
    if (!field.trim()) {
      setError('Field of study is required.')
      return
    }
    if (startMonth === '' || !startYear) {
      setError('Start date is required.')
      return
    }
    if (!current && (endMonth === '' || !endYear)) {
      setError('End date is required unless you currently study here.')
      return
    }

    const startDate = monthYearToISO(Number(startMonth), Number(startYear))
    const endDate = current ? null : monthYearToISO(Number(endMonth), Number(endYear))

    setSaving(true)
    const okFlag = await onSubmit({
      institution: institution.trim(),
      degree,
      field: field.trim() || null,
      startDate,
      endDate,
      current,
    })
    setSaving(false)
    if (okFlag) onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit Education' : 'Add Education'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Institution name"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="University of Example"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Degree
          </label>
          <select
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="" disabled>
              Select a degree
            </option>
            {DEGREES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Field of study"
          required
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="Computer Science"
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
          I am currently studying here
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Education
          </Button>
        </div>
      </form>
    </Modal>
  )
}
