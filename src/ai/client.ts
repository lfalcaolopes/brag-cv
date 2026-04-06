import { generateText, Output } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { aiResponseSchema, type AiResponse } from '../types.js'
import {
  ANALYSIS_SYSTEM_PROMPT,
  GENERATION_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildGenerationPrompt,
} from './prompts.js'
import { DEFAULT_MODEL, ANALYSIS_TEMPERATURE, GENERATION_TEMPERATURE } from '../config.js'

const openrouter = createOpenRouter()

export async function analyzeForResume(
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<string> {
  const { text } = await generateText({
    model: openrouter(DEFAULT_MODEL),
    temperature: ANALYSIS_TEMPERATURE,
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(bragDoc, jobDesc, companyNames),
  })

  if (!text) {
    throw new Error('AI did not return a valid analysis')
  }

  return text
}

export async function generateFromAnalysis(
  analysis: string,
  companyNames: readonly string[]
): Promise<AiResponse> {
  const { output } = await generateText({
    model: openrouter(DEFAULT_MODEL),
    temperature: GENERATION_TEMPERATURE,
    system: GENERATION_SYSTEM_PROMPT,
    prompt: buildGenerationPrompt(analysis, companyNames),
    output: Output.object({
      schema: aiResponseSchema,
    }),
  })

  if (!output) {
    throw new Error('AI did not return a valid resume object')
  }

  return output
}

export async function generateResumeContent(
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<AiResponse> {
  const analysis = await analyzeForResume(bragDoc, jobDesc, companyNames)
  return generateFromAnalysis(analysis, companyNames)
}
