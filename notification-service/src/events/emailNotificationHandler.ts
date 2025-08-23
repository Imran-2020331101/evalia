import { emailService } from '../services/emailService';
import { generateRejectionFeedbackEmail } from '../template/RejectionFeedback';
import logger from '../utils/logger';

export const handleIncomingMailEvent = async (event: any) => {
  try {
    console.log('Processing email notification event:', event.type);
    
    let notification;
    const currentDate = new Date().toISOString();
    
    switch (event.type) {
      case 'job.application.shortlisted':
        notification = {
          userName: event.userName || 'Candidate',
          userEmail: event.userEmail || event.candidateEmail,
          type: 'APPLICATION_SHORTLISTED',
          jobTitle: event.jobTitle,
          jobId: event.jobId,
          stage: event.stage || 'Application Review',
          subject: `Great News! You've been shortlisted for ${event.jobTitle}`,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #5cb85c;">Congratulations! 🎉</h2>
                <p>Dear ${event.userName || 'Candidate'},</p>
                <p>We're excited to inform you that you've been shortlisted for the <strong>${event.jobTitle}</strong> position!</p>
                <p>Our team was impressed with your application and we'd like to move forward with the next stage of our hiring process.</p>
                <p>We'll be in touch soon with details about the next steps.</p>
                <p>Best regards,<br/>The Hiring Team</p>
              </body>
            </html>
          `,
          sentAt: currentDate
        };
        break;

      case 'job.application.rejected':
      case 'candidate.rejected':
        if (event.compatibility_review || event.compatibilityReview) {
          const review = event.compatibility_review || event.compatibilityReview;
          notification = {
            userName: event.userName || 'Candidate',
            userEmail: event.userEmail || event.candidateEmail,
            type: 'APPLICATION_REJECTED',
            jobTitle: event.jobTitle,
            jobId: event.jobId,
            stage: event.stage || 'Application Review',
            compatibilityReview: review,
            subject: `Application Update – ${event.jobTitle} Role`,
            body: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <p>Hi ${event.userName || 'Candidate'},</p>
                  <p>Thank you for applying to <strong>${event.jobTitle}</strong>. While we were impressed with your profile (${review.matchPercentage}% match), we've decided to move forward with other candidates at the <strong>${event.stage}</strong> stage.</p>
                  <p><b>Your Strengths:</b> ${review.strengths.join(', ')}<br/>
                  <b>Areas to Improve:</b> ${review.weaknesses.join(', ')}</p>
                  <p>We encourage you to keep applying to similar roles and continue developing your skills.</p>
                  <p>Best regards,<br/>The Hiring Team</p>
                </body>
              </html>
            `,
            sentAt: currentDate
          };
        } else {
          notification = {
            userName: event.userName || 'Candidate',
            userEmail: event.userEmail || event.candidateEmail,
            type: 'APPLICATION_REJECTED',
            jobTitle: event.jobTitle,
            jobId: event.jobId,
            stage: event.stage || 'Application Review',
            subject: `Application Update – ${event.jobTitle} Role`,
            body: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2 style="color: #d9534f;">Application Update</h2>
                  <p>Dear ${event.userName || 'Candidate'},</p>
                  <p>Thank you for your interest in the <strong>${event.jobTitle}</strong> position.</p>
                  <p>After careful consideration at the <strong>${event.stage}</strong> stage, we have decided to move forward with other candidates.</p>
                  <p>We appreciate the time you invested in the application process and wish you the best in your career endeavors.</p>
                  <p>Best regards,<br/>The Hiring Team</p>
                </body>
              </html>
            `,
            sentAt: currentDate
          };
        }
        break;

      case 'job.application.accepted':
        notification = {
          userName: event.userName || 'Team Member',
          userEmail: event.userEmail || event.candidateEmail,
          type: 'APPLICATION_ACCEPTED',
          jobTitle: event.jobTitle,
          jobId: event.jobId,
          stage: event.stage || 'Final Review',
          subject: `Welcome aboard! Your application for ${event.jobTitle} has been accepted`,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #5cb85c;">Welcome to the team! 🎉</h2>
                <p>Dear ${event.userName || 'New Team Member'},</p>
                <p>We're thrilled to inform you that your application for the <strong>${event.jobTitle}</strong> position has been accepted!</p>
                <p>We're excited to have you join our team and look forward to working with you.</p>
                <p>Our HR team will be in touch shortly with onboarding details and your start date.</p>
                <p>Once again, welcome aboard!</p>
                <p>Best regards,<br/>The Hiring Team</p>
              </body>
            </html>
          `,
          sentAt: currentDate
        };
        break;

      default:
        logger.warn('Unhandled email notification type:', event.type);
        return;
    }

    if (notification) {
      const success = await emailService.sendNotificationEmail(notification);
      if (success) {
        logger.info('Email sent successfully for event:', event.type);
      } else {
        logger.error('Failed to send email for event:', event.type);
      }
    }

  } catch (e) {
    logger.error('Error handling email notification event:', e);
  }
};