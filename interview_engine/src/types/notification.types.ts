type InterviewStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type InterviewCreatedNotification = {
  type: string;
  interviewId: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  deadline: string | Date;
  totalQuestions: number;
  status: InterviewStatus;
};
