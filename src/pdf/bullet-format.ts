import type { Content, ContentText } from 'pdfmake/interfaces.js'

const BOLD_MARKER_PATTERN = /\*\*(.+?)\*\*/g

export function parseBulletText(bullet: string): Content[] {
  const fragments: Content[] = []
  let cursor = 0

  for (const match of bullet.matchAll(BOLD_MARKER_PATTERN)) {
    const matchIndex = match.index

    if (matchIndex > cursor) {
      fragments.push(bullet.slice(cursor, matchIndex))
    }

    fragments.push({ text: match[1], bold: true })
    cursor = matchIndex + match[0].length
  }

  if (cursor < bullet.length) {
    fragments.push(bullet.slice(cursor))
  }

  return fragments
}

export function formatBullet(bullet: string): ContentText {
  return { text: parseBulletText(bullet) }
}
