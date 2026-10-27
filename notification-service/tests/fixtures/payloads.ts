export const rejectionPayload = (over: any = {}) => ({
  type: "job.application.rejected",
  candidateId: "c1",
  candidateName: "Alice",
  candidateEmail: "alice@test.com",
  jobTitle: "Backend Dev",
  OrganizationId: "o1",
  OrganizationName: "Acme",
  OrganizationEmail: "hr@acme.com",
  data: {
    stage: "Resume Screening",
    review: {
      matchPercentage: 55,
      fit: "Average",
      strengths: ["Node.js", "SQL"],
      weaknesses: ["Kubernetes"],
    },
    interviewEvaluation: "https://eval.test/1",
  },
  ...over,
});

export const invitationPayload = (over: any = {}) => ({
  candidateName: "Bob",
  candidateEmail: "bob@test.com",
  jobTitle: "Frontend Dev",
  OrganizationName: "Acme",
  OrganizationEmail: "hr@acme.com",
  deadline: "2030-01-01",
  interviewLink: "https://app.test/interview/1",
  guideLink: "https://app.test/guide",
  ...over,
});

export const interviewEvent = (over: any = {}) => ({
  type: "interview.scheduled",
  interviewId: "i1",
  candidateId: "c1",
  candidateEmail: "alice@test.com",
  jobId: "j1",
  jobTitle: "Backend Dev",
  deadline: "2030-01-01",
  totalQuestions: 5,
  status: "SCHEDULED",
  ...over,
});

export const batchBody = (over: any = {}) => ({
  jobId: "j1",
  jobTitle: "Backend Dev",
  companyName: "Acme",
  jobDescription: "desc",
  shortlistedCandidates: ["u1"],
  allApplicants: [
    { userId: "u1", name: "A", email: "a@t.com", resumeId: "r1" },
    { userId: "u2", name: "B", email: "b@t.com", resumeId: "r2" },
    { userId: "u3", name: "C", email: "c@t.com", resumeId: "r3" },
  ],
  recruiterId: "rec1",
  ...over,
});
