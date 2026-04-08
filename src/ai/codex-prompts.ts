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
  "language": "string",
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

=== CRITICAL RULES (highest priority — enforce before all others) ===

C1. Tailoring over completeness:
   Every element of this resume (title, summary, skills, bullets) must be curated for the specific job description. A targeted resume that omits irrelevant experience outperforms a comprehensive one that includes everything. Before including any item, ask: "Does this strengthen the candidate's case for THIS job?" If not, exclude it.

C2. Ecosystem coherence in skills:
   Before including any skill, verify it belongs to the same ecosystem as the job's core stack. If the job targets Node.js/TypeScript, exclude languages and frameworks from unrelated ecosystems (e.g., C#, .NET, Java, Spring) even if they appear in the brag document. An unrelated ecosystem in the skills section signals a generic resume, not a targeted one. This extends to ecosystem-specific tools: if a language or runtime is excluded, also exclude its dependent tools (e.g., Entity Framework without C#/.NET, Spring Data without Java).

C3. Summary positions, bullets prove:
   The professional summary establishes who the candidate is and why they matter for this role. Bullets provide the evidence. They must not compete. If a specific number will appear in a bullet (e.g., "500 testes", "72 mil solicitações", "7.600 webhooks/mês"), the summary must NOT use that same number. Use rounded or generalized forms instead (e.g., "centenas de testes", "dezenas de milhares de solicitações"). A 2-sentence summary is always better than a 3-sentence summary where the third dilutes the first two.

C4. Formal professional tone:
   Every sentence in the resume must read as if reviewed by a senior engineering manager. This means:
   - No colloquial or informal verb forms: "rodando" → "executando", "puxando" → "extraindo", "jogando" → "enviando", "subindo" → "implantando".
   - No metaphorical constructions: never "atacando uma causa de X%", "endereçando um problema ligado a X%", "visando resolver os X%".
   - No vague ownership verbs when specific engineering work was done: "Garanti", "Assegurei", and "Viabilizei" are only acceptable for coordination or oversight. If the candidate wrote code, designed a system, or built an integration, the verb must reflect the specific action (e.g., "Implementei", "Refatorei", "Desenvolvi", "Sincronizei").
   - When a metric describes the scope of a problem (e.g., "28% dos incidentes"), use a simple causal result clause: "[verb] [what was built], reduzindo [metric]". The metric must flow as a natural consequence, not as the object of an abstract verb.

C5. Verb discipline:
   - Verb repetition is a hard constraint. Before finalizing, count verb occurrences across ALL bullets (both companies combined). No verb may appear more than twice total. Common alternatives for "Implementei": Desenvolvi, Construí, Criei, Projetei, Estruturei, Integrei, Refatorei, Automatizei, Expandi.
   - Present participles (in summary or bullet connectors) must convey active engineering contribution, not passive maintenance. Avoid: "sustentando", "mantendo", "suportando", "gerenciando". Prefer: "escalando", "viabilizando", "processando", "integrando", "consolidando".

C6. Language consistency:
   When the output language is Portuguese, avoid English terms that have clear Portuguese equivalents (e.g., "connectors" → "conectores", "tracking" → "rastreamento"). English terms are acceptable only for: proper nouns (e.g., "Shopify"), widely adopted technical terms with no standard Portuguese equivalent (e.g., "webhook", "payload", "deploy", "frontend", "backend"), or terms that appear in the job description in English.

=== GLOBAL FORMATTING RULES ===

G1. Never use em dashes (—) or en dashes (–) anywhere in the output.
G2. Never use "I", "he", "she", or third-person verbs like "Built", "Led", "Desenvolveu", or "Liderou".
G3. Keep official capitalization for all technology names (e.g., Node.js, TypeScript, NestJS, PostgreSQL).
G4. Use ONLY the brag document and job description from the workspace files. Do not infer, add, or fabricate any metric, technology, or achievement.
G5. Language: Detect the language of the job description and use it as the output language for ALL text fields (suggested_title, professional_summary, bullets). Output the ISO 639-1 code in \`language\`. Supported: English (\`en\`) and Portuguese (\`pt\`). If the job description is in Portuguese, ALL output must be in Portuguese.

=== SECTION RULES ===

1. Suggested title:
   - Choose a resume title based on the job description: a short job title of 2-4 words (e.g., "Desenvolvedor Fullstack", "Software Engineer", "Engenheiro de Software").
   - Do not copy the job title verbatim.
   - Never append descriptions, taglines, or specializations (e.g., never "Desenvolvedor Full Stack para Sistemas Escaláveis").
   - Do not add qualifiers like "Senior", "Full Stack", "Junior", "Pleno", "Sr.", or gendered forms like "(a)" unless the candidate's brag document uses that exact term.

2. Professional summary:
   Plan the summary sentence by sentence before writing:

   Sentence 1 (Identity and context):
   - Lead with the job title (mirroring the suggested title), years of experience, and the specific domain or problem space the candidate operates in.
   - The "domain" should describe the type of problems the candidate solves at a level specific enough that a recruiter can picture the work (e.g., "integrações de sistemas e fluxos transacionais em plataformas multi-tenant", "controle de processos industriais em sistemas ERP"). Avoid abstract labels that could describe anyone (e.g., "operações", "soluções tecnológicas", "sistemas escaláveis").
   - Include one scale metric (e.g., number of clients) only if it flows naturally.
   - This sentence is pure positioning: NO technology names, NO achievements.
   - Never mention previous employers by name. Do not mention the industry of previous employers (e.g., "e-commerce", "concreteiras") unless the job description targets that same industry.

   Sentence 2 (Technical specialization with evidence):
   - Highlight the candidate's single strongest specialization relevant to this job, anchored by a core technology and the functional domain it supports.
   - Include one metric that demonstrates scale or result. Do not stack multiple metrics.
   - This is where technologies belong. Maximum 3-4 technology names per sentence.

   Sentence 3 (Proof of impact — optional):
   - Only include if the candidate has a concrete, quantifiable achievement that reinforces sentences 1-2 WITHOUT introducing a new topic.
   - Must contain a measurable result not already used in sentence 2 or in any bullet.
   - If no achievement is strong enough, omit this sentence entirely.

   Summary constraints:
   - Sentence 1 uses noun phrases for positioning. Sentences 2-3 may use present participles for flow (subject to C5).
   - The summary must match the specialization of the suggested title.
   - Never start with adjectives. Never end with generic statements.
   - Prioritize readability: each sentence should have one clear focus.
   - Never combine technically incompatible concepts (e.g., "REST oriented to events"). Keep distinct paradigms as separate concepts.

3. Years of experience:
   - Calculate from the earliest start date in the brag document to TODAY'S DATE in ${inputFiles.context}.
   - Round to complete years (round up if 6+ months remaining).
   - If calculated years are less than the job's minimum, do NOT mention years in the summary.

4. Skill selection:
   - Source: Use only technologies from the candidate's "Tecnologias" fields or "Stack principal" that are relevant to the job.
   - Adjacent experience: Technologies plausible from strong adjacent experience may appear in skills arrays only (never in bullets or summary). Adjacency applies only at the paradigm level (e.g., message queues → WebSocket). It does NOT extend to specific vendor products or cloud services (e.g., RabbitMQ does NOT make AWS SQS plausible).
   - Never fabricate experience.
   - Authentication protocols (SSO, SAML, OAuth, SCIM): Include in skills only if the job description mentions authentication, SSO, identity, or security.
   - SOAP: Include only if the job description explicitly mentions SOAP, legacy API integration, or XML-based web services. General mentions of "API" or "REST" do not qualify.
   - ORMs and database tools (e.g., Prisma, TypeORM): Include when the job requires backend proficiency, as they demonstrate depth.
   - Ubiquitous tools (e.g., Git): Exclude by default. Include only if the job description explicitly lists them as a requirement.
   - Exclude project management/support tools (e.g., Jira, Trello, Slack) unless the job explicitly requires them.
   - If a category has no approved skills, return an empty array [].
   - ${SKILL_CATEGORIES}

5. Bullet selection:
   - Before selecting bullets, identify all mandatory requirements from the job description. Ensure at least one bullet or skill covers each mandatory requirement that the candidate has evidence for.
   - After covering mandatory requirements, review "nice-to-have" or "differentials" sections. If the candidate has matching evidence, include at least one bullet to highlight that match.
   - For each bullet, internally justify its relevance to the job. If no clear connection to a job requirement exists, exclude it.
   - Do not split a single achievement into multiple bullets. If two bullets describe parts of the same project, merge them into one.
   - Prioritize bullets in this order:
     1. Business impact metrics (revenue, cost savings, conversion rates)
     2. Scale/operational metrics (volume processed, users impacted, clients migrated)
     3. Technical complexity without metric (architecture decisions, multi-system integrations)
     When two bullets have similar metric strength, prefer the one more relevant to the job.
   - Order bullets from most to least relevant within each company.
   - Select 4-6 bullets per company (minimum 3) when sufficient relevant achievements exist.
   - Preserve the candidate's ownership level from the brag document. Do not upgrade ownership (e.g., "Contribui" must not become "Liderei"). When the brag document describes active work like "validando e expandindo", the verb may reflect that activity (e.g., "Expandi") without inflating ownership.
   - When the job targets a specific layer (frontend/backend), exclude bullets whose primary contribution is in a different layer.
   - Never assign a bullet to the wrong company.

6. Bullet formatting:
   Each bullet must contain:
   - REQUIRED: A strong action verb at the start (never "Responsável por", "Ajudei", "Trabalhei em", "Participei de").
   - REQUIRED: What was built, done, or changed, with the technology/tool when relevant.
   - REQUIRED (at least one):
     (a) Quantified result (e.g., "reduzindo em 80%", "retendo R$ 243 mil").
     (b) Business context (e.g., "para viabilizar a migração da base legado").
     (c) Technical challenge (e.g., "com schemas distintos entre bancos").
   - PREFERRED: Include two of (a), (b), (c) when the 200-character limit allows. Never force all three at the cost of readability.
   - When the brag document provides a metric, always include (a). Use (b) or (c) alone only when no metric exists.

   Formatting constraints:
   - Maximum 200 characters per bullet. Do not pad short bullets to reach the limit.
   - Context connectors ("para", "eliminando", "reduzindo", "viabilizando") introduce (a), (b), or (c) as a clause. Never split into two sentences.
   - Include a technology in a bullet only when essential for understanding or when it hasn't appeared in another bullet for the same company.
   - "Mantive" and "Gerenciei" are only acceptable for pure maintenance/management work. If the brag document describes active engineering (refactoring, optimizing, implementing), use a verb reflecting the actual work.
   - When a metric describes the scope of a problem rather than a positive outcome (e.g., "664 solicitações afetadas por bug"), reframe as the impact of the fix (e.g., "corrigindo cálculos para 664 solicitações") or omit if no positive framing exists.
   - Never invent metrics, problems, or situations not described in the brag document.

7. Company names:
   The \`company\` field in each experience MUST match one of the company names from ${inputFiles.context} exactly.

8. Response discipline:
   - Return ONLY valid JSON matching the output format above.
   - Do not wrap the JSON in markdown.
   - Do not include any analysis text in the final response.`
}
