import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const spawnMock = vi.fn()
const mkdtempMock = vi.fn()
const readFileMock = vi.fn()
const rmMock = vi.fn()
const writeFileMock = vi.fn()

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}))

vi.mock('node:fs/promises', () => ({
  mkdtemp: mkdtempMock,
  readFile: readFileMock,
  rm: rmMock,
  writeFile: writeFileMock,
}))

type FakeChildProcess = EventEmitter & {
  stdout: PassThrough
  stderr: PassThrough
  stdin: PassThrough
  stdinContent: string
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
  child.stdinContent = ''
  child.stdin.on('data', (chunk: Buffer | string) => {
    child.stdinContent += chunk.toString()
  })

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

const validCodexResponse = JSON.stringify({
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

describe('generateResumeContentWithCodex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-07T12:00:00Z'))
    mkdtempMock.mockResolvedValue('/tmp/brag-cv-codex-123')
    writeFileMock.mockResolvedValue(undefined)
    rmMock.mockResolvedValue(undefined)
    delete process.env.BRAG_CV_CODEX_MODEL
    delete process.env.BRAG_CV_CODEX_REASONING_EFFORT
  })

  afterEach(() => {
    vi.useRealTimers()
    delete process.env.BRAG_CV_CODEX_MODEL
    delete process.env.BRAG_CV_CODEX_REASONING_EFFORT
  })

  it('writes isolated temp inputs, invokes Codex from the temp dir, and validates the final response', async () => {
    readFileMock.mockResolvedValue(validCodexResponse)

    spawnMock.mockImplementation(() =>
      createFakeChildProcess({
        stdout: 'warning',
      })
    )

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')
    const bragDoc = 'BRAG SECRET CONTENT'
    const jobDesc = 'JOB SECRET CONTENT'
    const result = await generateResumeContentWithCodex(bragDoc, jobDesc, ['Acme Corp'])
    const child = spawnMock.mock.results[0]?.value as FakeChildProcess

    expect(result.suggested_title).toBe('Frontend Developer')
    expect(writeFileMock).toHaveBeenNthCalledWith(
      1,
      '/tmp/brag-cv-codex-123/brag_document.md',
      bragDoc,
      'utf-8'
    )
    expect(writeFileMock).toHaveBeenNthCalledWith(
      2,
      '/tmp/brag-cv-codex-123/job_description.md',
      jobDesc,
      'utf-8'
    )
    expect(writeFileMock).toHaveBeenNthCalledWith(
      3,
      '/tmp/brag-cv-codex-123/context.json',
      JSON.stringify(
        {
          today: '2026-04-07',
          companyNames: ['Acme Corp'],
        },
        null,
        2
      ),
      'utf-8'
    )
    expect(spawnMock).toHaveBeenCalledWith(
      'codex',
      expect.arrayContaining([
        'exec',
        '-',
        '--cd',
        '/tmp/brag-cv-codex-123',
        '--skip-git-repo-check',
        '--sandbox',
        'read-only',
        '--ephemeral',
        '--output-last-message',
        '/tmp/brag-cv-codex-123/last-message.txt',
      ]),
      { stdio: ['pipe', 'pipe', 'pipe'] }
    )
    expect(child.stdinContent).toContain('./brag_document.md')
    expect(child.stdinContent).toContain('./job_description.md')
    expect(child.stdinContent).toContain('./context.json')
    expect(child.stdinContent).toContain('Read ONLY these workspace files as source material')
    expect(child.stdinContent).not.toContain(bragDoc)
    expect(child.stdinContent).not.toContain(jobDesc)
    expect(readFileMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123/last-message.txt', 'utf-8')
    expect(rmMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123', { recursive: true, force: true })
  })

  it('cleans up the temp workspace when Codex exits non-zero', async () => {
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
    expect(rmMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123', { recursive: true, force: true })
  })

  it('throws when the final message is empty', async () => {
    readFileMock.mockResolvedValue('   ')
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI did not return a final message')
  })

  it('throws when the final message file is missing', async () => {
    const missingFileError = Object.assign(new Error('missing file'), { code: 'ENOENT' })
    readFileMock.mockRejectedValue(missingFileError)
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Codex CLI did not write a final message file')
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

  it('throws a helpful error when writing a temp input file fails', async () => {
    writeFileMock.mockRejectedValueOnce(new Error('disk full'))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')

    await expect(
      generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])
    ).rejects.toThrow('Failed to write Codex temp brag document file: disk full')
    expect(spawnMock).not.toHaveBeenCalled()
    expect(rmMock).toHaveBeenCalledWith('/tmp/brag-cv-codex-123', { recursive: true, force: true })
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

  it('ignores temp workspace cleanup failures after a successful run', async () => {
    readFileMock.mockResolvedValue(validCodexResponse)
    rmMock.mockRejectedValue(new Error('permission denied'))
    spawnMock.mockImplementation(() => createFakeChildProcess({}))

    const { generateResumeContentWithCodex } = await import('../ai/codex-client.js')
    const result = await generateResumeContentWithCodex('brag', 'job', ['Acme Corp'])

    expect(result.suggested_title).toBe('Frontend Developer')
  })

  it('passes model and reasoning overrides when configured by env', async () => {
    process.env.BRAG_CV_CODEX_MODEL = 'gpt-5.4'
    process.env.BRAG_CV_CODEX_REASONING_EFFORT = 'xhigh'

    readFileMock.mockResolvedValue(validCodexResponse)
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
