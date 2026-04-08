import { describe, expect, it } from 'vitest'
import {
  buildCodexGenerationPrompt,
  CODEX_INPUT_FILES,
} from '../ai/codex-prompts.js'

describe('buildCodexGenerationPrompt', () => {
  it('references the expected temp input files and limits Codex to those files', () => {
    const prompt = buildCodexGenerationPrompt()

    expect(prompt).toContain(CODEX_INPUT_FILES.bragDocument)
    expect(prompt).toContain(CODEX_INPUT_FILES.jobDescription)
    expect(prompt).toContain(CODEX_INPUT_FILES.context)
    expect(prompt).toContain('Read ONLY these workspace files as source material')
    expect(prompt).toContain('Do not inspect any other file, directory, or hidden file in the workspace.')
  })

  it('keeps the generation rules, company-name exactness, and JSON-only output contract', () => {
    const prompt = buildCodexGenerationPrompt()

    expect(prompt).toContain(`Use ${CODEX_INPUT_FILES.context} as the source of TODAY'S DATE and the exact company names.`)
    expect(prompt).toContain(`The \`company\` field in each experience MUST match one of the company names from ${CODEX_INPUT_FILES.context} exactly.`)
    expect(prompt).toContain('your FINAL RESPONSE must be ONLY the JSON object')
    expect(prompt).toContain('Return ONLY valid JSON matching the format above.')
    expect(prompt).toContain('Do not wrap the JSON in markdown.')
    expect(prompt).toContain('Vary action verbs. Do not repeat the same verb more than twice across all bullets.')
    expect(prompt).toContain('languagesAndFrameworks: programming languages and application frameworks only')
  })
})
