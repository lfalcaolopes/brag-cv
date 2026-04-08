import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AiResponse, UserProfile } from '../types.js'

const mockAiResponse: AiResponse = {
  suggested_title: 'Senior Software Engineer',
  professional_summary: 'Experienced engineer with expertise in distributed systems.',
  language: 'en',
  skills: {
    languagesAndFrameworks: ['TypeScript', 'Node.js', 'React'],
    databasesAndApis: ['PostgreSQL', 'Redis'],
    infrastructureAndCloud: ['AWS', 'Docker', 'Kubernetes'],
    others: ['REST APIs', 'Git', 'CI/CD'],
  },
  experiences: [
    { company: 'TechCorp', bullets: ['Led migration reducing deploy time by 60%'] },
    { company: 'OpenDoe', bullets: ['Built real-time notification system'] },
  ],
}

const mockProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  linkedin: 'linkedin.com/in/jane',
  github: 'github.com/jane',
  location: 'San Francisco, CA',
  education: [{ institution: 'UC Berkeley', degree: 'B.S. CS', period: '2014-2018' }],
  languages: [{ name: 'English', level: 'Native' }],
  experiences: [
    {
      company: 'TechCorp',
      title: 'Senior Engineer',
      period: 'Jan 2022 - Present',
      description: 'Fintech platform',
    },
    {
      company: 'OpenDoe',
      title: 'Engineer',
      period: 'Jun 2019 - Dec 2021',
      description: 'Enterprise software',
    },
  ],
}

vi.mock('../ai/client.js', () => ({
  analyzeForResume: vi.fn().mockResolvedValue('Mock strategic analysis text'),
  generateFromAnalysis: vi.fn().mockResolvedValue(mockAiResponse),
  generateResumeContent: vi.fn().mockResolvedValue(mockAiResponse),
}))

describe('generate pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('analyzeForResume returns strategic analysis text', async () => {
    const { analyzeForResume } = await import('../ai/client.js')

    const result = await analyzeForResume('brag', 'job', ['TechCorp'])

    expect(result).toBe('Mock strategic analysis text')
  })

  it('generateFromAnalysis returns typed AI output', async () => {
    const { generateFromAnalysis } = await import('../ai/client.js')

    const result = await generateFromAnalysis('analysis', ['TechCorp'])

    expect(result.suggested_title).toBe('Senior Software Engineer')
    expect(result.experiences).toHaveLength(2)
  })

  it('generateResumeContent orchestrates both passes', async () => {
    const { generateResumeContent } = await import('../ai/client.js')

    const result = await generateResumeContent('brag', 'job', ['TechCorp'])

    expect(result.suggested_title).toBe('Senior Software Engineer')
    expect(result.experiences).toHaveLength(2)
  })

  it('full pipeline from AI response to PDF document', async () => {
    const { generateFromAnalysis } = await import('../ai/client.js')
    const { mergeExperiences } = await import('../pdf/merge.js')
    const { buildPdfDocument } = await import('../pdf/document.js')
    const { buildOutputFilename } = await import('../pdf/filename.js')
    const { getLabels } = await import('../locales/index.js')

    const aiResponse = await generateFromAnalysis('analysis', ['TechCorp'])
    const labels = getLabels(aiResponse.language)
    const merged = mergeExperiences(mockProfile.experiences, aiResponse.experiences)
    const doc = buildPdfDocument(mockProfile, aiResponse, merged, labels)
    const filename = buildOutputFilename(mockProfile.name, aiResponse.suggested_title)

    expect(doc.pageSize).toBe('A4')
    expect(merged.length).toBeGreaterThan(0)
    expect(filename).toMatch(/\.pdf$/)
    expect(filename).toContain('senior-software-engineer')
  })
})
