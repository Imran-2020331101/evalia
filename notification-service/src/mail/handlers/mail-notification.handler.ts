import { emailNotificationService } from '../service/mail-notification.service';
import logger from '../../utils/logger';

export const handleIncomingMailEvent = async (event: any) => {
  try {
    console.log('Processing email notification event:', event.type);
    
    let notification;
    const currentDate = new Date().toISOString();
    
    switch (event.type) {
      case 'job.application.shortlisted':
        console.log(event);
        emailNotificationService.sendInterviewInvitation(event);
        break;
        
      case 'job.application.rejected':
        console.log(event);
        emailNotificationService.sendRejectionMail(event);
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
      const success = await emailNotificationService.sendRejectionMail(notification);
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