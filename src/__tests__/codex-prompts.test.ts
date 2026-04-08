import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCodexGenerationPrompt } from '../ai/codex-prompts.js'

describe('buildCodexGenerationPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('includes the brag document, job description, and company names', () => {
    const prompt = buildCodexGenerationPrompt(
      'Built internal tools in TypeScript.',
      'Hiring a frontend engineer with React experience.',
      ['Acme Corp', 'Startup Inc']
    )

    expect(prompt).toContain('Built internal tools in TypeScript.')
    expect(prompt).toContain('Hiring a frontend engineer with React experience.')
    expect(prompt).toContain('Acme Corp, Startup Inc')
  })

  it('includes today date and strict JSON-only instructions', () => {
    const prompt = buildCodexGenerationPrompt('brag', 'job', ['Acme Corp'])

    expect(prompt).toContain("TODAY'S DATE: 2026-04-07")
    expect(prompt).toContain('your FINAL RESPONSE must be ONLY the JSON object')
    expect(prompt).toContain('Return ONLY valid JSON matching the format above.')
    expect(prompt).toContain('Do not wrap the JSON in markdown.')
  })
})
