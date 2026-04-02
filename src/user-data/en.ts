import type { UserProfile } from '../types.js'

export const USER_PROFILE_EN: UserProfile = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  location: 'New York, NY, USA',
  education: [
    {
      institution: 'State University',
      degree: 'B.S. Computer Science',
      period: 'Aug 2018 - Aug 2022',
    },
    {
      institution: 'City College',
      degree: 'A.S. Information Technology',
      period: 'Aug 2016 - Jul 2018',
    },
  ],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Advanced' },
  ],
  experiences: [
    {
      company: 'TechCorp',
      title: 'Software Engineer',
      period: 'Jul 2023 - Present',
      description: 'Enterprise SaaS platform (200+ clients)',
    },
    {
      company: 'StartupCo',
      title: 'Full Stack Developer',
      period: 'May 2021 - Jun 2023',
      description: 'Project management tool for agencies (100+ clients)',
    },
  ],
}
