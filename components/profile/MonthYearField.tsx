'use client'

import { MONTHS } from '@/lib/career-fields'

const FIELD =
  'rounded-md border border-border bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

export function MonthYearField({
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  label: string
  month: number | ''
  year: string
  onMonthChange: (month: number) => void
  onYearChange: (year: string) => void
}) {
  const maxYear = new Date().getFullYear() + 10

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className={`${FIELD} flex-1`}
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Year"
          value={year}
          min={1950}
          max={maxYear}
          onChange={(e) => onYearChange(e.target.value)}
          className={`${FIELD} w-28`}
        />
      </div>
    </div>
  )
}
