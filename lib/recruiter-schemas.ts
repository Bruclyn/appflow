import { z } from 'zod'

export const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Hybrid'] as const
export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media',
  'Other',
] as const
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'] as const
export const HIRING_SPEEDS = ['Actively Hiring', 'Hiring Soon', 'Building Pipeline'] as const

export const companySchema = z.object({
  companyName: z.string().max(120).nullish(),
  // Stored inline (data URL) since no external file storage is configured yet.
  companyLogo: z.string().max(3_000_000).nullish(),
  industry: z.enum(INDUSTRIES).nullish(),
  companySize: z.enum(COMPANY_SIZES).nullish(),
  website: z.string().max(300).nullish(),
  location: z.string().max(120).nullish(),
  description: z.string().max(500, 'Description must be 500 characters or fewer').nullish(),
  whatWeLookFor: z.string().max(300, 'This must be 300 characters or fewer').nullish(),
  preferredJobTypes: z.array(z.enum(JOB_TYPES)).nullish(),
  hiringSpeed: z.enum(HIRING_SPEEDS).nullish(),
  teamSizeHiring: z.string().max(60).nullish(),
})
