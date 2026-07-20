import { describe, expect, it } from 'vitest'
import { formatBullet, parseBulletText } from '../pdf/bullet-format.js'

describe('parseBulletText', () => {
  it('keeps a plain bullet unchanged', () => {
    expect(parseBulletText('Built a React dashboard')).toEqual(['Built a React dashboard'])
  })

  it('turns paired markers into bold text fragments', () => {
    expect(parseBulletText('Built APIs with **Node.js**, reducing latency by **40%**.')).toEqual([
      'Built APIs with ',
      { text: 'Node.js', bold: true },
      ', reducing latency by ',
      { text: '40%', bold: true },
      '.',
    ])
  })

  it('renders an unmatched marker as ordinary text', () => {
    expect(parseBulletText('Built APIs with **Node.js')).toEqual(['Built APIs with **Node.js'])
  })

  it('does not interpret an empty bold span', () => {
    expect(parseBulletText('Built APIs**** quickly')).toEqual(['Built APIs**** quickly'])
  })
})

describe('formatBullet', () => {
  it('wraps parsed fragments in a pdfmake text element', () => {
    expect(formatBullet('Used **TypeScript**')).toEqual({
      text: ['Used ', { text: 'TypeScript', bold: true }],
    })
  })
})
