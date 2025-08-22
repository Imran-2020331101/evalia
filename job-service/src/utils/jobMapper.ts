import { CreateJobRequest } from "@/types/job.types";


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
    requirement, responsibility, skill, interviewQA } = data;

  return {
    title,
    jobDescription,
    jobLocation,
    salary: { from: salaryFrom, to: salaryTo },
    deadline: new Date(deadline),
    jobType,
    workPlaceType,
    employmentLevel: employmentLevelType,
    requirements: requirement,
    responsibilities: responsibility,
    skills: skill,
    postedBy: companyInfo.id,
    company: { id: companyInfo.id },
    status: "active" as const,
    interviewQA: interviewQA || [],
  };
}
