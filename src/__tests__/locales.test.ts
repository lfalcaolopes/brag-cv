import { describe, it, expect, vi } from 'vitest'
import { getLabels } from '../locales/index.js'

describe('getLabels', () => {
  it('returns English labels for "en"', () => {
    const labels = getLabels('en')
    expect(labels.sections.professionalSummary).toBe('Professional Summary')
    expect(labels.skillCategories.languagesAndFrameworks).toBe('Languages & Frameworks')
  })

  it('returns Portuguese labels for "pt"', () => {
    const labels = getLabels('pt')
    expect(labels.sections.professionalSummary).toBe('Resumo Profissional')
    expect(labels.skillCategories.databasesAndApis).toBe('Bancos de Dados & APIs')
  })

  it('falls back to English and warns for unsupported language', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const labels = getLabels('fr')
    expect(labels.sections.professionalSummary).toBe('Professional Summary')
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fr'))
    warnSpy.mockRestore()
  })
})
