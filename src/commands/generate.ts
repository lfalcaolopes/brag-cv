import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getCompanyNames } from '../user-data/index.js'
import { analyzeForResume, generateFromAnalysis } from '../ai/client.js'
import { writePdf } from '../pdf/writer.js'

const INPUT_DIR = join(process.cwd(), 'input')

async function main(): Promise<void> {
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

  console.log('Analyzing job description and brag document...')
  const companyNames = getCompanyNames()
  const analysis = await analyzeForResume(bragDoc, jobDesc, companyNames)

  console.log('Generating resume content from analysis...')
  const aiResponse = await generateFromAnalysis(analysis, companyNames)

  console.log('Building PDF...')
  const outputPath = await writePdf(aiResponse)
  console.log(`Resume saved to: ${outputPath}`)
}

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
