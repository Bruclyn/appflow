'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { CompanyHeaderCard } from './CompanyHeaderCard'
import { AboutCompanyCard } from './AboutCompanyCard'
import { HiringPreferencesCard } from './HiringPreferencesCard'
import { TeamMembersCard } from './TeamMembersCard'

const MAX_LOGO_BYTES = 1_500_000

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.readAsDataURL(file)
  })
}

export interface CompanyInitial {
  companyName: string
  companyLogo: string | null
  industry: string
  companySize: string
  website: string
  location: string
  description: string
  whatWeLookFor: string
  preferredJobTypes: string[]
  hiringSpeed: string
  teamSizeHiring: string
  userName: string
  userEmail: string
}

export function CompanyEditor({ initial }: { initial: CompanyInitial }) {
  const router = useRouter()
  const toast = useToast()

  const [companyName, setCompanyName] = useState(initial.companyName)
  const [industry, setIndustry] = useState(initial.industry)
  const [companySize, setCompanySize] = useState(initial.companySize)
  const [website, setWebsite] = useState(initial.website)
  const [location, setLocation] = useState(initial.location)
  const [logo, setLogo] = useState<string | null>(initial.companyLogo)
  const [logoUploading, setLogoUploading] = useState(false)
  const [headerSaving, setHeaderSaving] = useState(false)
  const savedHeader = useRef({
    companyName: initial.companyName,
    industry: initial.industry,
    companySize: initial.companySize,
    website: initial.website,
    location: initial.location,
  })
  const headerDirty =
    companyName !== savedHeader.current.companyName ||
    industry !== savedHeader.current.industry ||
    companySize !== savedHeader.current.companySize ||
    website !== savedHeader.current.website ||
    location !== savedHeader.current.location

  const [description, setDescription] = useState(initial.description)
  const [whatWeLookFor, setWhatWeLookFor] = useState(initial.whatWeLookFor)
  const [aboutSaving, setAboutSaving] = useState(false)
  const savedAbout = useRef({
    description: initial.description,
    whatWeLookFor: initial.whatWeLookFor,
  })
  const aboutDirty =
    description !== savedAbout.current.description ||
    whatWeLookFor !== savedAbout.current.whatWeLookFor

  const [jobTypes, setJobTypes] = useState<string[]>(initial.preferredJobTypes)
  const [hiringSpeed, setHiringSpeed] = useState(initial.hiringSpeed)
  const [teamSizeHiring, setTeamSizeHiring] = useState(initial.teamSizeHiring)
  const [hiringSaving, setHiringSaving] = useState(false)
  const savedHiring = useRef({
    jobTypes: initial.preferredJobTypes,
    hiringSpeed: initial.hiringSpeed,
    teamSizeHiring: initial.teamSizeHiring,
  })
  const hiringDirty =
    jobTypes.join(',') !== savedHiring.current.jobTypes.join(',') ||
    hiringSpeed !== savedHiring.current.hiringSpeed ||
    teamSizeHiring !== savedHiring.current.teamSizeHiring

  function toggleJobType(type: string) {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  async function saveHeader() {
    setHeaderSaving(true)
    try {
      await apiRequest('PUT', '/api/recruiter/company', {
        companyName,
        industry: industry || null,
        companySize: companySize || null,
        website: website || null,
        location: location || null,
      })
      savedHeader.current = { companyName, industry, companySize, website, location }
      toast.success('Company profile updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not save company profile', (e as Error).message)
    } finally {
      setHeaderSaving(false)
    }
  }

  async function uploadLogo(file: File) {
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Image too large', 'Please choose an image under 1.5 MB.')
      return
    }
    setLogoUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      await apiRequest('PUT', '/api/recruiter/company', { companyLogo: dataUrl })
      setLogo(dataUrl)
      toast.success('Logo updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not upload logo', (e as Error).message)
    } finally {
      setLogoUploading(false)
    }
  }

  async function saveAbout() {
    setAboutSaving(true)
    try {
      await apiRequest('PUT', '/api/recruiter/company', { description, whatWeLookFor })
      savedAbout.current = { description, whatWeLookFor }
      toast.success('About section updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not save', (e as Error).message)
    } finally {
      setAboutSaving(false)
    }
  }

  async function saveHiring() {
    setHiringSaving(true)
    try {
      await apiRequest('PUT', '/api/recruiter/company', {
        preferredJobTypes: jobTypes,
        hiringSpeed: hiringSpeed || null,
        teamSizeHiring: teamSizeHiring || null,
      })
      savedHiring.current = { jobTypes, hiringSpeed, teamSizeHiring }
      toast.success('Hiring preferences updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not save', (e as Error).message)
    } finally {
      setHiringSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Company Profile</h1>
        <button
          type="button"
          disabled
          title="Available once your company profile is published"
          className="inline-flex h-10 cursor-not-allowed items-center rounded-full border border-border px-4 text-sm font-medium text-slate-400"
        >
          View Public Profile
        </button>
      </div>

      <CompanyHeaderCard
        companyName={companyName}
        setCompanyName={setCompanyName}
        industry={industry}
        setIndustry={setIndustry}
        companySize={companySize}
        setCompanySize={setCompanySize}
        website={website}
        setWebsite={setWebsite}
        location={location}
        setLocation={setLocation}
        logo={logo}
        onUploadLogo={uploadLogo}
        uploading={logoUploading}
        dirty={headerDirty}
        saving={headerSaving}
        onSave={saveHeader}
      />

      <AboutCompanyCard
        description={description}
        setDescription={setDescription}
        whatWeLookFor={whatWeLookFor}
        setWhatWeLookFor={setWhatWeLookFor}
        dirty={aboutDirty}
        saving={aboutSaving}
        onSave={saveAbout}
      />

      <HiringPreferencesCard
        jobTypes={jobTypes}
        toggleJobType={toggleJobType}
        hiringSpeed={hiringSpeed}
        setHiringSpeed={setHiringSpeed}
        teamSizeHiring={teamSizeHiring}
        setTeamSizeHiring={setTeamSizeHiring}
        dirty={hiringDirty}
        saving={hiringSaving}
        onSave={saveHiring}
      />

      <TeamMembersCard name={initial.userName} email={initial.userEmail} />
    </div>
  )
}
