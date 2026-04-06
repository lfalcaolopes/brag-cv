import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { AiResponse } from '../types.js'

export const MANUAL_AI_RESPONSE_PATH = join(
  process.cwd(),
  'src',
  'manual-generation',
  'ai-response.ts'
)

export function serializeAiResponseModule(aiResponse: AiResponse): string {
  const serializedResponse = JSON.stringify(aiResponse, null, 2)

  return [
    "import type { AiResponse } from '../types.js'",
    '',
    `export const aiResponse: AiResponse = ${serializedResponse}`,
    '',
  ].join('\n')
}

export async function saveManualAiResponse(aiResponse: AiResponse) {
  const fileContents = serializeAiResponseModule(aiResponse)
  await writeFile(MANUAL_AI_RESPONSE_PATH, fileContents, 'utf-8')
}
