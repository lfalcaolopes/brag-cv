export function buildOutputFilename(
  name: string,
  suggestedTitle: string
): string {
  const slugify = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const parts = name.trim().split(/\s+/)
  const shortName = parts.length > 1
    ? `${parts[0]} ${parts[parts.length - 1]}`
    : name

  return `${slugify(shortName)}-${slugify(suggestedTitle)}.pdf`
}
