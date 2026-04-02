import type { UserProfile } from '../types.js'
import { USER_PROFILE_EN } from './en.js'
import { USER_PROFILE_PT } from './pt.js'

const profiles: Readonly<Record<string, UserProfile>> = {
  en: USER_PROFILE_EN,
  pt: USER_PROFILE_PT,
}

export function getUserProfile(language: string): UserProfile {
  const profile = profiles[language]

  if (!profile) {
    console.warn(`No user profile for language "${language}", falling back to English.`)
    return USER_PROFILE_EN
  }

  return profile
}

export function getCompanyNames(): readonly string[] {
  return USER_PROFILE_EN.experiences.map((e) => e.company)
}
