import { z } from 'zod'

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Remote',
  'Hybrid',
] as const

const competencySchema = z.object({
  name: z.string().min(1).max(80),
  importance: z.enum(['Critical', 'Important', 'Nice to Have']),
  weight: z.number().min(0).max(100),
  rationale: z.string().max(600).optional().default(''),
})

const frameworkSchema = z.object({
  competencies: z.array(competencySchema).max(12),
  experienceLevel: z.string().max(40).optional(),
  keyResponsibilities: z.array(z.string().max(300)).max(20).optional(),
  niceToHave: z.array(z.string().max(300)).max(20).optional(),
})

export const jobInputSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(150),
  description: z.string().min(100, 'Description must be at least 100 characters').max(10000),
  requirements: z.string().max(5000).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  jobType: z.enum(JOB_TYPES).optional().nullable(),
  salaryMin: z.number().int().min(0).max(100_000_000).optional().nullable(),
  salaryMax: z.number().int().min(0).max(100_000_000).optional().nullable(),
  competencyFramework: frameworkSchema.optional().nullable(),
  isActive: z.boolean().optional(),
})

export const jobUpdateSchema = jobInputSchema.partial()

export type JobInput = z.infer<typeof jobInputSchema>
