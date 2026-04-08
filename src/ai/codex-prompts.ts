import { SKILL_CATEGORIES } from './prompts.js'

export function buildCodexGenerationPrompt(
  bragDoc: string,
  jobDesc: string,
  companyNames: readonly string[]
): string {
  return `Generate a resume JSON object for BragCV in a SINGLE PASS.
You must perform the strategic analysis internally, but your FINAL RESPONSE must be ONLY the JSON object.
Do not include markdown fences, commentary, notes, or explanation before or after the JSON.
OUTPUT FORMAT:
{
  "suggested_title": "string",
  "professional_summary": "string",
  "language": "en",
  "skills": {
    "languagesAndFrameworks": ["string"],
    "databasesAndApis": ["string"],
    "infrastructureAndCloud": ["string"],
    "others": ["string"]
  },
  "experiences": [
    {
      "company": "string",
      "bullets": ["string"]
    }
  ]
}
RULES:
1. Use ONLY the brag document and job description provided below. Do not infer, add, or fabricate any metric, technology, or achievement.
2. Language:
   - Detect the language of the job description and output the ISO 639-1 code in \`language\`.
   - Supported output languages are English (\`en\`) and Portuguese (\`pt\`).
3. Suggested title:
   - Choose a proper resume title based on the job description.
   - The title must be a short job title only (2-4 words), like "Desenvolvedor Fullstack", "Software Engineer", or "Engenheiro de Software". Never append descriptions, taglines, or specializations after the title (e.g., never "Desenvolvedor Full Stack para Sistemas Escaláveis").
   - Do not copy the job title verbatim.
   - Do not add qualifiers like "Senior", "Full Stack", "Junior", "Pleno", "Sr.", or gendered forms like "(a)" unless the candidate's brag document uses that exact term.
   - Do not include seniority level abbreviations (e.g., "Sr.", "Jr.") in the title.
4. Professional summary:
   - Plan the summary sentence by sentence before writing:
     - Sentence 1: Lead with the candidate's core stack and the domain/industry. Include one scale metric (e.g., number of clients, system scale) if it flows naturally. Keep it direct and readable.
     - Sentence 2: Highlight the candidate's single strongest specialization for this job, backed by the brag document (e.g., architecture, integrations, security, event-driven systems). Include one metric if available.
     - Sentence 3: Only include if the candidate has a second distinct specialization relevant to the job that was not covered in sentence 2. If sentence 3 would overlap with sentence 2 or feel forced, omit it. Default to 2 sentences.
   - Maximum 3-4 technology names, domain terms, or metrics per sentence. Do not list more than that in a single sentence.
   - First-person implicit voice using noun phrases and participles.
   - Never use "I", "he", "she", or third-person verbs like "Built", "Led", "Desenvolveu", or "Liderou".
   - The summary must match the specialization of the suggested title.
   - Every sentence must contain a technology name, domain term, or metric.
   - Never start with adjectives.
   - Never end with generic statements.
   - Never use em dashes or en dashes.
   - Prioritize readability: each sentence should have one clear focus. Do not cram multiple unrelated achievements into a single sentence.
5. Years of experience:
   - Calculate from the earliest start date in the brag document to TODAY'S DATE below.
   - Round to complete years, round up if 6 months or less to complete the year.
   - If the calculated years are less than the minimum required by the job description, do NOT mention years of experience in the professional summary.
   - If the calculated years meet or exceed the job's requirement (or the job does not specify a minimum), you may include them in the summary.
6. Skill selection:
   - Use only technologies from the candidate's "Tecnologias" fields or "Stack principal" that are relevant to the job, plus closely related job requirements that are plausible from strong adjacent experience.
   - Never fabricate experience.
   - Technologies that are only plausible from adjacent experience may appear in the skills arrays, but must NOT appear in bullets or in the professional summary.
   - Adjacent-experience heuristic: If the candidate has demonstrated experience with event-driven architecture (e.g., RabbitMQ, webhooks, message queues), related real-time technologies like WebSocket are plausible adjacencies for the skills section only.
   - If the job description emphasizes security, authentication, or identity, and the candidate has implemented authentication protocols (SSO, SAML, OAuth, SCIM), always include these protocols in skills.
   - Include ORMs and database tools (e.g., Prisma, TypeORM, Entity Framework) from the stack when the job requires backend proficiency, as they demonstrate depth.
   - Ubiquitous tools (e.g., Git) should be excluded by default as they add no signal. However, if the job description explicitly lists them as a requirement, include them.
   - Exclude company-specific or niche deployment tools and project management/support tools (e.g., Jira, Trello, Slack) unless the job explicitly requires them.
   - Protocol-level skills like SAML, SCIM, SOAP, and OAuth may appear in skills only if the job description mentions authentication, SSO, identity, security, or legacy API protocols.
   - Keep official capitalization.
   - If a category has no approved skills, return an empty array [].
   - ${SKILL_CATEGORIES}
7. Bullet selection:
   - Before selecting bullets, identify all mandatory requirements from the job description. Ensure at least one bullet or skill covers each mandatory requirement that the candidate has evidence for in the brag document.
   - For each bullet you consider including, internally justify why it is relevant to this job. If you cannot articulate a clear reason tied to a job requirement, exclude the bullet.
   - Do not split a single achievement or project into multiple bullets. If two bullets describe different parts of the same project or feature (e.g., designing a system and then describing its sub-component separately), merge them into one bullet that captures the full scope. Each bullet must represent a completely independent accomplishment.
   - Select only the most relevant achievements for this job.
   - Prioritize bullets that demonstrate: scale of impact, security expertise, architecture decisions, event-driven systems, and cross-team collaboration.
   - Order bullets from most to least relevant to the job description within each company.
   - Select 4-6 bullets per company when the candidate has sufficient relevant achievements. Minimum 3 bullets per company.
   - Preserve the candidate's ownership level from the brag document. Do not upgrade ownership (e.g., "Contribui" must not become "Liderei"). However, when the brag document describes active work like "validando e expandindo", the bullet verb may reflect that activity (e.g., "Expandi", "Evoluí") without inflating ownership.
   - Protocol restriction for bullets: Bullets describing work with SSO, SAML, SCIM, or similar protocols may be selected if the underlying engineering work (architecture, multi-provider systems, API design) is relevant to the job. Evaluate the bullet on its engineering merit, not on the protocol name.
   - When the job targets a specific layer, exclude bullets whose primary contribution is in a different layer.
   - Never assign a bullet to the wrong company.
8. Bullet formatting:
   - Format each bullet as: [Action verb] + [what was built/done] + [technology/tool when relevant] + [quantified result]
   - Include the technology in the bullet only when it is essential to understand the achievement or when it has not yet appeared in another bullet for the same company. Omit repeated technologies when the bullet is clear without them.
   - Maximum 150 characters per bullet.
   - Include metrics when the brag document provides them.
   - Never invent metrics.
   - Vary action verbs. Do not repeat the same verb more than twice across all bullets.
   - Never use em dashes or en dashes.
9. Company names:
   - The \`company\` field in each experience MUST match one of the company names below exactly.
10. Response discipline:
   - Return ONLY valid JSON matching the format above.
   - Do not wrap the JSON in markdown.
   - Do not include any analysis text in the final response.
TODAY'S DATE: ${new Date().toISOString().split('T')[0]}
COMPANY NAMES (use these exactly):
${companyNames.join(', ')}
BRAG DOCUMENT:
${bragDoc}
JOB DESCRIPTION:
${jobDesc}`
}
