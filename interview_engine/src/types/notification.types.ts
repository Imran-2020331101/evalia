export enum EventTypes{

  INTERVIEW_SCHEDULED = "interview.scheduled",
  INTERVIEW_CANCELLED = "interview.cancelled",
  ASSIGNMENT_CREATED = "assignment.created",
  ASSIGNMENT_GRADED = "assignment.graded",
  
}

type InterviewStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type InterviewCreatedNotification = {
  type: string;
  interviewId: string;
  candidateId: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  deadline: string | Date;
  totalQuestions: number;
  status: InterviewStatus;
};
