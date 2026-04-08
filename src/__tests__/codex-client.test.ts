import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spawnMock = vi.fn()
const mkdtempMock = vi.fn()
const readFileMock = vi.fn()
const rmMock = vi.fn()

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}))

vi.mock('node:fs/promises', () => ({
  mkdtemp: mkdtempMock,
  readFile: readFileMock,
  rm: rmMock,
}))

type FakeChildProcess = EventEmitter & {
  stdout: PassThrough
  stderr: PassThrough
  stdin: PassThrough
}

type SpawnBehavior = Readonly<{
  code?: number
  stdout?: string
  stderr?: string
  error?: Error
}>

function createFakeChildProcess(behavior: SpawnBehavior): FakeChildProcess {
  const child = new EventEmitter() as FakeChildProcess
  child.stdout = new PassThrough()
  child.stderr = new PassThrough()
  child.stdin = new PassThrough()

  process.nextTick(() => {
    if (behavior.stdout) {
      child.stdout.write(behavior.stdout)
    }
    child.stdout.end()

    if (behavior.stderr) {
      child.stderr.write(behavior.stderr)
    }
    child.stderr.end()

    if (behavior.error) {
      child.emit('error', behavior.error)
      return
    }

    child.emit('close', behavior.code ?? 0)
  })

  return child
}

describe('generateResumeContentWithCodex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mkdtempMock.mockResolvedValue('/tmp/brag-cv-codex-123')
    rmMock.mockResolvedValue(undefined)
    delete process.env.BRAG_CV_CODEX_MODEL
    delete process.env.BRAG_CV_CODEX_REASONING_EFFORT
  })

  afterEach(() => {
    delete process.env.BRAG_CV_CODEX_MODEL
    delete process.env.BRAG_CV_CODEX_REASONING_EFFORT
  })

  it('returns a validated AI response from the Codex final message', async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        suggested_title: 'Frontend Developer',
        professional_summary: 'Frontend developer with React and TypeScript in SaaS.',
        language: 'en',
        skills: {
          languagesAndFrameworks: ['TypeScript', 'React'],
          databasesAndApis: ['REST APIs'],
          infrastructureAndCloud: ['Docker'],
          others: ['Vitest'],
        },
        experiences: [
          {
            company: 'Acme Corp',
            bullets: ['Built a React dashboard, reducing support tickets by 20%.'],
          },
        ],
      })
    )

    spawnMock.mockImplementation(() =>
      createFakeChildProcess({
        stdout: 'warning',
      })
    )

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')
    const result = await generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])

    expect(result.suggested_title).toBe('Frontend Developer')
    expect(spawnMock).toHaveBeenCalledWith(
      'codex',
      expect.arrayContaining([
        'exec',
        '-',
        '--cd',
        process.cwd(),
        '--sandbox',
        'read-only',
        '--ephemeral',
        '--output-last-message',
        '/tmp/brag-cv-codex-123/last-message.txt',
      ]),
      { stdio: ['pipe', 'pipe', 'pipe'] }
    )
    expect(readFileMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123/last-message.txt', 'utf-8')
    expect(rmMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123', { recursive: true, force: true })
  })

  it('throws a helpful error when Codex exits non-zero', async () => {
    spawnMock.mockImplementation(() =>
      createFakeChildProcess({
        code: 2,
        stderr: 'fatal issue',
      })
    )

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI exited with code 2: fatal issue')
  })

  it('throws when the final message is empty', async () => {
    readFileMock.mockResolvedValue('   ')
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI did not return a final message')
  })

  it('throws when Codex does not return valid JSON', async () => {
    readFileMock.mockResolvedValue('not-json')
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI did not return valid JSON')
  })

  it('throws when Codex returns schema-invalid JSON', async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        suggested_title: 'Frontend Developer',
      })
    )
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI returned an invalid resume object:')
  })

  it('throws when Codex CLI is missing from PATH', async () => {
    const error = Object.assign(new Error('spawn codex ENOENT'), { code: 'ENOENT' })
    spawnMock.mockImplementation(() =>
      createFakeChildProcess({
        error,
      })
    )

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI was not found in PATH')
  })

  it('passes model and reasoning overrides when configured by env', async () => {
    process.env.BRAG_CV_CODEX_MODEL = 'gpt-5.4'
    process.env.BRAG_CV_CODEX_REASONING_EFFORT = 'xhigh'

    readFileMock.mockResolvedValue(
      JSON.stringify({
        suggested_title: 'Frontend Developer',
        professional_summary: 'Frontend developer with React and TypeScript in SaaS.',
        language: 'en',
        skills: {
          languagesAndFrameworks: ['TypeScript', 'React'],
          databasesAndApis: ['REST APIs'],
          infrastructureAndCloud: ['Docker'],
          others: ['Vitest'],
        },
        experiences: [
          {
            company: 'Acme Corp',
            bullets: ['Built a React dashboard, reducing support tickets by 20%.'],
          },
        ],
      })
    )
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')
    await generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])

    expect(spawnMock).toHaveBeenCalledWith(
      'codex',
      expect.arrayContaining([
        '--model',
        'gpt-5.4',
        '--config',
        'model_reasoning_effort="xhigh"',
      ]),
      { stdio: ['pipe', 'pipe', 'pipe'] }
    )
  })
})
