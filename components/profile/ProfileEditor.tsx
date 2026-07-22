'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { computeProfileStrength } from '@/lib/profile-strength'
import { HeaderCard } from './HeaderCard'
import { AboutCard } from './AboutCard'
import type { BioStatus } from './AboutCard'
import { ExperienceSection } from './ExperienceSection'
import { EducationSection } from './EducationSection'
import { SkillsSection } from './SkillsSection'
import { CompletionSidebar } from './CompletionSidebar'
import type { ExperiencePayload } from './ExperienceModal'
import type { EducationPayload } from './EducationModal'
import type {
  EducationDTO,
  ExperienceDTO,
  ProfileInitial,
  SkillDTO,
} from './types'

const MAX_PHOTO_BYTES = 1_500_000
const MAX_SKILLS = 30

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.readAsDataURL(file)
  })
}

const byStartDesc = <T extends { startDate: string }>(list: T[]) =>
  [...list].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )

export function ProfileEditor({ initial }: { initial: ProfileInitial }) {
  const router = useRouter()
  const toast = useToast()

  const [name, setName] = useState(initial.name)
  const [headline, setHeadline] = useState(initial.headline)
  const [location, setLocation] = useState(initial.location)
  const [careerField, setCareerField] = useState(initial.careerField)
  const [bio, setBio] = useState(initial.bio)
  const [photo, setPhoto] = useState<string | null>(initial.profilePhoto)

  const [experiences, setExperiences] = useState<ExperienceDTO[]>(
    initial.experiences,
  )
  const [education, setEducation] = useState<EducationDTO[]>(initial.education)
  const [skills, setSkills] = useState<SkillDTO[]>(initial.skills)

  const savedHeader = useRef({
    name: initial.name,
    headline: initial.headline,
    location: initial.location,
  })
  const [headerSaving, setHeaderSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  const bioSaved = useRef(initial.bio)
  const [bioStatus, setBioStatus] = useState<BioStatus>('idle')

  const headerDirty =
    name !== savedHeader.current.name ||
    headline !== savedHeader.current.headline ||
    location !== savedHeader.current.location

  const { strength, items } = computeProfileStrength({
    profilePhoto: photo,
    headline,
    bio,
    experienceCount: experiences.length,
    educationCount: education.length,
    skillCount: skills.length,
    evidenceCount: initial.evidenceCount,
  })

  // Debounced bio auto-save.
  useEffect(() => {
    if (bio === bioSaved.current) return
    const timer = setTimeout(async () => {
      setBioStatus('saving')
      try {
        await apiRequest('PUT', '/api/candidate/profile', { bio })
        bioSaved.current = bio
        setBioStatus('saved')
        router.refresh()
      } catch (e) {
        setBioStatus('idle')
        toast.error('Could not save bio', (e as Error).message)
      }
    }, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio])

  // Fade the "Saved" indicator back to idle.
  useEffect(() => {
    if (bioStatus !== 'saved') return
    const t = setTimeout(() => setBioStatus('idle'), 2500)
    return () => clearTimeout(t)
  }, [bioStatus])

  async function saveHeader() {
    setHeaderSaving(true)
    try {
      await apiRequest('PUT', '/api/candidate/profile', { name, headline, location })
      savedHeader.current = { name, headline, location }
      toast.success('Profile updated successfully')
      router.refresh()
    } catch (e) {
      toast.error('Could not save profile', (e as Error).message)
    } finally {
      setHeaderSaving(false)
    }
  }

  async function uploadPhoto(file: File) {
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image too large', 'Please choose an image under 1.5 MB.')
      return
    }
    setPhotoUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      await apiRequest('PUT', '/api/candidate/profile', { profilePhoto: dataUrl })
      setPhoto(dataUrl)
      toast.success('Photo updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not upload photo', (e as Error).message)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function changeCareerField(value: string) {
    setCareerField(value)
    try {
      await apiRequest('PUT', '/api/candidate/profile', { careerField: value })
      toast.success('Career field updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not update career field', (e as Error).message)
    }
  }

  // --- Experience ---
  async function addExperience(payload: ExperiencePayload): Promise<boolean> {
    try {
      const created = await apiRequest<ExperienceDTO>(
        'POST',
        '/api/candidate/experience',
        payload,
      )
      setExperiences((prev) => byStartDesc([created, ...prev]))
      toast.success('Experience added')
      router.refresh()
      return true
    } catch (e) {
      toast.error('Could not add experience', (e as Error).message)
      return false
    }
  }

  async function updateExperience(
    id: string,
    payload: ExperiencePayload,
  ): Promise<boolean> {
    try {
      const updated = await apiRequest<ExperienceDTO>(
        'PUT',
        `/api/candidate/experience/${id}`,
        payload,
      )
      setExperiences((prev) =>
        byStartDesc(prev.map((e) => (e.id === id ? updated : e))),
      )
      toast.success('Experience updated')
      router.refresh()
      return true
    } catch (e) {
      toast.error('Could not update experience', (e as Error).message)
      return false
    }
  }

  async function deleteExperience(id: string) {
    try {
      await apiRequest('DELETE', `/api/candidate/experience/${id}`)
      setExperiences((prev) => prev.filter((e) => e.id !== id))
      toast.success('Experience deleted')
      router.refresh()
    } catch (e) {
      toast.error('Could not delete experience', (e as Error).message)
    }
  }

  // --- Education ---
  async function addEducation(payload: EducationPayload): Promise<boolean> {
    try {
      const created = await apiRequest<EducationDTO>(
        'POST',
        '/api/candidate/education',
        payload,
      )
      setEducation((prev) => byStartDesc([created, ...prev]))
      toast.success('Education added')
      router.refresh()
      return true
    } catch (e) {
      toast.error('Could not add education', (e as Error).message)
      return false
    }
  }

  async function updateEducation(
    id: string,
    payload: EducationPayload,
  ): Promise<boolean> {
    try {
      const updated = await apiRequest<EducationDTO>(
        'PUT',
        `/api/candidate/education/${id}`,
        payload,
      )
      setEducation((prev) =>
        byStartDesc(prev.map((e) => (e.id === id ? updated : e))),
      )
      toast.success('Education updated')
      router.refresh()
      return true
    } catch (e) {
      toast.error('Could not update education', (e as Error).message)
      return false
    }
  }

  async function deleteEducation(id: string) {
    try {
      await apiRequest('DELETE', `/api/candidate/education/${id}`)
      setEducation((prev) => prev.filter((e) => e.id !== id))
      toast.success('Education deleted')
      router.refresh()
    } catch (e) {
      toast.error('Could not delete education', (e as Error).message)
    }
  }

  // --- Skills ---
  async function addSkill(rawName: string) {
    const nameValue = rawName.trim()
    if (!nameValue) return
    if (skills.length >= MAX_SKILLS) {
      toast.error('Skill limit reached', `You can add up to ${MAX_SKILLS} skills.`)
      return
    }
    if (skills.some((s) => s.name.toLowerCase() === nameValue.toLowerCase())) {
      toast.error('Duplicate skill', 'You already added that skill.')
      return
    }
    try {
      const created = await apiRequest<SkillDTO>('POST', '/api/candidate/skills', {
        name: nameValue,
        category: careerField || null,
      })
      setSkills((prev) => [...prev, created])
      toast.success('Skill added')
      router.refresh()
    } catch (e) {
      toast.error('Could not add skill', (e as Error).message)
    }
  }

  async function removeSkill(id: string) {
    try {
      await apiRequest('DELETE', `/api/candidate/skills/${id}`)
      setSkills((prev) => prev.filter((s) => s.id !== id))
      toast.success('Skill removed')
      router.refresh()
    } catch (e) {
      toast.error('Could not remove skill', (e as Error).message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Build a complete profile so AppFlow can match you accurately
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Available once your profile is published"
          className="inline-flex h-10 cursor-not-allowed items-center rounded-full border border-border px-4 text-sm font-medium text-slate-400"
        >
          View Public Profile
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <HeaderCard
            name={name}
            setName={setName}
            headline={headline}
            setHeadline={setHeadline}
            location={location}
            setLocation={setLocation}
            photo={photo}
            onUploadPhoto={uploadPhoto}
            uploading={photoUploading}
            dirty={headerDirty}
            saving={headerSaving}
            onSave={saveHeader}
          />
          <AboutCard
            bio={bio}
            setBio={setBio}
            bioStatus={bioStatus}
            careerField={careerField}
            onCareerFieldChange={changeCareerField}
          />
          <ExperienceSection
            experiences={experiences}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
          />
          <EducationSection
            education={education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
          />
          <SkillsSection
            skills={skills}
            careerField={careerField}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
        </div>

        <CompletionSidebar strength={strength} items={items} />
      </div>
    </div>
  )
}
