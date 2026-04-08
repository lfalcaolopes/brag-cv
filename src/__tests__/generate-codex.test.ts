import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AiResponse } from '../types.js'

const readFileMock = vi.fn()
const generateResumeContentWithCodexMock = vi.fn()
const saveManualAiResponseMock = vi.fn()
const writePdfMock = vi.fn()
const getCompanyNamesMock = vi.fn()

vi.mock('node:fs/promises', () => ({
  readFile: readFileMock,
}))

vi.mock('../ai/codex-client.js', () => ({
  generateResumeContentWithCodex: generateResumeContentWithCodexMock,
}))

vi.mock('../manual-generation/persist.js', () => ({
  saveManualAiResponse: saveManualAiResponseMock,
}))

vi.mock('../pdf/writer.js', () => ({
  writePdf: writePdfMock,
}))

vi.mock('../user-data/index.js', () => ({
  getCompanyNames: getCompanyNamesMock,
}))

const mockAiResponse: AiResponse = {
  suggested_title: 'Frontend Developer',
  professional_summary: 'Frontend developer with React and TypeScript in SaaS.',
  language: 'en',
  skills: {
    languagesAndFrameworks: ['TypeScript', 'React'],
    databasesAndApis: ['REST APIs'],
    infrastructureAndCloud: ['Docker'],
    others: ['Vitest'],
  },
  experiences: [
    {
      company: 'Acme Corp',
      bullets: ['Built a React dashboard, reducing support tickets by 20%.'],
    },
  ],
}

describe('generate-codex command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    readFileMock
      .mockResolvedValueOnce('brag doc content')
      .mockResolvedValueOnce('job description content')
    getCompanyNamesMock.mockReturnValue(['Acme Corp', 'Startup Inc'])
    generateResumeContentWithCodexMock.mockResolvedValue(mockAiResponse)
    saveManualAiResponseMock.mockResolvedValue(undefined)
    writePdfMock.mockResolvedValue('/tmp/resume.pdf')
  })

  it('orchestrates Codex generation, persistence, and PDF writing', async () => {
    const { main } = await import('../commands/generate-codex.js')

    await main()

    expect(readFileMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('input/brag_document.md'),
      'utf-8'
    )
    expect(readFileMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('input/job_description.md'),
      'utf-8'
    )
    expect(generateResumeContentWithCodexMock).toHaveBeenCalledWith(
      'brag doc content',
      'job description content',
      ['Acme Corp', 'Startup Inc']
    )
    expect(saveManualAiResponseMock).toHaveBeenCalledWith(mockAiResponse)
    expect(writePdfMock).toHaveBeenCalledWith(mockAiResponse)
  })
})
