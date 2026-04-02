import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { mergeExperiences } from '../pdf/merge.js'
import { buildPdfDocument } from '../pdf/document.js'
import { buildOutputFilename } from '../pdf/filename.js'
import { buildPdfBuffer } from '../pdf/writer.js'
import { getLabels } from '../locales/index.js'
import { MOCK_PROFILE, MOCK_AI_RESPONSE } from '../fixtures/preview-data.js'

const OUTPUT_DIR = join(process.cwd(), 'output')

async function main(): Promise<void> {
  const lang = process.env.PREVIEW_LANG ?? MOCK_AI_RESPONSE.language

  console.log('Generating preview PDF...')
  const labels = getLabels(lang)
  const merged = mergeExperiences(MOCK_PROFILE.experiences, MOCK_AI_RESPONSE.experiences)
  const docDefinition = buildPdfDocument(MOCK_PROFILE, MOCK_AI_RESPONSE, merged, labels)
  const pdfBuffer = await buildPdfBuffer(docDefinition)

  await mkdir(OUTPUT_DIR, { recursive: true })

  const filename = buildOutputFilename(MOCK_PROFILE.name, MOCK_AI_RESPONSE.suggested_title)
  const outputPath = join(OUTPUT_DIR, filename)

  await writeFile(outputPath, pdfBuffer)
  console.log(`Preview PDF saved to: ${outputPath}`)
}

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
