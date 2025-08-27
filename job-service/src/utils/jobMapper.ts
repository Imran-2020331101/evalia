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
    requirements, responsibilities, skills, interviewQA } = data;

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
    postedBy: companyInfo.organizationEmail,
    company: {
      OrganizationId    : companyInfo.organizationId,
      OrganizationEmail : companyInfo.organizationEmail || "",
    },
    status: "active" as const,
    interviewQA: interviewQA || [],
  };
}
