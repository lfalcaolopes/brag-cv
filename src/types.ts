import { z } from 'zod'

export const aiResponseSchema = z.object({
  suggested_title: z.string().min(1, 'suggested_title must not be empty'),
  professional_summary: z.string().min(1, 'professional_summary must not be empty'),
  language: z.string().min(1, 'language must not be empty'),
  skills: z.object({
    languagesAndFrameworks: z.array(z.string().min(1)),
    databasesAndApis: z.array(z.string().min(1)),
    infrastructureAndCloud: z.array(z.string().min(1)),
    others: z.array(z.string().min(1)),
  }),
  experiences: z
    .array(
      z.object({
        company: z.string().min(1, 'company name must not be empty'),
        bullets: z.array(z.string().min(1, 'bullet must not be empty')).min(1, 'each experience must have at least one bullet'),
      })
    )
    .min(1, 'experiences must not be empty'),
})

export type AiResponse = z.infer<typeof aiResponseSchema>

export type Education = Readonly<{
  institution: string
  degree: string
  period: string
}>

export type Language = Readonly<{
  name: string
  level: string
}>

export type Experience = Readonly<{
  company: string
  title: string
  period: string
  description: string
}>

export type UserProfile = Readonly<{
  name: string
  email: string
  linkedin: string
  github: string
  location: string
  education: readonly Education[]
  languages: readonly Language[]
  experiences: readonly Experience[]
}>

export type MergedExperience = Readonly<{
  company: string
  title: string
  period: string
  description: string
  bullets: readonly string[]
}>
