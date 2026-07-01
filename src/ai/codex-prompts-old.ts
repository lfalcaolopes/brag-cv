import { SKILL_CATEGORIES } from './prompts.js'

export const CODEX_INPUT_FILES = {
  bragDocument: './brag_document.md',
  jobDescription: './job_description.md',
  context: './context.json',
} as const

export function buildCodexGenerationPrompt(
  inputFiles: typeof CODEX_INPUT_FILES = CODEX_INPUT_FILES
): string {
  return `Generate a resume JSON object for BragCV in a SINGLE PASS.
You must perform the strategic analysis internally, but your FINAL RESPONSE must be ONLY the JSON object.
Do not include markdown fences, commentary, notes, or explanation before or after the JSON.
Read ONLY these workspace files as source material:
- ${inputFiles.bragDocument}
- ${inputFiles.jobDescription}
- ${inputFiles.context}
Do not inspect any other file, directory, or hidden file in the workspace.
Use ${inputFiles.context} as the source of TODAY'S DATE and the exact company names.
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
1. Use ONLY the brag document and job description from the workspace files listed above. Do not infer, add, or fabricate any metric, technology, or achievement.
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
     - Sentence 1 (Identity and context): Lead with the job title (mirroring the suggested title, which should reflect the job description), years of experience, and the specific domain or problem space the candidate operates in. Include one scale metric (e.g., number of clients, system scale) only if it flows naturally. This sentence is pure positioning: no technologies, no achievements. Keep it direct and readable.
       - The "domain" should describe the type of problems the candidate solves and the nature of the systems they build, at a level specific enough that a recruiter can picture the work (e.g., "integrações de sistemas e fluxos transacionais em plataformas multi-tenant", "controle de processos industriais em sistemas ERP", "plataformas de pagamento com processamento em tempo real"). Avoid abstract labels that could describe anyone (e.g., "operações", "soluções tecnológicas", "sistemas escaláveis"). Never mention previous employers by name. Do not mention the industry of previous employers (e.g., "e-commerce", "concreteiras") unless the job description targets that same industry.
     - Sentence 2 (Technical specialization with evidence): Highlight the candidate's single strongest specialization relevant to this job, anchored by a core technology and the functional domain it supports, backed by the brag document. Include one metric that demonstrates the scale or result of that specialization. This is where technologies belong.
       - The metric in sentence 2 must be a single number that anchors the specialization (e.g., "42 mil pedidos/mês", "150 clientes migrados"). Do not stack multiple metrics in the same sentence. If the metric duplicates a bullet, rephrase or generalize it (e.g., "dezenas de milhares de pedidos" instead of the exact number that will appear in a bullet).
       - Present participles must convey active engineering contribution, not passive maintenance. Avoid participles that imply merely keeping something running (e.g., "sustentando", "mantendo", "suportando"). Prefer participles that convey building, scaling, or transforming (e.g., "escalando", "viabilizando", "processando", "integrando").
     - Sentence 3 (Proof of impact, optional): Only include if the candidate has a concrete, quantifiable achievement that reinforces the value established in sentences 1-2 WITHOUT introducing a new topic. This sentence closes the summary by proving impact, not by adding a new specialization. It must contain a measurable result (revenue, percentage, volume, count). If no achievement is strong enough to go beyond what was already said, omit this sentence. A 2-sentence summary is always better than a 3-sentence summary where the third dilutes the first two.
       - The metric in sentence 3 must NOT repeat any metric already used in sentence 2 or in the bullets. If no unique metric exists, omit sentence 3.
       - Present participles must convey active engineering contribution, not passive maintenance. Avoid participles that imply merely keeping something running (e.g., "sustentando", "mantendo", "suportando"). Prefer participles that convey building, scaling, or transforming (e.g., "escalando", "viabilizando", "processando", "integrando").
   - Maximum 3-4 technology names, domain terms, or metrics per sentence. Do not list more than that in a single sentence.
   - Never combine technically incompatible concepts into a single term (e.g., "REST oriented to events", "synchronous message queue"). REST is request-response; event-driven is asynchronous. Keep distinct paradigms as separate concepts.
   - First-person implicit voice. Sentence 1 should use noun phrases for positioning. Sentences 2 and 3 may use present participles (e.g., "escalando", "viabilizando", "sustentando") to describe achievements with natural flow. Never use finite verbs in first or third person ("Construí", "Built", "Desenvolveu").
   - Metrics in the summary must generalize, not duplicate. If a specific number will appear in a bullet (e.g., "500 testes", "72 mil solicitações", "7.600 webhooks/mês"), the summary must NOT use that same number. Use rounded or generalized forms instead (e.g., "centenas de testes" instead of "~500 testes", "dezenas de milhares de solicitações" instead of "72 mil"). The summary positions; the bullets prove. They must not compete.
   - Never use "I", "he", "she", or third-person verbs like "Built", "Led", "Desenvolveu", or "Liderou".
   - The summary must match the specialization of the suggested title.
   - Sentence 1 must NOT contain technology names. Sentences 2 and 3 must each contain at least one technology name, domain term, or metric.
   - Never start with adjectives.
   - Never end with generic statements.
   - Never use em dashes or en dashes.
   - Prioritize readability: each sentence should have one clear focus. Do not cram multiple unrelated achievements into a single sentence.
5. Years of experience:
   - Calculate from the earliest start date in the brag document to the TODAY'S DATE value in ${inputFiles.context}.
   - Round to complete years, round up if 6 months or less to complete the year.
   - If the calculated years are less than the minimum required by the job description, do NOT mention years of experience in the professional summary.
   - If the calculated years meet or exceed the job's requirement (or the job does not specify a minimum), you may include them in the summary.
6. Skill selection:
   - Use only technologies from the candidate's "Tecnologias" fields or "Stack principal" that are relevant to the job, plus closely related job requirements that are plausible from strong adjacent experience.
   - Never fabricate experience.
   - Technologies that are only plausible from adjacent experience may appear in the skills arrays, but must NOT appear in bullets or in the professional summary.
   - Adjacent-experience heuristic: If the candidate has demonstrated experience with event-driven architecture (e.g., RabbitMQ, webhooks, message queues), related real-time technologies like WebSocket are plausible adjacencies for the skills section only.
     - Adjacent-experience boundaries: Adjacency applies only to paradigm-level skills (e.g., message queues → WebSocket). It does NOT apply to specific vendor products or cloud services (e.g., RabbitMQ does NOT make AWS SQS, Google Pub/Sub, or Azure Service Bus plausible). Cloud services must appear explicitly in the brag document's stack or technology fields.
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
   - After covering mandatory requirements, review the job description's "nice-to-have", "differentials", or equivalent sections. If the candidate has evidence in the brag document that maps to a differential, include at least one bullet or reframe an existing bullet to highlight that match. Differentials are tiebreakers that can elevate a resume from "qualified" to "strong match".
   - For each bullet you consider including, internally justify why it is relevant to this job. If you cannot articulate a clear reason tied to a job requirement, exclude the bullet.
   - Do not split a single achievement or project into multiple bullets. If two bullets describe different parts of the same project or feature (e.g., designing a system and then describing its sub-component separately), merge them into one bullet that captures the full scope. Each bullet must represent a completely independent accomplishment.
   - Select only the most relevant achievements for this job.
   - Prioritize bullets in this order:
     1. Bullets with business impact metrics (revenue, cost savings, conversion rates)
     2. Bullets with scale/operational metrics (volume processed, users impacted, clients migrated)
     3. Bullets with technical complexity but no metric (architecture decisions, multi-system integrations)
     When two bullets have similar metric strength, prefer the one more relevant to the job description.
   - Order bullets from most to least relevant to the job description within each company.
   - Select 4-6 bullets per company when the candidate has sufficient relevant achievements. Minimum 3 bullets per company.
   - Preserve the candidate's ownership level from the brag document. Do not upgrade ownership (e.g., "Contribui" must not become "Liderei"). However, when the brag document describes active work like "validando e expandindo", the bullet verb may reflect that activity (e.g., "Expandi", "Evoluí") without inflating ownership.
   - Protocol restriction for bullets: Bullets describing work with SSO, SAML, SCIM, or similar protocols may be selected if the underlying engineering work (architecture, multi-provider systems, API design) is relevant to the job. Evaluate the bullet on its engineering merit, not on the protocol name.
   - When the job targets a specific layer, exclude bullets whose primary contribution is in a different layer.
   - Never assign a bullet to the wrong company.
8. Bullet formatting:
   - Each bullet must contain:
     - REQUIRED: A strong action verb at the start.
     - REQUIRED: What was built, done, or changed, with the technology/tool when relevant.
     - REQUIRED (at least one of the following):
       (a) Quantified result: a metric showing the outcome (e.g., "reduzindo em 80%", "retendo R$ 243 mil", "migrando ~150 clientes").
       (b) Business context: why the work mattered or what problem it solved (e.g., "para viabilizar a migração da base legado", "eliminando a necessidade de aprovação manual").
       (c) Technical challenge: what made the work non-trivial (e.g., "com schemas distintos entre bancos", "evitando duplicidade em dados mutáveis entre requisições").
     - PREFERRED: Include two of (a), (b), (c) when the 200-character limit allows. Never force all three if it makes the bullet dense or unreadable.
     - When the brag document provides a metric, always include (a). Only use (b) or (c) alone when no metric exists.
   - Context connectors like "para", "eliminando", "reduzindo", "viabilizando" can introduce (a), (b), or (c) as a clause within the same sentence. Never split a bullet into two separate sentences.
   - Include the technology in the bullet only when it is essential to understand the achievement or when it has not yet appeared in another bullet for the same company. Omit repeated technologies when the bullet is clear without them.
   - Maximum 200 characters per bullet (approximately 2 lines in a standard formatted resume). If a bullet is naturally concise, do not pad it to reach the limit.
   - Never invent metrics. Never invent problems or situations not described in the brag document.
   - When a metric describes the scope of a problem being solved (e.g., "28% dos incidentes"), use a simple causal construction: "[verb] [what was built], reduzindo [metric]". Do not use convoluted constructions like "atacando uma causa de X%", "endereçando um problema ligado a X%", or "visando resolver os X%". The metric should flow naturally as a result clause, not as the object of an abstract verb.
   - Verb rules:
     - Always start with a strong action verb. Never start with "Responsável por", "Ajudei", "Trabalhei em", "Participei de", or equivalent weak verbs in any language.
     - "Mantive" and "Gerenciei" are only acceptable if the bullet describes pure maintenance or management. If the brag document describes active engineering work (refactoring, optimizing, implementing), use a verb that reflects the actual work done.
     - Avoid colloquial or metaphorical verbs that would sound informal in a professional document. Examples of verbs to avoid: "rodando" (use "executando"), "atacando" (use "endereçando" or "reduzindo"), "puxando" (use "extraindo"), "jogando" (use "enviando"). The verb must sound natural in a formal technical resume.
     - Avoid vague ownership verbs that obscure the technical work done. "Garanti", "Assegurei", and "Viabilizei" are only acceptable when the bullet describes coordination or oversight. If the candidate wrote code, designed a system, or built an integration, the verb must reflect the specific engineering action (e.g., "Implementei", "Refatorei", "Desenvolvi", "Sincronizei").
     - Vary action verbs. Do not repeat the same verb more than twice across all bullets.
   - Tone: Every bullet must read as a formal professional achievement. Before finalizing each bullet, verify it would not sound out of place in a resume reviewed by a senior engineering manager. Colloquial phrasing, slang, or metaphorical language must be replaced with precise technical vocabulary.
   - When a metric describes the scope of a problem rather than a positive outcome (e.g., "664 solicitações afetadas por bug"), reframe it as the impact of the fix (e.g., "corrigindo cálculos para 664 solicitações") or omit it if no positive framing exists.
   - Never use em dashes or en dashes.
9. Company names:
   - The \`company\` field in each experience MUST match one of the company names from ${inputFiles.context} exactly.
10. Response discipline:
   - Return ONLY valid JSON matching the format above.
   - Do not wrap the JSON in markdown.
   - Do not include any analysis text in the final response.`
}
