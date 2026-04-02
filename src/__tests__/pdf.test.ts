import { describe, it, expect } from 'vitest'
import { mergeExperiences } from '../pdf/merge.js'
import { buildOutputFilename } from '../pdf/filename.js'
import { buildPdfDocument } from '../pdf/document.js'
import type { UserProfile, AiResponse } from '../types.js'
import { getLabels } from '../locales/index.js'

const mockProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  linkedin: 'linkedin.com/in/jane',
  github: 'github.com/jane',
  location: 'San Francisco, CA',
  education: [{ institution: 'UC Berkeley', degree: 'B.S. CS', period: '2014-2018' }],
  languages: [{ name: 'English', level: 'Native' }],
  experiences: [
    { company: 'Acme Corp', title: 'Senior Engineer', period: 'Jan 2022 - Present', description: 'Enterprise SaaS (500+ clients)' },
    { company: 'Startup Inc', title: 'Engineer', period: 'Jun 2019 - Dec 2021', description: 'Collaboration tool' },
  ],
}

const mockAiResponse: AiResponse = {
  suggested_title: 'Senior Software Engineer',
  professional_summary: 'Experienced engineer...',
  language: 'en',
  skills: {
    languagesAndFrameworks: ['TypeScript', 'Node.js'],
    databasesAndApis: ['PostgreSQL'],
    infrastructureAndCloud: ['AWS', 'Docker'],
    others: ['Git'],
  },
  experiences: [
    { company: 'Acme Corp', bullets: ['Led migration reducing deploy time by 60%'] },
    { company: 'Startup Inc', bullets: ['Built real-time notification system'] },
  ],
}

describe('mergeExperiences', () => {
  it('merges user experiences with AI bullets by company name', () => {
    const merged = mergeExperiences(mockProfile.experiences, mockAiResponse.experiences)
    expect(merged).toHaveLength(2)
    expect(merged[0].company).toBe('Acme Corp')
    expect(merged[0].title).toBe('Senior Engineer')
    expect(merged[0].bullets).toEqual(['Led migration reducing deploy time by 60%'])
  })

  it('matches company names case-insensitively', () => {
    const aiWithDifferentCase: AiResponse['experiences'] = [
      { company: 'acme corp', bullets: ['Bullet 1'] },
      { company: 'STARTUP INC', bullets: ['Bullet 2'] },
    ]
    const merged = mergeExperiences(mockProfile.experiences, aiWithDifferentCase)
    expect(merged[0].bullets).toEqual(['Bullet 1'])
    expect(merged[1].bullets).toEqual(['Bullet 2'])
  })

  it('returns empty bullets when no AI match for a user company', () => {
    const aiWithOneCompany = [
      { company: 'Acme Corp', bullets: ['Led migration reducing deploy time by 60%'] },
    ]
    const merged = mergeExperiences(mockProfile.experiences, aiWithOneCompany)
    expect(merged[0].bullets).toEqual(['Led migration reducing deploy time by 60%'])
    expect(merged[1].bullets).toEqual([])
  })

  it('throws when AI returns a company not in user profile', () => {
    const aiWithUnknown = [
      { company: 'Acme Corp', bullets: ['Bullet 1'] },
      { company: 'Unknown Co', bullets: ['Bullet 2'] },
    ]
    expect(() => mergeExperiences(mockProfile.experiences, aiWithUnknown)).toThrow(
      'AI returned companies not found in user profile: "Unknown Co"'
    )
  })
})

describe('buildOutputFilename', () => {
  it('generates a slugified filename from suggested_title', () => {
    const filename = buildOutputFilename('Jane Doe', 'Senior Engineer')
    expect(filename).toBe('jane-doe-senior-engineer.pdf')
  })

  it('uses only first and last name', () => {
    const filename = buildOutputFilename('Maria Santos Oliveira', 'Senior Software Engineer')
    expect(filename).toBe('maria-oliveira-senior-software-engineer.pdf')
  })

  it('handles single name', () => {
    const filename = buildOutputFilename('Madonna', 'Lead Developer')
    expect(filename).toBe('madonna-lead-developer.pdf')
  })

  it('normalizes accented characters', () => {
    const filename = buildOutputFilename('José María García', 'Engenheiro de Software')
    expect(filename).toBe('jose-garcia-engenheiro-de-software.pdf')
  })
})

describe('buildPdfDocument', () => {
  it('returns a valid pdfmake document definition', () => {
    const merged = mergeExperiences(mockProfile.experiences, mockAiResponse.experiences)
    const doc = buildPdfDocument(mockProfile, mockAiResponse, merged, getLabels('en'))

    expect(doc.pageSize).toBe('A4')
    expect(doc.content).toBeDefined()
    expect(Array.isArray(doc.content)).toBe(true)
  })

  it('includes all sections in the content with English labels', () => {
    const labels = getLabels('en')
    const merged = mergeExperiences(mockProfile.experiences, mockAiResponse.experiences)
    const doc = buildPdfDocument(mockProfile, mockAiResponse, merged, labels)
    const contentStr = JSON.stringify(doc.content)

    expect(contentStr).toContain('Jane Doe')
    expect(contentStr).toContain('Senior Software Engineer')
    expect(contentStr).toContain('PROFESSIONAL SUMMARY')
    expect(contentStr).toContain('PROFESSIONAL EXPERIENCE')
    expect(contentStr).toContain('EDUCATION')
    expect(contentStr).toContain('LANGUAGES')
    expect(contentStr).toContain('TECHNICAL SKILLS')
    expect(contentStr).toContain('Languages & Frameworks')
    expect(contentStr).toContain('Acme Corp')
    expect(contentStr).toContain('TypeScript')
  })

  it('uses Portuguese labels when pt labels are provided', () => {
    const labels = getLabels('pt')
    const merged = mergeExperiences(mockProfile.experiences, mockAiResponse.experiences)
    const doc = buildPdfDocument(mockProfile, mockAiResponse, merged, labels)
    const contentStr = JSON.stringify(doc.content)

    expect(contentStr).toContain('RESUMO PROFISSIONAL')
    expect(contentStr).toContain('EXPERIÊNCIA PROFISSIONAL')
    expect(contentStr).toContain('FORMAÇÃO ACADÊMICA')
    expect(contentStr).toContain('IDIOMAS')
    expect(contentStr).toContain('HABILIDADES TÉCNICAS')
    expect(contentStr).toContain('Linguagens & Frameworks')
  })
})
