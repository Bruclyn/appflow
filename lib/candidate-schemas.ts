import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  headline: z.string().max(120).nullish(),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer').nullish(),
  location: z.string().max(120).nullish(),
  careerField: z.string().max(60).nullish(),
  // Stored inline (data URL) since no external file storage is configured yet.
  profilePhoto: z.string().max(3_000_000).nullish(),
})

export const experienceSchema = z
  .object({
    company: z.string().min(1, 'Company is required').max(120),
    role: z.string().min(1, 'Role is required').max(120),
    startDate: z.coerce.date({ message: 'Start date is required' }),
    endDate: z.coerce.date().nullish(),
    current: z.boolean().optional().default(false),
    description: z.string().max(2000).nullish(),
  })
  .refine((d) => d.current || d.endDate != null, {
    message: 'End date is required unless this is your current role',
    path: ['endDate'],
  })

export const educationSchema = z
  .object({
    institution: z.string().min(1, 'Institution is required').max(160),
    degree: z.string().min(1, 'Degree is required').max(60),
    field: z.string().max(120).nullish(),
    startDate: z.coerce.date({ message: 'Start date is required' }),
    endDate: z.coerce.date().nullish(),
    current: z.boolean().optional().default(false),
  })
  .refine((d) => d.current || d.endDate != null, {
    message: 'End date is required unless you currently study here',
    path: ['endDate'],
  })

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(60),
  category: z.string().max(60).nullish(),
})
