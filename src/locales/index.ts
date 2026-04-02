import type { Labels } from './types.js'
import { en } from './en.js'
import { pt } from './pt.js'

const locales: Readonly<Record<string, Labels>> = { en, pt }

export function getLabels(language: string): Labels {
  const labels = locales[language]
  if (!labels) {
    console.warn(`Unsupported language "${language}", falling back to English`)
    return en
  }
  return labels
}

export type { Labels } from './types.js'
