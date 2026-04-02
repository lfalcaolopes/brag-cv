import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import PdfPrinter from 'pdfmake'
import type { TDocumentDefinitions } from 'pdfmake/interfaces.js'
import { getUserProfile } from '../user-data/index.js'
import { mergeExperiences } from './merge.js'
import { buildPdfDocument } from './document.js'
import { buildOutputFilename } from './filename.js'
import { FONTS } from './fonts.js'
import { getLabels } from '../locales/index.js'
import type { AiResponse } from '../types.js'

const OUTPUT_DIR = join(process.cwd(), 'output')

export function buildPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
  const printer = new PdfPrinter(FONTS)
  const pdfDoc = printer.createPdfKitDocument(docDefinition)

  const chunks: Buffer[] = []
  pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk))

  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
    pdfDoc.on('error', reject)
    pdfDoc.end()
  })
}

export async function writePdf(aiResponse: AiResponse): Promise<string> {
  const profile = getUserProfile(aiResponse.language)
  const labels = getLabels(aiResponse.language)
  const merged = mergeExperiences(profile.experiences, aiResponse.experiences)
  const docDefinition = buildPdfDocument(profile, aiResponse, merged, labels)

  const pdfBuffer = await buildPdfBuffer(docDefinition)

  await mkdir(OUTPUT_DIR, { recursive: true })

  const filename = buildOutputFilename(profile.name, aiResponse.suggested_title)
  const outputPath = join(OUTPUT_DIR, filename)

  await writeFile(outputPath, pdfBuffer)

  return outputPath
}
