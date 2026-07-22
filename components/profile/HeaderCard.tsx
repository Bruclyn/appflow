'use client'

import { useRef } from 'react'
import { Camera, Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function initials(name: string) {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export interface HeaderCardProps {
  name: string
  setName: (v: string) => void
  headline: string
  setHeadline: (v: string) => void
  location: string
  setLocation: (v: string) => void
  photo: string | null
  onUploadPhoto: (file: File) => void
  uploading: boolean
  dirty: boolean
  saving: boolean
  onSave: () => void
}

export function HeaderCard({
  name,
  setName,
  headline,
  setHeadline,
  location,
  setLocation,
  photo,
  onUploadPhoto,
  uploading,
  dirty,
  saving,
  onSave,
}: HeaderCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section
      id="header"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-card"
    >
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-none">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload profile photo"
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-light text-2xl font-bold text-primary"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(name)
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadPhoto(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex-1 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Full name"
            className="w-full border-b border-transparent bg-transparent pb-1 font-display text-2xl font-semibold text-slate-900 placeholder:text-slate-300 focus:border-border focus:outline-none"
          />
          <Input
            aria-label="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full-Stack Developer | React | Next.js | Python"
          />
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              aria-label="Location"
              className="w-full rounded-md border border-border bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {dirty && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      )}
    </section>
  )
}
