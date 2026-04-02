import type { AiResponse, UserProfile } from '../types.js'

export const MOCK_PROFILE: UserProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  linkedin: 'linkedin.com/in/janedoe',
  github: 'github.com/janedoe',
  location: 'San Francisco, CA',
  education: [
    { institution: 'UC Berkeley', degree: 'B.S. Computer Science', period: '2014 - 2018' },
  ],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Professional' },
  ],
  experiences: [
    { company: 'Acme Corp', title: 'Senior Software Engineer', period: 'Jan 2022 - Present', description: 'Enterprise SaaS platform (500+ clients)' },
    { company: 'Startup Inc', title: 'Software Engineer', period: 'Mar 2019 - Dec 2021', description: 'B2B collaboration tool' },
    { company: 'Big Tech Co', title: 'Junior Software Engineer', period: 'Jun 2018 - Feb 2019', description: 'Cloud infrastructure division' },
  ],
}

export const MOCK_AI_RESPONSE: AiResponse = {
  suggested_title: 'Senior Backend Engineer',
  professional_summary:
    'Results-driven Senior Software Engineer with 5+ years of experience designing and building scalable distributed systems using Node.js and TypeScript. Proven track record of leading microservices migrations, optimizing system performance at scale, and mentoring engineering teams. Passionate about event-driven architectures, reliability engineering, and delivering high-impact platform infrastructure.',
  language: 'en',
  skills: {
    languagesAndFrameworks: ['TypeScript', 'JavaScript', 'Node.js', 'React', 'NestJS', 'Next.js', 'Express'],
    databasesAndApis: ['PostgreSQL', 'MongoDB', 'Redis'],
    infrastructureAndCloud: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'CI/CD'],
    others: ['REST APIs', 'GraphQL', 'Kafka', 'Git', 'Agile', 'Scrum'],
  },
  experiences: [
    {
      company: 'Acme Corp',
      bullets: [
        'Led end-to-end migration from monolithic Rails application to microservices architecture using Node.js and Kubernetes, reducing deployment time from 45 minutes to 8 minutes and enabling independent team deployments',
        'Designed and implemented real-time event processing pipeline handling 50,000 events/second using Kafka and Redis, improving data availability for downstream services by 3x',
        'Reduced API response times by 40% through implementation of Redis caching layer and PostgreSQL query optimization, directly improving user experience for 500K+ daily active users',
        'Mentored 4 junior engineers through structured 1:1 sessions and code reviews, resulting in 2 promotions within 12 months and measurable improvement in team velocity',
      ],
    },
    {
      company: 'Startup Inc',
      bullets: [
        'Architected and built core notification system from scratch supporting email, SMS, and push channels for 200K+ users, achieving 99.95% delivery reliability',
        'Implemented end-to-end CI/CD pipeline with GitHub Actions, eliminating 12 manual deployment steps and reducing release cycle from days to hours',
        'Developed RESTful API for partner integrations with comprehensive documentation, successfully onboarding 15 enterprise clients within 6 months',
        'Migrated legacy jQuery frontend to React with TypeScript, improving page load times by 55% and reducing frontend bug reports by 30%',
      ],
    },
    {
      company: 'Big Tech Co',
      bullets: [
        'Developed internal DevOps tooling using Python and Bash that automated server provisioning, reducing setup time from 4 hours to 15 minutes',
        'Contributed 3 new components to the company\'s open-source design system library, adopted by 8 internal teams',
        'Participated in on-call rotation resolving 20+ production incidents while maintaining 99.9% SLA compliance across critical services',
      ],
    },
  ],
}
