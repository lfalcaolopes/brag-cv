import type { AiResponse } from '../types.js'

export const aiResponse: AiResponse = {
  "suggested_title": "React Frontend Developer",
  "professional_summary": "React Frontend Developer with approximately 3 years of experience in enterprise SaaS and project management platforms, using React, Next.js, and TypeScript. Specialized in scalable component architecture, interface performance, frontend authentication and authorization systems, and delivering features with measurable impact on large-scale customer bases.",
  "language": "en",
  "skills": {
    "languagesAndFrameworks": [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js"
    ],
    "databasesAndApis": [
      "REST APIs",
      "GraphQL"
    ],
    "infrastructureAndCloud": [
      "Docker"
    ],
    "others": [
      "Tailwind CSS",
      "Styled Components",
      "Zustand",
      "Redux",
      "React Query",
      "React Hook Form",
      "Vite",
      "Jest",
      "Vitest"
    ]
  },
  "experiences": [
    {
      "company": "TechCorp",
      "bullets": [
        "Implemented a customer retention module with configurable rules per tenant in React and TypeScript, achieving ~40% adoption and $50k in monthly savings.",
        "Built integration configuration screens for Stripe, Twilio, and third-party APIs, enabling the migration of ~80 clients (~30% of the base) to the new version.",
        "Built SSO support on the frontend with a multi-provider architecture, company-level configuration interface, and fallback to email and password authentication.",
        "Added ~300 tests using Jest to previously uncovered functions, increasing overall application test coverage by 20%.",
        "Fixed the calendar date selection flow and implemented validation rules by region in the scheduling system.",
        "Implemented configurable automatic approval rules by type, resulting in over 5,000 requests approved without manual intervention."
      ]
    },
    {
      "company": "StartupCo",
      "bullets": [
        "Refactored application tables with frontend pagination in React and TypeScript, reducing initial load time by 80%.",
        "Developed the frontend of a multitenant permission control system, addressing 28% of security incidents caused by unauthorized access.",
        "Built the interface for exporting analytics reports in PDF using Styled Components, allowing granular selection of metrics and date ranges.",
        "Developed an automation script for version verification across 100 clients, reducing the process from 2 hours to 10 minutes, a 90% time reduction."
      ]
    }
  ]
}
