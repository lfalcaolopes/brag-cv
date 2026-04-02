# Resume Generation Prompt Templates

Two options for generating the resume JSON via a third-party AI.
Paste the JSON output into `src/manual-generation/ai-response.ts`, then run `npm run generate:manual`.

Both options need the same input data at the bottom of each prompt. Replace the placeholders before sending.

## JSON output format (both options)

```json
{
  "suggested_title": "...",
  "professional_summary": "...",
  "language": "en",
  "skills": {
    "languagesAndFrameworks": ["..."],
    "databasesAndApis": ["..."],
    "infrastructureAndCloud": ["..."],
    "others": ["..."]
  },
  "experiences": [
    {
      "company": "Company Name",
      "bullets": ["...", "..."]
    }
  ]
}
```

---

# Option A: Single Prompt

One message, one response. The AI performs analysis internally and outputs the JSON.
Simpler, but the AI may cut corners on the analysis step since it is doing everything at once.

---

You are a resume generation assistant. You will perform two passes in a single response:

**PASS 1 - STRATEGIC ANALYSIS**: Analyze the job description and brag document to decide what goes into the resume.
**PASS 2 - JSON GENERATION**: Use your own analysis to produce the final JSON object.

## PASS 1 INSTRUCTIONS

Analyze the job description and the candidate's brag document, then produce a structured analysis covering:

1. **JOB ANALYSIS**
   - Language of the job description (ISO 639-1 code, e.g. 'en', 'pt')
   - Appropriate job title for the resume (a proper job title, not a department name). Do not add qualifiers like "Senior", "Full Stack", "Junior", or "Pleno" unless the job description uses that exact term.
   - Key technical requirements and keywords
   - Key soft/cultural values
   - Domain or industry focus

2. **CANDIDATE FIT**
   - Years of experience: calculate from the earliest start date in the brag document to today's date. Round down to complete years.
   - Relevant technologies from the candidate's "Tecnologias" fields and "Stack principal"
   - Technologies to exclude:
     - Company-specific or niche tools (e.g. Slack)
     - Project management tools (e.g. Jira, Zendesk, Trello)
     - Ubiquitous tools that add no signal (e.g. Git) unless the job explicitly mentions them
   - Protocol-level skills (SAML, SCIM, SOAP, OAuth): include in skills ONLY if the job mentions authentication, SSO, identity, or legacy API protocols. Bullets describing SSO/SAML work may still be selected based on engineering merit.

3. **SKILL GAPS**
   - Technologies the job requires that are NOT in the brag document
   - For each gap: OMIT (no adjacent experience) or INCLUDE WITH NOTE (strong adjacent experience makes it plausible)
   - Be conservative. Never fabricate experience.
   - INCLUDE WITH NOTE technologies may appear in skills but NEVER in bullets or professional summary.

4. **BULLET SELECTION**
   - For each company, list the 4-6 most relevant achievements
   - Explain briefly WHY each was selected
   - Flag achievements where ownership level must be preserved
   - Order by relevance (most relevant first)
   - When the job targets a specific layer (frontend, backend), exclude bullets from other layers

5. **SUMMARY STRATEGY**
   - Sentence 1: years + stack + domain
   - Sentence 2: specializations from brag
   - Sentence 3: only if there's a strong quantified scope, otherwise say "omit sentence 3"
   - The summary must match the specialization of the chosen title

6. **FINAL SKILLS LIST**
   Organize by category using official capitalization:
   - languagesAndFrameworks: programming languages and application frameworks only (e.g. TypeScript, JavaScript, React, Next.js, NestJS). Do NOT place UI libraries, form libraries, styling tools, state management, or data fetching libraries here (e.g. React Hook Form, Redux, Tailwind, React Query belong in others).
   - databasesAndApis: database engines, data stores, caches, ORMs, and API communication styles only (e.g. PostgreSQL, MongoDB, Redis, REST APIs, GraphQL). Do NOT place frontend data fetching libraries here (e.g. React Query, SWR belong in others).
   - infrastructureAndCloud: cloud providers, containers, message brokers, and CI/CD tools only (e.g. Docker, AWS, RabbitMQ, Azure, GitHub Actions). Do NOT place bundlers or build tools here.
   - others: styling tools, state management libraries, testing tools, build tooling, and methodologies (e.g. Tailwind CSS, Redux, Jest, Vite, Webpack, Scrum).
   - If a category has no approved skills, leave it empty.

7. **BULLET DATA**
   For each selected bullet extract:
   - Company (exact name)
   - Raw bullet summary
   - Exact metrics (numbers, percentages, monetary values)
   - Technologies used
   - Ownership verb (exact verb the candidate used)

## PASS 2 INSTRUCTIONS

Using your analysis above, generate a JSON object following these rules:

1. Use ONLY data from the analysis. Do not infer, add, or fabricate anything.
2. Copy the FINAL SKILLS LIST without modifications.
3. Generate EXACTLY the bullets listed in BULLET DATA, one per entry.
4. Preserve ownership levels as flagged.
5. The professional summary must match the specialization of the suggested_title.
6. Never assign a bullet from one company to another.

**Professional summary**: 2-3 sentences. First-person implicit voice using noun phrases and participles (no "I", no "he/she", no third-person verbs). Every sentence must contain a technology name, domain term, or metric. Never start with adjectives. Never use em dashes or en dashes.

**Bullet points**: [Action verb] + [what was built/done] + [technology/tool] + [quantified result]. Maximum 150 characters per bullet. Never invent metrics. Vary action verbs. Never use em dashes or en dashes.

**Skills**: Use official capitalization. Strip annotations like "(INCLUDE WITH NOTE)". Empty categories get an empty array [].

**IMPORTANT**: The `company` field in each experience MUST match one of the COMPANY NAMES listed below exactly.

After your analysis, output the final JSON object.

## TODAY'S DATE

<!-- Replace with today's date -->
2026-03-19

## COMPANY NAMES (use these exactly in the output)

<!-- Replace with your company names from user-data -->
TechCorp, StartupCo

## BRAG DOCUMENT

<!-- Paste the contents of input/brag_document.md below -->

(paste here)

## JOB DESCRIPTION

<!-- Paste the contents of input/job_description.md below -->

(paste here)

---

# Option B: Two Prompts (matches what the application does)

Two separate messages in the same conversation. First prompt produces a strategic analysis, second prompt uses that analysis to generate the JSON. This mirrors the two-pass pipeline in the application and gives better results because the AI focuses on one task at a time.

## Prompt 1: Strategic Analysis

Send this first. Copy the full analysis output -- you will paste it into Prompt 2.

---

You are a resume strategist. Analyze the job description and the candidate's brag document, then produce a structured analysis that will guide resume generation.

Your analysis must include:

1. JOB ANALYSIS
- Language of the job description (ISO 639-1 code, e.g. 'en', 'pt')
- Appropriate job title for the resume (a proper job title like "Engenheiro de Software", not a department name like "Software Engineering"). Do not add qualifiers like "Senior", "Full Stack", "Junior", or "Pleno" unless the job description uses that exact term.
- Key technical requirements and keywords from the job description
- Key soft/cultural values the company emphasizes
- Domain or industry focus

2. CANDIDATE FIT
- Years of experience: calculate from the earliest start date in the brag document to TODAY'S DATE provided in the prompt. Round down to complete years.
- Which technologies from the candidate's "Tecnologias" fields and "Stack principal" are relevant to this job
- Which technologies to exclude and why. Exclude:
  - Company-specific or niche deployment tools (e.g. Slack)
  - Project management and support tools (e.g. Jira, Zendesk, Trello)
  - Ubiquitous tools that add no signal (e.g. Git) -- unless the job explicitly mentions them
  These tools should NEVER appear in the skills section regardless of context.
- Protocol-level skills (SAML, SCIM, SOAP, OAuth) as SKILLS: include in the skills section ONLY if the job description mentions authentication, SSO, identity, or legacy API protocols. Otherwise exclude them from skills.
  - IMPORTANT: This restriction applies ONLY to the skills section. Bullets describing SSO, SAML, or SCIM work may still be selected if the underlying engineering work (architecture, multi-provider systems, API design) is relevant to the job -- evaluate the bullet on its engineering merit, not on the protocol name.

3. SKILL GAPS
- List any technologies the job description requires that are NOT present in the candidate's brag document (Tecnologias fields or Stack principal).
- For each gap, decide: OMIT (candidate has no adjacent experience) or INCLUDE WITH NOTE (candidate has closely related experience that makes this skill plausible -- e.g., the candidate uses React and could reasonably know Next.js).
- Be conservative: only mark INCLUDE WITH NOTE when the adjacent experience is strong and direct. Never fabricate experience.
- Technologies marked INCLUDE WITH NOTE may appear in the skills section but must NEVER be mentioned in bullets or the professional summary, since there is no documented achievement to back them.

4. BULLET SELECTION
- For each company, list the 4-6 most relevant achievements for this specific job
- Explain briefly WHY each was selected (1 sentence)
- Flag any achievements where the candidate's ownership level must be preserved (e.g. "acompanhei" should not become "liderei")
- Order by relevance to the job (most relevant first)
- When the job is explicitly front-end, back-end, or another specific layer, exclude bullets whose primary contribution is in a different layer, even if they have strong metrics. A bullet about backend synchronization logic does not belong in a front-end resume

5. SUMMARY STRATEGY
- What sentence 1 should emphasize (years + stack + domain)
- What sentence 2 should emphasize (specializations from brag)
- Whether sentence 3 is justified -- only if there's a strong quantified scope. If not, explicitly say "omit sentence 3"
- TITLE CONSISTENCY: The summary must position the candidate using the same specialization as the job title chosen in section 1. If the title is a front-end role, the summary must frame the candidate as a front-end developer. Never use "Full Stack" in the summary when the title is a front-end or back-end specific role.

6. FINAL SKILLS LIST
Organize all approved skills by category using official capitalization.
Include technologies from section 2 (relevant) and section 3 (INCLUDE WITH NOTE).
Do not include any technology not approved in those sections.
- languagesAndFrameworks: programming languages and application frameworks only (e.g. TypeScript, JavaScript, React, Next.js, NestJS). Do NOT place UI libraries, form libraries, styling tools, state management, or data fetching libraries here (e.g. React Hook Form, Redux, Tailwind, React Query belong in others).
- databasesAndApis: database engines, data stores, caches, ORMs, and API communication styles only (e.g. PostgreSQL, MongoDB, Redis, REST APIs, GraphQL). Do NOT place frontend data fetching libraries here (e.g. React Query, SWR belong in others).
- infrastructureAndCloud: cloud providers, containers, message brokers, and CI/CD tools only (e.g. Docker, AWS, RabbitMQ, Azure, GitHub Actions). Do NOT place bundlers or build tools here.
- others: styling tools, state management libraries, testing tools, build tooling, and methodologies (e.g. Tailwind CSS, Redux, Jest, Vite, Webpack, Scrum).
- If a category has no approved skills, leave it empty. Do not write "N/A" or any placeholder.

7. BULLET DATA
For each selected bullet in section 4, extract:
- Company: [exact name]
- Raw bullet summary: [1-2 sentence summary of the achievement]
- Exact metrics: [all numbers, percentages, monetary values from the brag]
- Technologies used: [only those mentioned in this specific bullet]
- Ownership verb: [exact verb the candidate used: "Implementei", "Contribui", "Acompanhei", etc.]

Be specific -- reference actual content from the brag document and job description.

TODAY'S DATE: <!-- Replace with today's date --> 2026-03-19

BRAG DOCUMENT:
<!-- Paste the contents of input/brag_document.md below -->

(paste here)

JOB DESCRIPTION:
<!-- Paste the contents of input/job_description.md below -->

(paste here)

COMPANY NAMES (use these exactly):
<!-- Replace with your company names from user-data -->
TechCorp, StartupCo

Produce the strategic analysis now.

---

## Prompt 2: JSON Generation

Send this in the same conversation after receiving the analysis. If using a fresh context (different chat, API call), paste the full analysis output where indicated.

---

You receive a strategic analysis that contains ALL information needed to generate the resume. You do NOT receive the brag document. The analysis includes: selected bullets with exact metrics, approved skills organized by category, and ownership verbs.

RULES:
1. Use ONLY the data in the analysis. Do not infer, add, or fabricate any metric, technology, or achievement not present in the analysis.
2. Copy the FINAL SKILLS LIST from the analysis into the skills object without modifications. Do not add or remove any technology.
3. Generate EXACTLY the bullets listed in BULLET DATA, one per entry. Do not add additional bullets.
4. Preserve ownership levels as flagged in the analysis.
5. Title consistency: the professional summary must match the specialization of the suggested_title. If the title is a front-end role, the summary must position the candidate as a front-end developer. Never contradict the title (e.g. saying "Full Stack" when the title is "Desenvolvedor Front-End").
6. Never assign a bullet from one company to another.

PROFESSIONAL SUMMARY:
- 2-3 sentences. First-person implicit voice using noun phrases and participles -- no "I", no "he/she", no third-person verbs (never "Desenvolveu", "Built", "Led" in the summary).
- Follow the summary strategy from the analysis.
- Every sentence must contain a technology name, domain term, or metric. If the last sentence doesn't, omit it.
- Never start with adjectives. Never end with generic statements.
- Never use em dashes or en dashes. Use commas or periods to separate clauses.

BULLET POINTS:
- Format: [Action verb] + [what was built/done] + [technology/tool] + [quantified result]
- Maximum 150 characters per bullet.
- Include metrics when the brag document provides them. Never invent metrics.
- Vary action verbs -- do not repeat the same verb more than twice across all bullets.
- Never use em dashes or en dashes. Use commas or periods to separate clauses.

SKILLS:
- Use the skills identified as relevant in the analysis. Respect the exclusions.
- Technologies marked as INCLUDE WITH NOTE in the skill gaps section may appear in the skills list, but must NOT appear in bullets or the professional summary.
- Use official capitalization for all technologies.
- The skills section must contain ONLY technologies explicitly listed as relevant in the strategic analysis (section 2) or marked as INCLUDE WITH NOTE in the skill gaps section (section 3). Do not add any technology not present in these two sections.
- Strip any annotations like (INCLUDE WITH NOTE) from skill names -- output only the clean technology name.
- If a skill category has no approved technologies, return an empty array []. Never return ["N/A"] or any placeholder string.
- languagesAndFrameworks: programming languages and application frameworks only (e.g. TypeScript, JavaScript, React, Next.js, NestJS). Do NOT place UI libraries, form libraries, styling tools, state management, or data fetching libraries here (e.g. React Hook Form, Redux, Tailwind, React Query belong in others).
- databasesAndApis: database engines, data stores, caches, ORMs, and API communication styles only (e.g. PostgreSQL, MongoDB, Redis, REST APIs, GraphQL). Do NOT place frontend data fetching libraries here (e.g. React Query, SWR belong in others).
- infrastructureAndCloud: cloud providers, containers, message brokers, and CI/CD tools only (e.g. Docker, AWS, RabbitMQ, Azure, GitHub Actions). Do NOT place bundlers or build tools here.
- others: styling tools, state management libraries, testing tools, build tooling, and methodologies (e.g. Tailwind CSS, Redux, Jest, Vite, Webpack, Scrum).

STRATEGIC ANALYSIS:
<!-- If same conversation, just say "Use the analysis from your previous response." -->
<!-- If different context, paste the full analysis output here. -->

(paste analysis here)

COMPANY NAMES TO USE (match these exactly):
<!-- Replace with your company names from user-data -->
TechCorp, StartupCo

Generate the resume JSON now. Follow the analysis for all decisions. Return ONLY the JSON object.
