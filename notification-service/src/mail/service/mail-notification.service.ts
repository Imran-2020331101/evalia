import nodemailer from "nodemailer";
import logger from "../../utils/logger";
import { generateRejectionFeedbackEmail } from "../template/rejection";
import { generateInterviewInvitationMail } from "../template/interviewInvitation";
import { InterviewInvitationPayload} from "../types/interview-invitation.payload";
import { RejectionMailPayload } from "../types/rejection-mail.type";

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
  }

  async sendRejectionMail(notification: RejectionMailPayload): Promise<boolean> {
    return await this.sendMail({
        to: notification.candidateEmail,
        subject: `Update on your Application for the job `,
        html: generateRejectionFeedbackEmail(notification)
      });    
  }

  async sendInterviewInvitation(notification: InterviewInvitationPayload): Promise<boolean> {
    return await this.sendMail({
        to: notification.candidateEmail,
        subject: `Interview for ${notification.jobTitle} at ${notification.OrganizationName}`,
        html: generateInterviewInvitationMail(notification),
      })
  }

  async finalInterviewInvitation(): Promise<boolean>{
    return true;
  }

}

export const emailNotificationService = new EmailNotificationService();
