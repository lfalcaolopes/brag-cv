import type { TDocumentDefinitions, Content, ContentCanvas } from 'pdfmake/interfaces.js'
import type { UserProfile, AiResponse, MergedExperience } from '../types.js'
import type { Labels } from '../locales/types.js'

const BLUE = '#3D5A99'
const GRAY = '#666666'
const BORDER_COLOR = '#CCCCCC'
const LINE_WIDTH = 515

function horizontalLine(): ContentCanvas {
  return {
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: LINE_WIDTH, y2: 0, lineWidth: 0.5, lineColor: BORDER_COLOR }],
    margin: [0, 6, 0, 6] as [number, number, number, number],
  }
}

function sectionTitle(text: string): Content {
  return {
    text: text.toUpperCase(),
    style: 'sectionTitle',
    margin: [0, 0, 0, 4] as [number, number, number, number],
  }
}

export function buildPdfDocument(
  profile: UserProfile,
  aiResponse: AiResponse,
  mergedExperiences: readonly MergedExperience[],
  labels: Labels
): TDocumentDefinitions {
  const contactLine: Content = {
    text: [
      { text: profile.email, style: 'contact' },
      { text: '  |  ', style: 'contact' },
      { text: profile.location, style: 'contact' },
      { text: '  |  ', style: 'contact' },
      { text: profile.github, style: 'contactLink', link: `https://${profile.github}` },
      { text: '  |  ', style: 'contact' },
      { text: profile.linkedin, style: 'contactLink', link: `https://${profile.linkedin}` },
    ],
    alignment: 'center' as const,
    margin: [0, 0, 0, 2] as [number, number, number, number],
  }

  const header: Content[] = [
    { text: profile.name, style: 'name', alignment: 'center' as const },
    { text: aiResponse.suggested_title, style: 'title', alignment: 'center' as const, margin: [0, 4, 0, 8] as [number, number, number, number] },
    contactLine,
    horizontalLine(),
  ]

  const summary: Content[] = [
    sectionTitle(labels.sections.professionalSummary),
    { text: aiResponse.professional_summary, style: 'body' },
    horizontalLine(),
  ]

  const skillEntries: readonly { label: string; items: readonly string[] }[] = [
    { label: labels.skillCategories.languagesAndFrameworks, items: aiResponse.skills.languagesAndFrameworks },
    { label: labels.skillCategories.databasesAndApis, items: aiResponse.skills.databasesAndApis },
    { label: labels.skillCategories.infrastructureAndCloud, items: aiResponse.skills.infrastructureAndCloud },
    { label: labels.skillCategories.others, items: aiResponse.skills.others },
  ]
  const skillLines: Content[] = skillEntries
    .filter(({ items }) => items.length > 0)
    .map(({ label, items }) => ({
      text: [
        { text: `${label}: `, bold: true, fontSize: 9.5 },
        { text: items.join(', '), fontSize: 9.5 },
      ],
      margin: [0, 1, 0, 1] as [number, number, number, number],
    }))

  const skills: Content[] = [
    sectionTitle(labels.sections.technicalSkills),
    ...skillLines,
    horizontalLine(),
  ]

  const experienceItems: Content[] = mergedExperiences.flatMap((exp) => [
    { text: exp.title, style: 'experienceRole', margin: [0, 6, 0, 0] as [number, number, number, number] },
    {
      columns: [
        {
          text: [
            { text: exp.company, style: 'experienceCompany' },
            { text: `  —  ${exp.description}`, style: 'experienceDescription' },
          ],
          width: '*' as const,
        },
        { text: exp.period, style: 'experiencePeriod', width: 'auto' as const, alignment: 'right' as const },
      ],
      margin: [0, 3, 0, 6] as [number, number, number, number],
    },
    ...(exp.bullets.length > 0
      ? [{ ul: [...exp.bullets], style: 'body', margin: [0, 0, 0, 2] as [number, number, number, number] } as Content]
      : []),
  ])

  const experience: Content[] = [
    sectionTitle(labels.sections.professionalExperience),
    ...experienceItems,
    horizontalLine(),
  ]

  const educationItems: Content[] = profile.education.map((edu) => ({
    columns: [
      { text: `${edu.institution} - ${edu.degree}`, style: 'body', width: '*' as const },
      { text: edu.period, style: 'experiencePeriod', width: 'auto' as const, alignment: 'right' as const },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  }))

  const education: Content[] = [
    sectionTitle(labels.sections.education),
    ...educationItems,
    horizontalLine(),
  ]

  const languageText = profile.languages.map((l) => `${l.name} (${l.level})`).join('  |  ')
  const languages: Content[] = [
    sectionTitle(labels.sections.languages),
    { text: languageText, style: 'body' },
  ]

  return {
    content: [...header, ...summary, ...skills, ...experience, ...education, ...languages],
    defaultStyle: {
      font: 'Helvetica',
    },
    styles: {
      name: {
        fontSize: 20,
        bold: true,
        color: BLUE,
      },
      title: {
        fontSize: 11,
        color: GRAY,
      },
      contact: {
        fontSize: 9,
        color: GRAY,
      },
      contactLink: {
        fontSize: 9,
        color: BLUE,
        decoration: 'underline' as const,
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: BLUE,
      },
      body: {
        fontSize: 9.5,
        lineHeight: 1.3,
      },
      experienceRole: {
        fontSize: 11,
        bold: true,
      },
      experienceCompany: {
        fontSize: 10,
        color: BLUE,
      },
      experienceDescription: {
        fontSize: 9,
        color: GRAY,
      },
      experiencePeriod: {
        fontSize: 9,
        color: GRAY,
        italics: true,
      },
    },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40] as [number, number, number, number],
  }
}
