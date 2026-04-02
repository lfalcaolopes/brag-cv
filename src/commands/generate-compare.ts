import 'dotenv/config'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { generateText, Output } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { getUserProfile, getCompanyNames } from '../user-data/index.js'
import {
  ANALYSIS_SYSTEM_PROMPT,
  GENERATION_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  buildGenerationPrompt,
} from '../ai/prompts.js'
import { mergeExperiences } from '../pdf/merge.js'
import { buildPdfDocument } from '../pdf/document.js'
import { buildOutputFilename } from '../pdf/filename.js'
import { buildPdfBuffer } from '../pdf/writer.js'
import { getLabels } from '../locales/index.js'
import { aiResponseSchema, type AiResponse } from '../types.js'
import { variants, type Variant } from '../compare-config.js'

const INPUT_DIR = join(process.cwd(), 'input')
const OUTPUT_DIR = join(process.cwd(), 'output')

const openrouter = createOpenRouter()

type VariantResult = Readonly<{
  name: string
  analysisModel: string
  analysisTemperature: number
  generationModel: string
  generationTemperature: number
  analysis: string
  generation: AiResponse
}>

async function runVariant(
  variant: Variant,
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<VariantResult> {
  console.log(`\n--- Running variant: ${variant.name} ---`)
  console.log(`  Analysis model: ${variant.analysis.model} (temp: ${variant.analysis.temperature})`)
  console.log(`  Generation model: ${variant.generation.model} (temp: ${variant.generation.temperature})`)

  console.log(`  [${variant.name}] Analyzing...`)
  const { text: analysis } = await generateText({
    model: openrouter(variant.analysis.model),
    temperature: variant.analysis.temperature,
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(bragDoc, jobDesc, companyNames),
  })

  if (!analysis) {
    throw new Error(`[${variant.name}] AI did not return a valid analysis`)
  }

  console.log(`  [${variant.name}] Generating resume content...`)
  const { output } = await generateText({
    model: openrouter(variant.generation.model),
    temperature: variant.generation.temperature,
    system: GENERATION_SYSTEM_PROMPT,
    prompt: buildGenerationPrompt(analysis, companyNames),
    output: Output.object({
      schema: aiResponseSchema,
    }),
  })

  if (!output) {
    throw new Error(`[${variant.name}] AI did not return a valid resume object`)
  }

  const aiResponse: AiResponse = output

  console.log(`  [${variant.name}] Building PDF...`)
  const profile = getUserProfile(aiResponse.language)
  const labels = getLabels(aiResponse.language)
  const merged = mergeExperiences(profile.experiences, aiResponse.experiences)
  const docDefinition = buildPdfDocument(profile, aiResponse, merged, labels)

  const pdfBuffer = await buildPdfBuffer(docDefinition)

  const baseFilename = buildOutputFilename(profile.name, aiResponse.suggested_title)
  const filename = baseFilename.replace(/\.pdf$/, `-${variant.name}.pdf`)
  const outputPath = join(OUTPUT_DIR, filename)

  await writeFile(outputPath, pdfBuffer)
  console.log(`  [${variant.name}] Saved to: ${outputPath}`)

  return {
    name: variant.name,
    analysisModel: variant.analysis.model,
    analysisTemperature: variant.analysis.temperature,
    generationModel: variant.generation.model,
    generationTemperature: variant.generation.temperature,
    analysis,
    generation: aiResponse,
  }
}

function buildCompareLog(results: readonly VariantResult[]): string {
  const separator = '='.repeat(80)
  const sections = results.map((r) => {
    const header = [
      separator,
      `VARIANT: ${r.name}`,
      `  Analysis model:   ${r.analysisModel} (temp: ${r.analysisTemperature})`,
      `  Generation model: ${r.generationModel} (temp: ${r.generationTemperature})`,
      separator,
    ].join('\n')

    const analysisSection = [
      '',
      '--- ANALYSIS OUTPUT ---',
      '',
      r.analysis,
    ].join('\n')

    const generationSection = [
      '',
      '--- GENERATION OUTPUT ---',
      '',
      JSON.stringify(r.generation, null, 2),
    ].join('\n')

    return [header, analysisSection, generationSection].join('\n')
  })

  return sections.join('\n\n\n')
}

async function main(): Promise<void> {
  if (variants.length === 0) {
    throw new Error('No variants configured in src/compare-config.ts')
  }

  if (variants.length > 3) {
    throw new Error('Maximum 3 variants allowed')
  }

  const bragDocPath = join(INPUT_DIR, 'brag_document.md')
  const jobDescPath = join(INPUT_DIR, 'job_description.md')

  const [bragDoc, jobDesc] = await Promise.all([
    readFile(bragDocPath, 'utf-8').catch(() => {
      throw new Error(`Brag document not found at ${bragDocPath}`)
    }),
    readFile(jobDescPath, 'utf-8').catch(() => {
      throw new Error(`Job description not found at ${jobDescPath}`)
    }),
  ])

  await mkdir(OUTPUT_DIR, { recursive: true })

  const companyNames = getCompanyNames()

  console.log(`Starting comparison with ${variants.length} variant(s)...`)

  const results: VariantResult[] = []
  for (const variant of variants) {
    const result = await runVariant(variant, bragDoc, jobDesc, companyNames)
    results.push(result)
  }

  const logPath = join(OUTPUT_DIR, 'compare-output.txt')
  await writeFile(logPath, buildCompareLog(results), 'utf-8')
  console.log(`\nPrompt outputs saved to: ${logPath}`)
  console.log('Comparison complete!')
}

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
