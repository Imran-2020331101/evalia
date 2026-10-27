export const scheduleBody = {
  candidate: { id: '507f1f77bcf86cd799439011', email: 'Jane@Example.com', name: 'Jane Doe' },
  job: {
    id: '507f1f77bcf86cd799439012',
    title: 'Backend Engineer',
    interviewQA: [
      { question: 'What is REST?', referenceAnswer: 'An architectural style' },
      { question: 'What is an index?' },
    ],
  },
  organization: { id: '507f1f77bcf86cd799439013' },
  deadline: '2030-01-01T00:00:00.000Z',
};

export const createdInterview = {
  interviewId: '507f1f77bcf86cd799439099',
  candidateId: scheduleBody.candidate.id,
  candidateEmail: 'jane@example.com',
  jobId: scheduleBody.job.id,
  jobTitle: 'Backend Engineer',
  organizationId: scheduleBody.organization.id,
  deadline: new Date('2030-01-01T00:00:00.000Z'),
  totalQuestions: 2,
  status: 'SCHEDULED',
};

export const transcript = [
  { role: 'assistant' as const, text: 'What is REST?' },
  { role: 'user' as const, text: 'An architectural style for APIs' },
];
