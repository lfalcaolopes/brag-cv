import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ZodError } from 'zod'
import { aiResponseSchema, type AiResponse } from '../types.js'
import { buildCodexGenerationPrompt } from './codex-prompts.js'

type CodexProcessResult = Readonly<{
  code: number
  stderr: string
  stdout: string
}>

function getCodexModelOverride(): string | undefined {
  return process.env.BRAG_CV_CODEX_MODEL?.trim() || undefined
}

function getCodexReasoningEffortOverride(): string | undefined {
  return process.env.BRAG_CV_CODEX_REASONING_EFFORT?.trim() || undefined
}

function buildCodexArgs(outputPath: string): string[] {
  const args = [
    'exec',
    '-',
    '--cd',
    process.cwd(),
    '--sandbox',
    'read-only',
    '--ephemeral',
    '--color',
    'never',
    '--output-last-message',
    outputPath,
  ]

  const model = getCodexModelOverride()
  if (model) {
    args.push('--model', model)
  }

  const reasoningEffort = getCodexReasoningEffortOverride()
  if (reasoningEffort) {
    args.push(
      '--config',
      `model_reasoning_effort="${reasoningEffort}"`
    )
  }

  return args
}

function summarizeProcessOutput(stdout: string, stderr: string): string {
  const combined = [stderr.trim(), stdout.trim()]
    .filter(Boolean)
    .join('\n')

  if (!combined) {
    return 'no output'
  }

  return combined.split('\n').slice(-5).join('\n')
}

function formatSchemaError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
      return `${path}: ${issue.message}`
    })
    .join('; ')
}

async function runCodexPrompt(prompt: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), 'brag-cv-codex-'))
  const outputPath = join(tempDir, 'last-message.txt')

  try {
    const result = await new Promise<CodexProcessResult>((resolve, reject) => {
      const child = spawn('codex', buildCodexArgs(outputPath), {
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      child.stdout.setEncoding('utf-8')
      child.stderr.setEncoding('utf-8')

      child.stdout.on('data', (chunk: string) => {
        stdout += chunk
      })

      child.stderr.on('data', (chunk: string) => {
        stderr += chunk
      })

      child.on('error', (error) => {
        reject(error)
      })

      child.on('close', (code) => {
        resolve({
          code: code ?? 1,
          stdout,
          stderr,
        })
      })

      child.stdin.end(prompt)
    })

    if (result.code !== 0) {
      throw new Error(
        `Codex CLI exited with code ${result.code}: ${summarizeProcessOutput(
          result.stdout,
          result.stderr
        )}`
      )
    }

    const finalMessage = await readFile(outputPath, 'utf-8').catch(() => '')

    if (!finalMessage.trim()) {
      throw new Error('Codex CLI did not return a final message')
    }

    return finalMessage.trim()
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error('Codex CLI was not found in PATH')
    }

    throw error
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

export async function generateResumeContentWithCodex(
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<AiResponse> {
  const rawResponse = await runCodexPrompt(
    buildCodexGenerationPrompt(bragDoc, jobDesc, companyNames)
  )

  let parsedResponse: unknown
  try {
    parsedResponse = JSON.parse(rawResponse)
  } catch {
    throw new Error('Codex CLI did not return valid JSON')
  }

  const parsed = aiResponseSchema.safeParse(parsedResponse)
  if (!parsed.success) {
    throw new Error(`Codex CLI returned an invalid resume object: ${formatSchemaError(parsed.error)}`)
  }

  return parsed.data
}
