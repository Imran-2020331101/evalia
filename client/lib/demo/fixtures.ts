import { DEMO_CANDIDATE_EMAIL, DEMO_RECRUITER_EMAIL } from './config'

const LOGO = '/evalia-short.png'
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

export const candidateUser = {
  user: {
    id: 'u-candidate',
    name: 'Alex Rahman',
    email: DEMO_CANDIDATE_EMAIL,
    roles: ['USER'],
    bio: 'Full-stack engineer who likes shipping AI-assisted products',
    location: 'Dhaka, Bangladesh',
    aboutMe:
      'Final-year CS student and MERN/Spring developer. Built a few microservice projects, compete in ICPC-style contests and enjoy turning messy workflows into clean tools.',
    profilePictureUrl: null,
    coverPictureUrl: null,
    resumeUrl: '',
  },
  resumeData: {
    industry: 'STEM & Technical',
    skills: {
      technical: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Java', 'Spring Boot', 'MongoDB', 'Python'],
      soft: ['Problem solving', 'Team collaboration'],
      languages: ['English', 'Bangla'],
      tools: ['Git', 'Docker', 'Postman'],
      other: ['Competitive programming'],
    },
    experience: [
      {
        job_title: 'Software Engineering Intern',
        company: 'Brightwave Labs',
        duration: 'Jun 2025 - Sep 2025',
        description: [
          'Built REST APIs in Node.js and Spring Boot used by a 12k-user mobile app',
          'Moved CI from manual deploys to GitHub Actions',
        ],
        achievements: ['Cut average API latency by 38% with query indexing and caching'],
      },
    ],
    education: [
      {
        degree: 'B.Sc. in Computer Science and Engineering',
        institution: 'Shahjalal University of Science and Technology',
        year: '2022 - Present',
        gpa: '3.71',
      },
    ],
    projects: [
      {
        title: 'Evalia',
        description: 'AI hiring platform with resume parsing, vector job matching and an AI voice interviewer.',
        url: 'https://github.com/Imran-2020331101/evalia',
        technologies: ['Next.js', 'Spring Boot', 'Qdrant', 'OpenAI'],
      },
      {
        title: 'Judge Runner',
        description: 'Sandboxed code-execution service for programming contests.',
        technologies: ['Docker', 'Node.js'],
      },
    ],
    certifications: [
      { title: 'Meta Front-End Developer', provider: 'Coursera', date: '2024', link: '' },
    ],
    awards: [{ title: 'ICPC Regional - Top 20', description: 'Dhaka site 2024' }],
  },
}

export const recruiterUser = {
  user: {
    id: 'u-recruiter',
    name: 'Jordan Hayes',
    email: DEMO_RECRUITER_EMAIL,
    roles: ['RECRUITER'],
    bio: 'Talent lead at Northwind Systems',
    location: 'Remote',
    aboutMe: 'Hiring engineers who care about craft.',
    profilePictureUrl: null,
    coverPictureUrl: null,
    resumeUrl: '',
  },
}

export const organizations = [
  {
    id: 'org-northwind',
    organizationName: 'Northwind Systems',
    organizationNameBangla: 'নর্থউইন্ড সিস্টেমস',
    organizationProfileImageUrl: LOGO,
    yearOfEstablishment: 2016,
    numberOfEmployees: '201-500',
    organizationAddress: 'Austin, TX, USA',
    organizationAddressBangla: '',
    industryType: 'Software & Cloud',
    businessDescription: 'Cloud tooling for logistics teams. Remote-first, engineering-led.',
    businessLicenseNo: 'NW-2016-0042',
    rlNo: 'RL-7781',
    websiteUrl: 'https://example.com',
    enableDisabilityFacilities: true,
    acceptPrivacyPolicy: true,
    verified: true,
    ownerEmail: DEMO_RECRUITER_EMAIL,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(10),
  },
  {
    id: 'org-lumen',
    organizationName: 'Lumen Health AI',
    organizationNameBangla: '',
    organizationProfileImageUrl: LOGO,
    yearOfEstablishment: 2020,
    numberOfEmployees: '51-200',
    organizationAddress: 'Berlin, Germany',
    organizationAddressBangla: '',
    industryType: 'Health Tech',
    businessDescription: 'Clinical decision-support models for hospitals.',
    businessLicenseNo: 'LH-2020-0198',
    rlNo: 'RL-5520',
    websiteUrl: 'https://example.com',
    enableDisabilityFacilities: true,
    acceptPrivacyPolicy: true,
    verified: true,
    ownerEmail: 'hiring@lumen.example',
    createdAt: daysAgo(300),
    updatedAt: daysAgo(40),
  },
]

const section = (items: [string, string, string][]) =>
  items.map(([type, category, description]) => ({ type, category, description }))

const baseJob = (o: any) => ({
  status: 'ACTIVE',
  applications: [],
  createdAt: daysAgo(3),
  deadline: daysAhead(21),
  ...o,
})

export const jobs = [
  baseJob({
    _id: 'job-1',
    title: 'Senior Full-Stack Engineer',
    company: { OrganizationId: 'org-northwind' },
    jobLocation: 'Remote (US/EU)',
    jobType: 'FULL_TIME',
    workPlaceType: 'REMOTE',
    employmentLevel: 'SENIOR',
    salary: { from: 140, to: 180 },
    jobDescription: 'Own features end to end across our React/Node stack and help shape the platform roadmap.',
    requirements: section([
      ['REQUIREMENT', 'Experience', '5+ years building production web apps'],
      ['REQUIREMENT', 'Frontend', 'Strong React and TypeScript'],
    ]),
    responsibilities: section([
      ['RESPONSIBILITY', 'Delivery', 'Ship features from design to production'],
      ['RESPONSIBILITY', 'Mentoring', 'Review code and mentor mid-level engineers'],
    ]),
    skills: section([
      ['SKILL', 'Languages', 'TypeScript, Node.js'],
      ['SKILL', 'Data', 'PostgreSQL or MongoDB'],
    ]),
    interviewQA: [
      { question: 'How would you design a notification system that scales?', referenceAnswer: 'Event-driven, queue-backed, persistent store plus websocket fan-out.' },
    ],
    applications: [
      { _id: 'app-rev-1', candidateId: 'u-candidate', candidateEmail: DEMO_CANDIDATE_EMAIL, status: 'PENDING', appliedAt: daysAgo(1), reviewId: 'rev-1' },
      { _id: 'app-rev-2', candidateId: 'u-cand-2', candidateEmail: 'priya.nair@example.com', status: 'SHORTLISTED', appliedAt: daysAgo(2), reviewId: 'rev-2' },
      { _id: 'app-rev-3', candidateId: 'u-cand-3', candidateEmail: 'marco.rossi@example.com', status: 'PENDING', appliedAt: daysAgo(2), reviewId: 'rev-3' },
    ],
  }),
  baseJob({
    _id: 'job-2',
    title: 'Backend Engineer (Java / Spring)',
    company: { OrganizationId: 'org-northwind' },
    jobLocation: 'Austin, TX',
    jobType: 'FULL_TIME',
    workPlaceType: 'HYBRID',
    employmentLevel: 'MID',
    salary: { from: 110, to: 140 },
    jobDescription: 'Build the services behind our routing and tracking products.',
    requirements: section([['REQUIREMENT', 'Experience', '3+ years with Java and Spring Boot']]),
    responsibilities: section([['RESPONSIBILITY', 'Services', 'Design and operate REST and event-driven services']]),
    skills: section([['SKILL', 'Backend', 'Java 17, Spring Boot, Kafka or RabbitMQ']]),
    interviewQA: [],
    createdAt: daysAgo(6),
  }),
  baseJob({
    _id: 'job-3',
    title: 'ML Engineer - Clinical NLP',
    company: { OrganizationId: 'org-lumen' },
    jobLocation: 'Berlin, Germany',
    jobType: 'FULL_TIME',
    workPlaceType: 'ONSITE',
    employmentLevel: 'MID',
    salary: { from: 95, to: 130 },
    jobDescription: 'Fine-tune and evaluate language models on de-identified clinical text.',
    requirements: section([['REQUIREMENT', 'ML', 'Hands-on with transformers and evaluation pipelines']]),
    responsibilities: section([['RESPONSIBILITY', 'Research', 'Prototype, benchmark and productionize NLP models']]),
    skills: section([['SKILL', 'Python', 'PyTorch, Hugging Face, MLOps basics']]),
    interviewQA: [],
    createdAt: daysAgo(9),
  }),
  baseJob({
    _id: 'job-4',
    title: 'Frontend Engineering Intern',
    company: { OrganizationId: 'org-lumen' },
    jobLocation: 'Remote',
    jobType: 'INTERN',
    workPlaceType: 'REMOTE',
    employmentLevel: 'ENTRY',
    salary: { from: 2, to: 4 },
    jobDescription: 'Help build clinician-facing dashboards with React and charting libraries.',
    requirements: section([['REQUIREMENT', 'Basics', 'Comfortable with HTML, CSS and JavaScript']]),
    responsibilities: section([['RESPONSIBILITY', 'UI', 'Implement designs and fix UI bugs']]),
    skills: section([['SKILL', 'Frontend', 'React, TypeScript']]),
    interviewQA: [],
    createdAt: daysAgo(1),
  }),
]

export const notifications = [
  { _id: 'n1', type: 'interview_scheduled', title: 'Interview scheduled', message: 'Your AI interview for Senior Full-Stack Engineer is ready.', isRead: false, createdAt: daysAgo(0), data: { interviewId: 'int-1' } },
  { _id: 'n2', type: 'application_update', title: 'Application received', message: 'Northwind Systems received your application.', isRead: false, createdAt: daysAgo(1) },
  { _id: 'n3', type: 'default', title: 'Welcome to Evalia', message: 'Build your profile to get matched with jobs.', isRead: true, createdAt: daysAgo(7) },
]

export const interviews = [
  { id: 'int-1', interviewStatus: 'SCHEDULED', jobTitle: 'Senior Full-Stack Engineer', organizationId: 'org-northwind', jobId: 'job-1', createdAt: daysAgo(0) },
  { id: 'int-2', interviewStatus: 'COMPLETED', jobTitle: 'Backend Engineer (Java / Spring)', organizationId: 'org-northwind', jobId: 'job-2', createdAt: daysAgo(12) },
  { id: 'int-3', interviewStatus: 'CANCELLED', jobTitle: 'ML Engineer - Clinical NLP', organizationId: 'org-lumen', jobId: 'job-3', createdAt: daysAgo(30) },
]

export const interviewDetail = {
  id: 'int-2',
  jobTitle: 'Backend Engineer (Java / Spring)',
  summary:
    'Solid grasp of Spring fundamentals and API design. Good reasoning on caching trade-offs; less depth on messaging.',
  questionsAnswers: [
    { question: 'Explain how Spring resolves bean dependencies.', referenceAnswer: 'Via the IoC container and autowiring by type/qualifier.', candidateAnswer: 'The container builds a bean graph, injects by type and uses qualifiers or primary beans when there is ambiguity.', duration: 41 },
    { question: 'How would you cache a hot read endpoint?', referenceAnswer: 'Cache-aside with TTL and explicit invalidation.', candidateAnswer: 'Cache-aside with Redis, short TTL and invalidation on write; I would watch stampedes.', duration: 38 },
    { question: 'When would you pick a message queue over direct calls?', referenceAnswer: 'Decoupling, retries, back-pressure.', candidateAnswer: 'When the caller should not wait and we need retries, for example sending emails.', duration: 29 },
  ],
}

export const evaluation = {
  _id: 'eval-1',
  interviewId: 'int-2',
  overallScore: 82,
  contentAggregate: 84,
  commAggregate: 79,
  integrityAggregate: 91,
  responsivenessAggregate: 80,
  perQuestion: [
    { questionIndex: 0, contentScore: 88, communicationScore: 82, finalScore: 86, similarity: 0.78, keywordsMatched: ['ioc', 'autowiring', 'qualifier'], keywordCoverage: 0.7, responseLatency: 1.1, fillerRate: 0.03 },
    { questionIndex: 1, contentScore: 85, communicationScore: 80, finalScore: 83, similarity: 0.74, keywordsMatched: ['cache-aside', 'ttl', 'invalidation'], keywordCoverage: 0.75, responseLatency: 1.4, fillerRate: 0.04 },
    { questionIndex: 2, contentScore: 70, communicationScore: 72, finalScore: 71, similarity: 0.55, keywordsMatched: ['retries'], keywordCoverage: 0.35, responseLatency: 2.3, fillerRate: 0.08 },
  ],
  flags: [],
  decision: 'advance',
  modelVersion: '1.3.0',
  summaryText: 'Strong candidate. Recommend advancing to the technical panel.',
  publishedAt: daysAgo(11),
}

export const compatibility = {
  fit: 'Strong fit',
  matchPercentage: 87,
  strengths: ['Hands-on TypeScript and React experience', 'Built multi-service systems end to end', 'Competitive-programming background'],
  weaknesses: ['Limited production on-call experience', 'No Kubernetes exposure listed'],
}

export const courses = [
  { videoId: 'SqcY0GlETPk', title: 'React Tutorial for Beginners', channelTitle: 'Programming with Mosh', description: 'Learn React in under 2 hours.', publishedAt: daysAgo(700) },
  { videoId: 'GtZexwZnrmU', title: 'System Design Basics', channelTitle: 'Tech Primers', description: 'Scalability, caching and load balancing explained.', publishedAt: daysAgo(500) },
  { videoId: 'RRubcjpTkks', title: 'Spring Boot Full Course', channelTitle: 'Amigoscode', description: 'Build REST APIs with Spring Boot.', publishedAt: daysAgo(400) },
].map((c) => ({
  ...c,
  channelId: 'demo',
  thumbnails: { medium: { url: `https://i.ytimg.com/vi/${c.videoId}/mqdefault.jpg` } },
}))

export const matchedCandidates = [
  { 'candidate-id': 'u-cand-2', candidateName: 'Priya Nair', skills: 0.91, experience: 0.84, projects: 0.88, education: 0.8 },
  { 'candidate-id': 'u-candidate', candidateName: 'Alex Rahman', skills: 0.86, experience: 0.7, projects: 0.9, education: 0.85 },
  { 'candidate-id': 'u-cand-3', candidateName: 'Marco Rossi', skills: 0.78, experience: 0.82, projects: 0.7, education: 0.74 },
]

const otherCandidate = (id: string, name: string, email: string, title: string) => ({
  user: { id, name, email, roles: ['USER'], bio: title, location: 'Remote', aboutMe: '', profilePictureUrl: null, coverPictureUrl: null, resumeUrl: '' },
  resumeData: { ...candidateUser.resumeData },
})

export const usersById: Record<string, any> = {
  'u-candidate': candidateUser,
  'u-cand-2': otherCandidate('u-cand-2', 'Priya Nair', 'priya.nair@example.com', 'Full-stack engineer'),
  'u-cand-3': otherCandidate('u-cand-3', 'Marco Rossi', 'marco.rossi@example.com', 'Backend engineer'),
}
