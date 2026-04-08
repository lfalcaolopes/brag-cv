# BragCV

CLI tool that generates personalized, ATS-friendly PDF resumes from a brag document and a job description using AI.

## How it works

1. You maintain a **brag document** (`input/brag_document.md`) with all your career achievements
2. You paste a **job description** (`input/job_description.md`) for the role you're targeting
3. The tool sends both to an AI that performs a two-pass pipeline:
   - **Pass 1 (Analysis)**: Strategic analysis of the job requirements vs. your experience -- decides which bullets, skills, and framing to use
   - **Pass 2 (Generation)**: Produces a structured JSON with the resume content
4. The JSON is rendered into a clean A4 PDF with proper sections, formatting, and layout

The AI never fabricates metrics or experience. It selects and formats what's already in your brag document.

## Supported languages

English (`en`) and Portuguese (`pt`). The tool detects the job description language and generates the resume accordingly. To add a new language, create locale and user-data files following the existing pattern.

## Setup

```bash
npm install
cp .env.example .env
```

Add your [OpenRouter](https://openrouter.ai/) API key to `.env` if you want to use `npm run generate`:

```
OPENROUTER_API_KEY=your-key-here
```

If you want to use `npm run generate:codex`, make sure the [Codex CLI](https://github.com/openai/codex) is installed, authenticated, and able to reach the network from your shell environment.

## Your data

### User profile (`src/user-data/`)

Your static information (name, contact, education, work history with titles and periods) lives in `src/user-data/en.ts` and `src/user-data/pt.ts`. This data is merged with the AI-generated content -- the AI provides bullets and skills, your profile provides everything else.

### Input files (`input/`)

| File | Purpose |
|------|---------|
| `brag_document.md` | Your full brag document with achievements, metrics, and technologies per role |
| `job_description.md` | The job posting you're targeting |

## Generating a resume

There are three main commands for producing a PDF. Which one you use depends on whether you want the tool to call OpenRouter, call the Codex CLI, or just render a manual JSON response.

### `npm run generate` -- full AI pipeline

The automated path. Reads your brag document and job description, calls OpenRouter with a two-pass pipeline, and outputs a PDF.

```
brag_document.md + job_description.md
        |
        v
  Pass 1: Analysis -- strategic analysis of job requirements vs. your experience
        |
        v
  Pass 2: Generation -- structured JSON with resume content
        |
        v
  PDF rendered to output/
```

Steps:
1. Write your brag document in `input/brag_document.md`
2. Paste the job description into `input/job_description.md`
3. Run `npm run generate`
4. Pick up the PDF from `output/`

The tool detects the job description language (English or Portuguese) and generates the resume accordingly.
It also refreshes `src/manual-generation/ai-response.ts` with the latest structured AI output, so you can edit that file and rerun `npm run generate:manual` without calling the AI again.

### `npm run generate:codex` -- Codex CLI single-pass pipeline

The Codex path. Reads your brag document and job description, calls `codex exec` with a Codex-specific single-pass prompt, validates the returned JSON, and outputs a PDF.

```
brag_document.md + job_description.md
        |
        v
  Codex single pass -- strategic analysis + JSON generation in one run
        |
        v
  PDF rendered to output/
```

Steps:
1. Write your brag document in `input/brag_document.md`
2. Paste the job description into `input/job_description.md`
3. Run `npm run generate:codex`
4. Pick up the PDF from `output/`

This path keeps the same JSON contract and PDF output as the default pipeline.
It also refreshes `src/manual-generation/ai-response.ts` with the latest structured AI output, so `npm run generate:manual` still works as a follow-up editing path.

### `npm run generate:codex:xhigh` -- Codex CLI pinned to GPT-5.4 xhigh

Same flow as `generate:codex`, but forces the Codex CLI invocation to use `gpt-5.4` with `xhigh` reasoning effort for this run.

### `npm run generate:manual` -- PDF from manual AI output

The manual path. Use this when you prefer to run the AI prompts yourself (via ChatGPT, Claude, or any other tool) and just want BragCV to render the result into a PDF.

Steps:
1. Copy a prompt from `src/manual-generation/prompt-template.md` into any AI chat
2. Paste the AI's JSON output into `src/manual-generation/ai-response.ts`
3. Run `npm run generate:manual`
4. Pick up the PDF from `output/`

This is useful when you want more control over the AI interaction, want to tweak the response before rendering, or want to avoid spending API credits.
The same file is also updated automatically after `npm run generate`, so the automated and manual flows share the same editable response source.

## Other commands

### `npm run preview`

Generates a PDF from built-in mock data. Use this to check PDF structure, layout, and styling without spending API credits or touching your input files.

```bash
npm run preview           # uses mock data's default language
npm run preview:en        # forces English labels
npm run preview:pt        # forces Portuguese labels
```

### `npm run compare`

Runs multiple model/temperature variants side by side. Configure variants in `src/compare-config.ts` (max 3). Outputs one PDF per variant plus a `compare-output.txt` log with the raw analysis and generation outputs.

### `npm test`

Runs the test suite with Vitest.

## Project structure

```
src/
  ai/
    client.ts              # OpenRouter provider, AI call functions
    codex-client.ts        # Codex CLI runner, parsing, and schema validation
    codex-prompts.ts       # Codex-specific single-pass prompt builder
    prompts.ts             # System prompts and prompt builders
  commands/
    generate-codex.ts      # Entry: Codex CLI pipeline
    generate.ts            # Entry: full AI pipeline
    generate-compare.ts    # Entry: multi-variant comparison
    generate-manual.ts        # Entry: PDF from manual AI output
    generate-preview.ts    # Entry: PDF from mock data
  fixtures/
    preview-data.ts        # Mock profile + AI response for preview
  manual-generation/
    ai-response.ts         # Cached AI response for generate:manual
    prompt-template.md     # Prompts for manual AI generation
  locales/
    en.ts                  # English section labels
    pt.ts                  # Portuguese section labels
  pdf/
    document.ts            # PDF layout, sections, styles
    filename.ts            # Output filename builder
    fonts.ts               # Shared font configuration
    merge.ts               # Merge user profile with AI bullets
    writer.ts              # PDF buffer generation and file writing
  user-data/
    en.ts                  # User profile (English)
    pt.ts                  # User profile (Portuguese)
  compare-config.ts        # Model variants for comparison runs
  config.ts                # Default model, temperature constants
  types.ts                 # Shared TypeScript types and Zod schema
input/
  brag_document.md         # Your brag document
  job_description.md       # Target job description
output/                    # Generated PDFs (gitignored)
```
