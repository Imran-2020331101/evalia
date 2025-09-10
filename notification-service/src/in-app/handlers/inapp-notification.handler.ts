import { EventTypes } from "../../events/eventTypes";
import { inAppNotificationService } from "../service/inapp-notification.service";
import { io } from "../../config/socket";
import logger from "../../utils/logger";

export const handleInAppNotifications = async (event: any) => {
  try {
    let notification;
    console.log(event.type);
    switch (event.type) {
      // Resume Processing Events
      case EventTypes.RESUME_ANALYSIS_COMPLETED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Resume Analysis Complete",
          message: "Your resume has been successfully analyzed. View your detailed insights and skill recommendations.",
          type: "success",
          link: `/resume/${event.resumeId}`
        });
        break;

      case EventTypes.RESUME_ANALYSIS_FAILED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Resume Analysis Failed",
          message: "We encountered an issue analyzing your resume. Please try uploading again or contact support.",
          type: "error",
          link: `/resume/upload`
        });
        break;

      // Job Matching Events

      case EventTypes.JOB_POSTING_CREATED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Job Posted Successfully!",
          message: `Your job posting "${event.jobTitle}" has been created and is now live. Start receiving applications from qualified candidates.`,
          type: "success",
          link: `/jobs/${event.jobId}`
        });
        break;

      case EventTypes.JOB_MATCH_FOUND:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "New Job Match Found!",
          message: `We found a ${event.matchScore}% match for ${event.jobTitle} at ${event.companyName}. Check it out!`,
          type: "info",
          link: `/jobs/${event.jobId}`
        });
        break;



      case EventTypes.JOB_APPLICATION_REJECTED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Application Update",
          message: `Your application for ${event.jobTitle} at ${event.companyName} was not selected. Keep applying!`,
          type: "warning",
          link: `/jobs/search`
        });
        break;

      case EventTypes.JOB_APPLICATION_ACCEPTED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Congratulations! Job Offer Received 🎊",
          message: `You've received a job offer for ${event.jobTitle} at ${event.companyName}! Review the details.`,
          type: "success",
          link: `/applications/${event.applicationId}/offer`
        });
        break;

      case EventTypes.CAREER_RECOMMENDATION_GENERATED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "New Career Recommendations",
          message: "We've generated personalized career recommendations based on your profile and market trends.",
          type: "info",
          link: `/dashboard/recommendations`
        });
        break;



      // Authentication & Security Events
      case EventTypes.USER_EMAIL_VERIFIED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Email Verified Successfully ✅",
          message: "Your email has been verified. You now have full access to all platform features.",
          type: "success",
          link: `/profile`
        });
        break;

      case EventTypes.USER_ACCOUNT_LOCKED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Account Temporarily Locked 🔒",
          message: "Your account has been locked due to security concerns. Contact support if you need assistance.",
          type: "error",
          link: `/support`
        });
        break;

      case EventTypes.USER_ACCOUNT_UNLOCKED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Account Unlocked 🔓",
          message: "Your account has been unlocked. You can now access all features normally.",
          type: "success",
          link: `/dashboard`
        });
        break;

      case EventTypes.SUSPICIOUS_LOGIN_DETECTED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Suspicious Login Detected ⚠️",
          message: `A login attempt was made from ${event.location} using ${event.device}. If this wasn't you, secure your account immediately.`,
          type: "warning",
          link: `/security/activity`
        });
        break;

      // Recruiter Events
      case EventTypes.RECRUITER_PROFILE_APPROVED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Recruiter Profile Approved! 🎉",
          message: "Your recruiter profile has been approved. You can now start posting jobs and finding candidates.",
          type: "success",
          link: `/recruiter/dashboard`
        });
        break;

      case EventTypes.RECRUITER_PROFILE_REJECTED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Recruiter Profile Needs Review",
          message: "Your recruiter profile requires additional information. Please review and resubmit.",
          type: "warning",
          link: `/recruiter/profile/edit`
        });
        break;

      // System Events
      case EventTypes.SYSTEM_MAINTENANCE_SCHEDULED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Scheduled Maintenance Notice 🔧",
          message: `System maintenance is scheduled for ${event.maintenanceDate}. Some features may be temporarily unavailable.`,
          type: "info",
          link: `/system/status`
        });
        break;

      case EventTypes.SYSTEM_UPDATE_AVAILABLE:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "New Features Available! ✨",
          message: "We've released new features and improvements. Check out what's new in this update.",
          type: "info",
          link: `/updates`
        });
        break;

      // Interview & Assessment Events
      case EventTypes.INTERVIEW_SCHEDULED:
        inAppNotificationService.notifyInterviewCreation(event);
        break;

      case EventTypes.INTERVIEW_CANCELLED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Interview Cancelled",
          message: `Your interview for ${event.jobTitle} at ${event.companyName} has been cancelled. ${event.reason || ''}`,
          type: "warning",
          link: `/interviews`
        });
        break;

      case EventTypes.ASSIGNMENT_CREATED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "New Assignment Received 📝",
          message: `You have a new assignment for ${event.jobTitle}. Due date: ${event.dueDate}`,
          type: "info",
          link: `/assignments/${event.assignmentId}`
        });
        break;

      case EventTypes.ASSIGNMENT_GRADED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Assignment Graded ✅",
          message: `Your assignment has been graded. Score: ${event.score}/${event.totalScore}`,
          type: "success",
          link: `/assignments/${event.assignmentId}/results`
        });
        break;

      // Financial Events
      case EventTypes.SUBSCRIPTION_EXPIRED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Subscription Expired 💳",
          message: "Your subscription has expired. Renew now to continue accessing premium features.",
          type: "warning",
          link: `/subscription/renew`
        });
        break;

      case EventTypes.PAYMENT_FAILED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Payment Failed ❌",
          message: "Your payment could not be processed. Please update your payment method to continue your subscription.",
          type: "error",
          link: `/billing/payment-methods`
        });
        break;

      // Messages
      case EventTypes.MESSAGE_RECEIVED:
        notification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
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
      io.to(event.recieverEmail).emit("notification", notification);
      
      // Log successful notification creation
      console.log(`Notification created for user ${event.recieverEmail}: ${event.type}`);
    }

  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    
    // Send error notification to user if critical
    if (event.recieverEmail && event.type) {
      try {
        const errorNotification = await inAppNotificationService.createNotification({
          recieverEmail: event.recieverEmail,
          title: "Notification Error",
          message: "We had trouble processing a notification for you. Please refresh the page.",
          type: "error",
          link: `/dashboard`
        });
        
        io.to(event.recieverEmail).emit("notification", errorNotification);
      } catch (fallbackError) {
        console.error("Failed to send error notification:", fallbackError);
      }
    }
  }
};
