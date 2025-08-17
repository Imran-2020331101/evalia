import nodemailer from "nodemailer";
import { env } from "../config/env";
import logger from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BatchEmailOptions {
  recipients: Array<{
    email: string;
    name: string;
    personalizedContent: string;
  }>;
  subject: string;
  baseTemplate: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
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
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
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

  async sendBatchEmails(options: BatchEmailOptions): Promise<{
    success: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    let success = 0;
    let failed = 0;

    // Process emails in batches to avoid overwhelming the SMTP server
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 1000; // 1 second

    for (let i = 0; i < options.recipients.length; i += BATCH_SIZE) {
      const batch = options.recipients.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const personalizedHtml = this.personalizeTemplate(
            options.baseTemplate,
            recipient
          );

          const emailSent = await this.sendEmail({
            to: recipient.email,
            subject: options.subject,
            html: personalizedHtml,
          });

          const result = { email: recipient.email, success: emailSent };
          if (emailSent) success++;
          else failed++;
          
          return result;
        } catch (error) {
          failed++;
          return {
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < options.recipients.length) {
        await this.delay(DELAY_BETWEEN_BATCHES);
      }
    }

    logger.info(`Batch email complete: ${success} sent, ${failed} failed`);
    return { success, failed, results };
  }

  private personalizeTemplate(template: string, recipient: {
    email: string;
    name: string;
    personalizedContent: string;
  }): string {
    return template
      .replace(/{{name}}/g, recipient.name)
      .replace(/{{email}}/g, recipient.email)
      .replace(/{{personalizedContent}}/g, recipient.personalizedContent);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Template for rejection feedback email
  generateRejectionFeedbackTemplate(data: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    aiAnalysis: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      matchScore: number;
    };
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Update - ${data.jobTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .section { margin-bottom: 25px; }
          .section h3 { color: #4a5568; margin-bottom: 10px; border-left: 4px solid #667eea; padding-left: 15px; }
          .strengths { background: #f0fff4; padding: 15px; border-radius: 6px; border-left: 4px solid #48bb78; }
          .weaknesses { background: #fff5f5; padding: 15px; border-radius: 6px; border-left: 4px solid #f56565; }
          .recommendations { background: #f7fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #4299e1; }
          .score { display: inline-block; background: #edf2f7; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #2d3748; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin-bottom: 5px; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
            <p>Thank you for your interest in ${data.jobTitle}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.candidateName},</p>
            
            <p>Thank you for applying for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>. While we were impressed by your qualifications, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
            
            <div class="section">
              <h3>AI-Powered Resume Analysis</h3>
              <p>Our AI system has analyzed your profile against the job requirements. Here's your detailed feedback:</p>
              <p><strong>Overall Match Score:</strong> <span class="score">${data.aiAnalysis.matchScore}%</span></p>
            </div>
            
            <div class="section">
              <h3>Your Strengths</h3>
              <div class="strengths">
                <ul>
                  ${data.aiAnalysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
              </div>
            </div>
            
            <div class="section">
              <h3>Areas for Improvement</h3>
              <div class="weaknesses">
                <ul>
                  ${data.aiAnalysis.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                </ul>
              </div>
            </div>
            
            <div class="section">
              <h3>Our Recommendations</h3>
              <div class="recommendations">
                <ul>
                  ${data.aiAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            </div>
            
            <p>We encourage you to continue developing these areas and apply for future opportunities that match your evolving skill set.</p>
            
            <p>Best of luck in your job search!</p>
            
            <a href="https://evalia.com/jobs" class="cta-button">Explore More Opportunities</a>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Evalia AI Recruitment Platform.<br>
            If you have questions, please contact us at support@evalia.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();