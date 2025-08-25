import nodemailer from "nodemailer";
import logger from "../utils/logger";
import { generateRejectionFeedbackEmail } from "../template/RejectionFeedback";
import { NotificationPayload } from "../types/emailNotifications.type";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}


class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error("Email transporter verification failed:", error);
      } else {
        logger.info("Email transporter is ready");
      }
    });
  }

  async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendNotificationEmail(notification: NotificationPayload): Promise<boolean> {
    try {
      const emailOptions: EmailOptions = {
        to: notification.candidateEmail,
        subject: `Update on your Application for the job `,
        html: generateRejectionFeedbackEmail(notification)
      };

      const success = await this.sendMail(emailOptions);
      
      if (success) {
        logger.info(`Notification email sent successfully`, {
          type: notification.type,
          userEmail: notification.candidateEmail,
          jobTitle: notification.jobTitle,
          // sentAt: TODO: add current time
        });
      }

      return success;
    } catch (error) {
      logger.error(`Failed to send notification email`, {
        error: error,
        type: notification.type,
        userEmail: notification.candidateEmail
      });
      return false;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
