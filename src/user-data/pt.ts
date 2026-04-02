import type { UserProfile } from '../types.js'

export const USER_PROFILE_PT: UserProfile = {
  name: 'João Silva',
  email: 'joaosilva@exemplo.com',
  linkedin: 'linkedin.com/in/joaosilva',
  github: 'github.com/joaosilva',
  location: 'São Paulo, SP',
  education: [
    {
      institution: 'Universidade Estadual',
      degree: 'Bacharelado em Ciência da Computação',
      period: 'Ago 2018 - Ago 2022',
    },
    {
      institution: 'Faculdade Municipal',
      degree: 'Tecnólogo em Análise de Sistemas',
      period: 'Ago 2016 - Jul 2018',
    },
  ],
  languages: [
    { name: 'Português', level: 'Nativo' },
    { name: 'Inglês', level: 'Avançado' },
  ],
  experiences: [
    {
      company: 'TechCorp',
      title: 'Engenheiro de Software',
      period: 'Jul 2023 - Presente',
      description: 'Plataforma enterprise SaaS (200+ clientes)',
    },
    {
      company: 'StartupCo',
      title: 'Desenvolvedor Full Stack',
      period: 'Mai 2021 - Jun 2023',
      description: 'Ferramenta de gestão de projetos para agências (100+ clientes)',
    },
  ],
}
