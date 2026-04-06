import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { AiResponse } from '../types.js'

const writeFileMock = vi.fn()

vi.mock('node:fs/promises', () => ({
  writeFile: writeFileMock,
}))

const mockAiResponse: AiResponse = {
  suggested_title: 'Frontend Developer',
  professional_summary: 'React developer building SaaS products with measurable impact.',
  language: 'en',
  skills: {
    languagesAndFrameworks: ['TypeScript', 'React'],
    databasesAndApis: ['GraphQL'],
    infrastructureAndCloud: ['Docker'],
    others: ['Vitest'],
  },
  experiences: [
    {
      company: 'TechCorp',
      bullets: ['Built a dashboard in React, reducing support tickets by 20%.'],
    },
  ],
}

describe('manual-generation persistence', () => {
  beforeEach(() => {
    writeFileMock.mockReset()
  })

  it('serializes an AI response as a TypeScript module', async () => {
    const { serializeAiResponseModule } = await import('../manual-generation/persist.js')

    expect(serializeAiResponseModule(mockAiResponse)).toBe(
      [
        "import type { AiResponse } from '../types.js'",
        '',
        'export const aiResponse: AiResponse = {',
        '  "suggested_title": "Frontend Developer",',
        '  "professional_summary": "React developer building SaaS products with measurable impact.",',
        '  "language": "en",',
        '  "skills": {',
        '    "languagesAndFrameworks": [',
        '      "TypeScript",',
        '      "React"',
        '    ],',
        '    "databasesAndApis": [',
        '      "GraphQL"',
        '    ],',
        '    "infrastructureAndCloud": [',
        '      "Docker"',
        '    ],',
        '    "others": [',
        '      "Vitest"',
        '    ]',
        '  },',
        '  "experiences": [',
        '    {',
        '      "company": "TechCorp",',
        '      "bullets": [',
        '        "Built a dashboard in React, reducing support tickets by 20%."',
        '      ]',
        '    }',
        '  ]',
        '}',
        '',
      ].join('\n')
    )
  })

  it('writes the manual-generation response file in UTF-8', async () => {
    const { MANUAL_AI_RESPONSE_PATH, saveManualAiResponse, serializeAiResponseModule } = await import('../manual-generation/persist.js')

    const savedPath = await saveManualAiResponse(mockAiResponse)

    expect(writeFileMock).toHaveBeenCalledWith(
      MANUAL_AI_RESPONSE_PATH,
      serializeAiResponseModule(mockAiResponse),
      'utf-8'
    )
    expect(savedPath).toBe(MANUAL_AI_RESPONSE_PATH)
  })
})
