export enum EventTypes {
  // Resume Processing Events (from AI Server) - Important for users to know
  RESUME_ANALYSIS_COMPLETED = "resume.analysis.completed",
  RESUME_ANALYSIS_FAILED = "resume.analysis.failed",
  
  // Job Matching Events (from Upskill Engine) - Critical for job seekers
  JOB_MATCH_FOUND = "job.match.found",
  JOB_APPLICATION_SHORTLISTED = "job.application.shortlisted",
  JOB_APPLICATION_REJECTED = "job.application.rejected",
  JOB_APPLICATION_ACCEPTED = "job.application.accepted",
  CAREER_RECOMMENDATION_GENERATED = "career.recommendation.generated",
  
  // Authentication Events (from Auth Server) - Security related
  USER_EMAIL_VERIFIED = "user.email.verified",
  USER_ACCOUNT_LOCKED = "user.account.locked",
  USER_ACCOUNT_UNLOCKED = "user.account.unlocked",
  SUSPICIOUS_LOGIN_DETECTED = "user.suspicious.login.detected",
  
  // Company/Recruiter Events (from Auth Server) - Business critical
  RECRUITER_PROFILE_APPROVED = "recruiter.profile.approved",
  RECRUITER_PROFILE_REJECTED = "recruiter.profile.rejected",
  
  // System Events - Important announcements
  SYSTEM_MAINTENANCE_SCHEDULED = "system.maintenance.scheduled",
  SYSTEM_UPDATE_AVAILABLE = "system.update.available",
  
  // Interview & Assessment Events - Time sensitive
  INTERVIEW_SCHEDULED = "interview.scheduled",
  INTERVIEW_CANCELLED = "interview.cancelled",
  ASSIGNMENT_CREATED = "assignment.created",
  ASSIGNMENT_GRADED = "assignment.graded",
  
  // Subscription & Payment Events - Financial notifications
  SUBSCRIPTION_EXPIRED = "subscription.expired",
  PAYMENT_FAILED = "payment.failed",
  
  // Critical Messages that need attention
  MESSAGE_RECEIVED = "message.received",
}
