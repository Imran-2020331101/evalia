import nodemailer from "nodemailer";
import { env } from "../config/env";
import logger from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface NotificationPayload {
  userName: string;
  userEmail: string;
  type: string;
  jobTitle: string;
  jobId: string;
  stage: string;
  compatibilityReview?: {
    matchPercentage: number;
    fit: 'Best Fit' | 'Good Fit' | 'Average' | 'Bad Fit';
    strengths: string[];
    weaknesses: string[];
  };
  subject: string;
  body: string;
  sentAt: string;
}

class EmailService {
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

  async sendEmail(options: EmailOptions): Promise<boolean> {
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
        to: notification.userEmail,
        subject: notification.subject,
        html: notification.body,
      };

      const success = await this.sendEmail(emailOptions);
      
      if (success) {
        logger.info(`Notification email sent successfully`, {
          type: notification.type,
          userEmail: notification.userEmail,
          jobTitle: notification.jobTitle,
          sentAt: notification.sentAt
        });
      }

      return success;
    } catch (error) {
      logger.error(`Failed to send notification email`, {
        error: error,
        type: notification.type,
        userEmail: notification.userEmail
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
