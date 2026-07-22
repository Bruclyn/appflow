export interface ExperienceDTO {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string | null
}

export interface EducationDTO {
  id: string
  institution: string
  degree: string
  field: string | null
  startDate: string
  endDate: string | null
  current: boolean
}

export interface SkillDTO {
  id: string
  name: string
  category: string | null
}

export interface ProfileInitial {
  name: string
  headline: string
  location: string
  careerField: string
  bio: string
  profilePhoto: string | null
  experiences: ExperienceDTO[]
  education: EducationDTO[]
  skills: SkillDTO[]
  evidenceCount: number
  hasCapabilityProfile: boolean
}
