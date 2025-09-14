import { CreateJobRequest } from "../types/job.types";


export function mapJobData(data: CreateJobRequest) {
  const {
    companyInfo,
    basic: {
      title,
      jobDescription,
      jobLocation,
      salaryFrom,
      salaryTo,
      deadline,
      jobType,
      workPlaceType,
      employmentLevelType,
    },
    requirements, responsibilities, skills, interviewQA, createdBy } = data;

  return {
    title,
    jobDescription,
    jobLocation,
    salary: { from: salaryFrom, to: salaryTo },
    deadline: new Date(deadline),
    jobType,
    workPlaceType,
    employmentLevel: employmentLevelType,
    requirements: requirements,
    responsibilities: responsibilities,
    skills: skills,
    postedBy: createdBy, // User Id of the creator of the job
    company: {
      OrganizationId    : companyInfo.organizationId || "unknown",
      OrganizationEmail : companyInfo.organizationEmail || "unknown@company.com",
    },
    status: "ACTIVE" as const,
    interviewQA: interviewQA || [],
  };
}
