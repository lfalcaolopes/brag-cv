import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateResumeContentWithCodex } from '../ai/codex-client.js'
import { saveManualAiResponse } from '../manual-generation/persist.js'
import { writePdf } from '../pdf/writer.js'
import { getCompanyNames } from '../user-data/index.js'

const INPUT_DIR = join(process.cwd(), 'input')

export async function main(): Promise<void> {
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

  console.log('Generating resume content with Codex CLI...')
  const companyNames = getCompanyNames()
  const aiResponse = await generateResumeContentWithCodex(bragDoc, jobDesc, companyNames)

  console.log('Saving AI response for manual regeneration...')
  await saveManualAiResponse(aiResponse)

  console.log('Building PDF...')
  const outputPath = await writePdf(aiResponse)
  console.log(`Resume saved to: ${outputPath}`)
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] && resolve(process.argv[1]) === currentFilePath) {
  main().catch((error) => {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
