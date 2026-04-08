import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ZodError } from 'zod'
import { aiResponseSchema, type AiResponse } from '../types.js'
import { buildCodexGenerationPrompt, CODEX_INPUT_FILES } from './codex-prompts.js'

type CodexProcessResult = Readonly<{
  code: number
  stderr: string
  stdout: string
}>

type CodexWorkspace = Readonly<{
  dir: string
  bragDocumentPath: string
  jobDescriptionPath: string
  contextPath: string
  outputPath: string
}>

type CodexContext = Readonly<{
  today: string
  companyNames: readonly string[]
}>

function getCodexModelOverride(): string | undefined {
  return process.env.BRAG_CV_CODEX_MODEL?.trim() || undefined
}

function getCodexReasoningEffortOverride(): string | undefined {
  return process.env.BRAG_CV_CODEX_REASONING_EFFORT?.trim() || undefined
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function isNodeErrorWithCode(
  error: unknown,
  code: string
): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === code
}

function buildCodexArgs(workspaceDir: string, outputPath: string): string[] {
  const args = [
    'exec',
    '-',
    '--cd',
    workspaceDir,
    '--skip-git-repo-check',
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

async function createTempWorkspace(): Promise<CodexWorkspace> {
  const dir = await mkdtemp(join(tmpdir(), 'brag-cv-codex-'))
  return {
    dir,
    bragDocumentPath: join(dir, 'brag_document.md'),
    jobDescriptionPath: join(dir, 'job_description.md'),
    contextPath: join(dir, 'context.json'),
    outputPath: join(dir, 'last-message.txt'),
  }
}

async function writeTempFile(
  path: string,
  contents: string,
  description: string
): Promise<void> {
  try {
    await writeFile(path, contents, 'utf-8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write Codex temp ${description}: ${message}`)
  }
}

async function writeCodexInputFiles(
  workspace: CodexWorkspace,
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<void> {
  const context: CodexContext = {
    today: getTodayIsoDate(),
    companyNames,
  }

  await writeTempFile(workspace.bragDocumentPath, bragDoc, 'brag document file')
  await writeTempFile(workspace.jobDescriptionPath, jobDesc, 'job description file')
  await writeTempFile(
    workspace.contextPath,
    JSON.stringify(context, null, 2),
    'context file'
  )
}

async function invokeCodexProcess(
  prompt: string,
  workspace: CodexWorkspace
): Promise<CodexProcessResult> {
  try {
    return await new Promise<CodexProcessResult>((resolve, reject) => {
      const child = spawn('codex', buildCodexArgs(workspace.dir, workspace.outputPath), {
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
  } catch (error) {
    if (isNodeErrorWithCode(error, 'ENOENT')) {
      throw new Error('Codex CLI was not found in PATH')
    }

    throw error
  }
}

async function readFinalMessage(outputPath: string): Promise<string> {
  let finalMessage: string

  try {
    finalMessage = await readFile(outputPath, 'utf-8')
  } catch (error) {
    if (isNodeErrorWithCode(error, 'ENOENT')) {
      throw new Error('Codex CLI did not write a final message file')
    }

    throw error
  }

  if (!finalMessage.trim()) {
    throw new Error('Codex CLI did not return a final message')
  }

  return finalMessage.trim()
}

function parseCodexResponse(rawResponse: string): AiResponse {
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

async function cleanupTempWorkspace(workspace: CodexWorkspace): Promise<void> {
  await rm(workspace.dir, { recursive: true, force: true }).catch(() => undefined)
}

export async function generateResumeContentWithCodex(
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): Promise<AiResponse> {
  const workspace = await createTempWorkspace()

  try {
    await writeCodexInputFiles(workspace, bragDoc, jobDesc, companyNames)

    const prompt = buildCodexGenerationPrompt(CODEX_INPUT_FILES)
    const result = await invokeCodexProcess(prompt, workspace)

    if (result.code !== 0) {
      throw new Error(
        `Codex CLI exited with code ${result.code}: ${summarizeProcessOutput(
          result.stdout,
          result.stderr
        )}`
      )
    }

    const rawResponse = await readFinalMessage(workspace.outputPath)
    return parseCodexResponse(rawResponse)
  } finally {
    await cleanupTempWorkspace(workspace)
  }
}
