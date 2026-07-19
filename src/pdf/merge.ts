import type { UserProfile, AiResponse, MergedExperience, MergedProject } from '../types.js'

export function mergeExperiences(
  userExperiences: UserProfile['experiences'],
  aiExperiences: AiResponse['experiences']
): readonly MergedExperience[] {
  const userCompanyNames = userExperiences.map((e) => e.company.trim().toLowerCase())

  const unmatchedAi = aiExperiences.filter(
    (ai) => !userCompanyNames.includes(ai.company.trim().toLowerCase())
  )

  if (unmatchedAi.length > 0) {
    const names = unmatchedAi.map((ai) => `"${ai.company}"`).join(', ')
    throw new Error(
      `AI returned companies not found in user profile: ${names}. ` +
      `Expected: ${userExperiences.map((e) => `"${e.company}"`).join(', ')}`
    )
  }

  return userExperiences.map((exp) => {
    const aiMatch = aiExperiences.find(
      (ai) => ai.company.trim().toLowerCase() === exp.company.trim().toLowerCase()
    )

    return {
      company: exp.company,
      title: exp.title,
      period: exp.period,
      description: exp.description,
      bullets: aiMatch?.bullets ?? [],
    }
  })
}

export function mergeProjects(
  userProjects: UserProfile['projects'],
  aiProjects: AiResponse['projects']
): readonly MergedProject[] {
  if (!userProjects || !aiProjects) return []

  const userProjectNames = userProjects.map((e) => e.title.trim().toLowerCase())

  const unmatchedAi = aiProjects.filter(
    (ai) => !userProjectNames.includes(ai.title.trim().toLowerCase())
  )

  if (unmatchedAi.length > 0) {
    const names = unmatchedAi.map((ai) => `"${ai.title}"`).join(', ')
    throw new Error(
      `AI returned projects not found in user profile: ${names}. ` +
      `Expected: ${userProjects.map((e) => `"${e.title}"`).join(', ')}`
    )
  }

  return userProjects.map((exp) => {
    const aiMatch = aiProjects.find(
      (ai) => ai.title.trim().toLowerCase() === exp.title.trim().toLowerCase()
    )

    return {
      title: exp.title,
      period: exp.period,
      description: exp.description,
      bullets: aiMatch?.bullets ?? [],
    }
  })
}
