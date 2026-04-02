import { describe, it, expect } from 'vitest'
import { buildAnalysisPrompt, buildGenerationPrompt } from '../ai/prompts.js'

describe('buildAnalysisPrompt', () => {
  const bragDoc = 'Led migration to microservices at Acme Corp'
  const jobDesc = 'Looking for a Senior Engineer at TechCo'
  const companyNames = ['Acme Corp', 'Startup Inc']

  it('includes the brag document content', () => {
    const prompt = buildAnalysisPrompt(bragDoc, jobDesc, companyNames)
    expect(prompt).toContain(bragDoc)
  })

  it('includes the job description content', () => {
    const prompt = buildAnalysisPrompt(bragDoc, jobDesc, companyNames)
    expect(prompt).toContain(jobDesc)
  })

  it('includes all company names', () => {
    const prompt = buildAnalysisPrompt(bragDoc, jobDesc, companyNames)
    expect(prompt).toContain('Acme Corp')
    expect(prompt).toContain('Startup Inc')
  })

  it('has clear section labels', () => {
    const prompt = buildAnalysisPrompt(bragDoc, jobDesc, companyNames)
    expect(prompt).toContain('BRAG DOCUMENT:')
    expect(prompt).toContain('JOB DESCRIPTION:')
    expect(prompt).toContain('COMPANY NAMES')
  })
})

describe('buildGenerationPrompt', () => {
  const analysis = 'Strategic analysis: candidate is a strong fit'
  const companyNames = ['Acme Corp']

  it('includes the strategic analysis', () => {
    const prompt = buildGenerationPrompt(analysis, companyNames)
    expect(prompt).toContain('STRATEGIC ANALYSIS:')
    expect(prompt).toContain(analysis)
  })

  it('does not include brag document', () => {
    const prompt = buildGenerationPrompt(analysis, companyNames)
    expect(prompt).not.toContain('BRAG DOCUMENT')
  })

  it('includes company names', () => {
    const prompt = buildGenerationPrompt(analysis, companyNames)
    expect(prompt).toContain('COMPANY NAMES TO USE')
    expect(prompt).toContain('Acme Corp')
  })
})
