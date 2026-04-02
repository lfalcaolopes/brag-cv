import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserProfile } from '../types.js'

const mockEnProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  linkedin: 'linkedin.com/in/jane',
  github: 'github.com/jane',
  location: 'San Francisco, CA',
  education: [{ institution: 'UC Berkeley', degree: 'B.S. CS', period: '2014-2018' }],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Advanced' },
  ],
  experiences: [
    { company: 'Acme Corp', title: 'Senior Engineer', period: 'Jan 2022 - Present', description: 'Enterprise SaaS' },
    { company: 'Startup Inc', title: 'Engineer', period: 'Jun 2019 - Dec 2021', description: 'Collaboration tool' },
  ],
}

const mockPtProfile: UserProfile = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  linkedin: 'linkedin.com/in/jane',
  github: 'github.com/jane',
  location: 'São Paulo, SP',
  education: [{ institution: 'USP', degree: 'Bacharelado em CC', period: '2014-2018' }],
  languages: [
    { name: 'Português', level: 'Nativo' },
    { name: 'Inglês', level: 'Avançado' },
  ],
  experiences: [
    { company: 'Acme Corp', title: 'Engenheiro Senior', period: 'Jan 2022 - Presente', description: 'SaaS Empresarial' },
    { company: 'Startup Inc', title: 'Engenheiro', period: 'Jun 2019 - Dez 2021', description: 'Ferramenta colaborativa' },
  ],
}

vi.mock('../user-data/en.js', () => ({ USER_PROFILE_EN: mockEnProfile }))
vi.mock('../user-data/pt.js', () => ({ USER_PROFILE_PT: mockPtProfile }))

describe('getUserProfile', () => {
  let getUserProfile: typeof import('../user-data/index.js').getUserProfile

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../user-data/index.js')
    getUserProfile = mod.getUserProfile
  })

  it('returns English profile for "en"', () => {
    const profile = getUserProfile('en')
    expect(profile).toBe(mockEnProfile)
    expect(profile.languages[0].name).toBe('English')
  })

  it('returns Portuguese profile for "pt"', () => {
    const profile = getUserProfile('pt')
    expect(profile).toBe(mockPtProfile)
    expect(profile.languages[0].name).toBe('Português')
  })

  it('falls back to English for unsupported language', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const profile = getUserProfile('fr')
    expect(profile).toBe(mockEnProfile)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fr'))
    warnSpy.mockRestore()
  })

  it('preserves same company names across languages', () => {
    const en = getUserProfile('en')
    const pt = getUserProfile('pt')
    const enCompanies = en.experiences.map((e) => e.company)
    const ptCompanies = pt.experiences.map((e) => e.company)
    expect(enCompanies).toEqual(ptCompanies)
  })

  it('preserves same name and contact info across languages', () => {
    const en = getUserProfile('en')
    const pt = getUserProfile('pt')
    expect(en.name).toBe(pt.name)
    expect(en.email).toBe(pt.email)
    expect(en.linkedin).toBe(pt.linkedin)
    expect(en.github).toBe(pt.github)
  })
})

describe('getCompanyNames', () => {
  it('returns company names from the English profile', async () => {
    const { getCompanyNames } = await import('../user-data/index.js')
    const names = getCompanyNames()
    expect(names).toEqual(['Acme Corp', 'Startup Inc'])
  })
})
