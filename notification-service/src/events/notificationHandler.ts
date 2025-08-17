import { EventTypes } from "./eventTypes";
import { createNotification } from "../services/notificationService";
import { batchFeedbackService } from "../services/batchFeedbackService";
import { io } from "../config/socket";
import logger from "../utils/logger";

export const handleIncomingEvent = async (event: any) => {
  try {
    let notification;
    console.log(event.type);
    switch (event.type) {
      // Resume Processing Events
      case EventTypes.RESUME_ANALYSIS_COMPLETED:
        notification = await createNotification({
          userId: event.userId,
          title: "Resume Analysis Complete",
          message: "Your resume has been successfully analyzed. View your detailed insights and skill recommendations.",
          type: "success",
          link: `/resume/${event.resumeId}`
        });
        break;

      case EventTypes.RESUME_ANALYSIS_FAILED:
        notification = await createNotification({
          userId: event.userId,
          title: "Resume Analysis Failed",
          message: "We encountered an issue analyzing your resume. Please try uploading again or contact support.",
          type: "error",
          link: `/resume/upload`
        });
        break;

      // Job Matching Events

      case EventTypes.JOB_POSTING_CREATED:
        notification = await createNotification({
          userId: event.userId,
          title: "Job Posted Successfully!",
          message: `Your job posting "${event.jobTitle}" has been created and is now live. Start receiving applications from qualified candidates.`,
          type: "success",
          link: `/jobs/${event.jobId}`
        });
        break;

      case EventTypes.JOB_MATCH_FOUND:
        notification = await createNotification({
          userId: event.userId,
          title: "New Job Match Found!",
          message: `We found a ${event.matchScore}% match for ${event.jobTitle} at ${event.companyName}. Check it out!`,
          type: "info",
          link: `/jobs/${event.jobId}`
        });
        break;

      case EventTypes.JOB_APPLICATION_SHORTLISTED:
        notification = await createNotification({
          userId: event.userId,
          title: "Application Shortlisted! 🎉",
          message: `Great news! You've been shortlisted for ${event.jobTitle} at ${event.companyName}.`,
          type: "success",
          link: `/applications/${event.applicationId}`
        });
        break;

      case EventTypes.JOB_APPLICATION_REJECTED:
        notification = await createNotification({
          userId: event.userId,
          title: "Application Update",
          message: `Your application for ${event.jobTitle} at ${event.companyName} was not selected. Keep applying!`,
          type: "warning",
          link: `/jobs/search`
        });
        break;

      case EventTypes.JOB_APPLICATION_ACCEPTED:
        notification = await createNotification({
          userId: event.userId,
          title: "Congratulations! Job Offer Received 🎊",
          message: `You've received a job offer for ${event.jobTitle} at ${event.companyName}! Review the details.`,
          type: "success",
          link: `/applications/${event.applicationId}/offer`
        });
        break;

      case EventTypes.CAREER_RECOMMENDATION_GENERATED:
        notification = await createNotification({
          userId: event.userId,
          title: "New Career Recommendations",
          message: "We've generated personalized career recommendations based on your profile and market trends.",
          type: "info",
          link: `/dashboard/recommendations`
        });
        break;

      case EventTypes.BATCH_REJECTION_FEEDBACK:
        // Handle batch rejection feedback processing
        logger.info(`Processing batch rejection feedback for job: ${event.jobId}`);
        
        try {
          const result = await batchFeedbackService.processBatchRejectionFeedback({
            jobId: event.jobId,
            jobTitle: event.jobTitle,
            companyName: event.companyName,
            jobDescription: event.jobDescription,
            shortlistedCandidates: event.shortlistedCandidates,
            allApplicants: event.allApplicants,
            recruiterId: event.recruiterId
          });
          
          logger.info(`Batch feedback completed: ${result.processed} processed, ${result.failed} failed`);
          
          // The individual notifications are handled within the batch service
          // No need to create additional notifications here
          notification = null; // Don't create a notification for the batch event itself
          
        } catch (error) {
          logger.error("Batch rejection feedback failed:", error);
          
          // Notify the recruiter that batch processing failed
          notification = await createNotification({
            userId: event.recruiterId,
            title: "Batch Processing Failed",
            message: `Failed to send rejection feedback for ${event.jobTitle}. Please try again or contact support.`,
            type: "error",
            link: `/recruiter/jobs/${event.jobId}`
          });
        }
        break;

      // Authentication & Security Events
      case EventTypes.USER_EMAIL_VERIFIED:
        notification = await createNotification({
          userId: event.userId,
          title: "Email Verified Successfully ✅",
          message: "Your email has been verified. You now have full access to all platform features.",
          type: "success",
          link: `/profile`
        });
        break;

      case EventTypes.USER_ACCOUNT_LOCKED:
        notification = await createNotification({
          userId: event.userId,
          title: "Account Temporarily Locked 🔒",
          message: "Your account has been locked due to security concerns. Contact support if you need assistance.",
          type: "error",
          link: `/support`
        });
        break;

      case EventTypes.USER_ACCOUNT_UNLOCKED:
        notification = await createNotification({
          userId: event.userId,
          title: "Account Unlocked 🔓",
          message: "Your account has been unlocked. You can now access all features normally.",
          type: "success",
          link: `/dashboard`
        });
        break;

      case EventTypes.SUSPICIOUS_LOGIN_DETECTED:
        notification = await createNotification({
          userId: event.userId,
          title: "Suspicious Login Detected ⚠️",
          message: `A login attempt was made from ${event.location} using ${event.device}. If this wasn't you, secure your account immediately.`,
          type: "warning",
          link: `/security/activity`
        });
        break;

      // Recruiter Events
      case EventTypes.RECRUITER_PROFILE_APPROVED:
        notification = await createNotification({
          userId: event.userId,
          title: "Recruiter Profile Approved! 🎉",
          message: "Your recruiter profile has been approved. You can now start posting jobs and finding candidates.",
          type: "success",
          link: `/recruiter/dashboard`
        });
        break;

      case EventTypes.RECRUITER_PROFILE_REJECTED:
        notification = await createNotification({
          userId: event.userId,
          title: "Recruiter Profile Needs Review",
          message: "Your recruiter profile requires additional information. Please review and resubmit.",
          type: "warning",
          link: `/recruiter/profile/edit`
        });
        break;

      // System Events
      case EventTypes.SYSTEM_MAINTENANCE_SCHEDULED:
        notification = await createNotification({
          userId: event.userId,
          title: "Scheduled Maintenance Notice 🔧",
          message: `System maintenance is scheduled for ${event.maintenanceDate}. Some features may be temporarily unavailable.`,
          type: "info",
          link: `/system/status`
        });
        break;

      case EventTypes.SYSTEM_UPDATE_AVAILABLE:
        notification = await createNotification({
          userId: event.userId,
          title: "New Features Available! ✨",
          message: "We've released new features and improvements. Check out what's new in this update.",
          type: "info",
          link: `/updates`
        });
        break;

      // Interview & Assessment Events
      case EventTypes.INTERVIEW_SCHEDULED:
        notification = await createNotification({
          userId: event.userId,
          title: "Interview Scheduled 📅",
          message: `Your interview for ${event.jobTitle} at ${event.companyName} is scheduled for ${event.interviewDate}.`,
          type: "info",
          link: `/interviews/${event.interviewId}`
        });
        break;

      case EventTypes.INTERVIEW_CANCELLED:
        notification = await createNotification({
          userId: event.userId,
          title: "Interview Cancelled",
          message: `Your interview for ${event.jobTitle} at ${event.companyName} has been cancelled. ${event.reason || ''}`,
          type: "warning",
          link: `/interviews`
        });
        break;

      case EventTypes.ASSIGNMENT_CREATED:
        notification = await createNotification({
          userId: event.userId,
          title: "New Assignment Received 📝",
          message: `You have a new assignment for ${event.jobTitle}. Due date: ${event.dueDate}`,
          type: "info",
          link: `/assignments/${event.assignmentId}`
        });
        break;

      case EventTypes.ASSIGNMENT_GRADED:
        notification = await createNotification({
          userId: event.userId,
          title: "Assignment Graded ✅",
          message: `Your assignment has been graded. Score: ${event.score}/${event.totalScore}`,
          type: "success",
          link: `/assignments/${event.assignmentId}/results`
        });
        break;

      // Financial Events
      case EventTypes.SUBSCRIPTION_EXPIRED:
        notification = await createNotification({
          userId: event.userId,
          title: "Subscription Expired 💳",
          message: "Your subscription has expired. Renew now to continue accessing premium features.",
          type: "warning",
          link: `/subscription/renew`
        });
        break;

      case EventTypes.PAYMENT_FAILED:
        notification = await createNotification({
          userId: event.userId,
          title: "Payment Failed ❌",
          message: "Your payment could not be processed. Please update your payment method to continue your subscription.",
          type: "error",
          link: `/billing/payment-methods`
        });
        break;

      // Messages
      case EventTypes.MESSAGE_RECEIVED:
        notification = await createNotification({
          userId: event.userId,
          title: `New Message from ${event.senderName}`,
          message: event.messagePreview || "You have received a new message.",
          type: "info",
          link: `/messages/${event.conversationId}`
        });
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return;
    }

    if (notification) {
      // Send real-time notification via WebSocket (Fixed: use correct room name and event)
      io.to(event.userId).emit("notification", notification);
      
      // Log successful notification creation
      console.log(`Notification created for user ${event.userId}: ${event.type}`);
    }

  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    
    // Send error notification to user if critical
    if (event.userId && event.type) {
      try {
        const errorNotification = await createNotification({
          userId: event.userId,
          title: "Notification Error",
          message: "We had trouble processing a notification for you. Please refresh the page.",
          type: "error",
          link: `/dashboard`
        });
        
        io.to(event.userId).emit("notification", errorNotification);
      } catch (fallbackError) {
        console.error("Failed to send error notification:", fallbackError);
      }
    }
  }
};
