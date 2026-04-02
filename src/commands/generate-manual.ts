import { aiResponse } from '../manual-generation/ai-response.js'
import { writePdf } from '../pdf/writer.js'

async function main(): Promise<void> {
  console.log('Generating PDF from ai-response...')
  const outputPath = await writePdf(aiResponse)
  console.log(`PDF saved to: ${outputPath}`)
}

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : error)
  process.exit(1)
})
