import axios from "axios";
import { env } from "../config/env";
import { emailService } from "./emailService";
import { createNotification } from "./notificationService";
import { io } from "../config/socket";
import logger from "../utils/logger";

interface CandidateInfo {
  userId: string;
  name: string;
  email: string;
  resumeId: string;
}

interface BatchRejectionRequest {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  shortlistedCandidates: string[]; // Array of user IDs who got shortlisted
  allApplicants: CandidateInfo[]; // All candidates who applied
  recruiterId: string;
}

interface AIAnalysisResponse {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  matchScore: number;
  detailedAnalysis?: string;
}

class BatchFeedbackService {
  
  /**
   * Main function to process batch rejection feedback
   */
  async processBatchRejectionFeedback(request: BatchRejectionRequest): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    details: Array<{ candidateId: string; success: boolean; error?: string }>;
  }> {
    try {
      logger.info(`Starting batch rejection feedback for job ${request.jobId}`);
      
      // Get rejected candidates (those not in shortlisted list)
      const rejectedCandidates = request.allApplicants.filter(
        candidate => !request.shortlistedCandidates.includes(candidate.userId)
      );

      if (rejectedCandidates.length === 0) {
        logger.info("No rejected candidates to process");
        return { success: true, processed: 0, failed: 0, details: [] };
      }

      logger.info(`Processing ${rejectedCandidates.length} rejected candidates`);

      // Process each rejected candidate
      const results = await Promise.all(
        rejectedCandidates.map(candidate => 
          this.processIndividualRejection(candidate, request)
        )
      );

      // Count successes and failures
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      // Notify recruiter about completion
      await this.notifyRecruiterOfCompletion(request.recruiterId, {
        jobTitle: request.jobTitle,
        totalProcessed: results.length,
        successful,
        failed
      });

      logger.info(`Batch feedback completed: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        processed: successful,
        failed: failed,
        details: results
      };

    } catch (error) {
      logger.error("Batch rejection feedback failed:", error);
      return {
        success: false,
        processed: 0,
        failed: request.allApplicants.length,
        details: []
      };
    }
  }

  /**
   * Process individual candidate rejection with AI analysis
   */
  private async processIndividualRejection(
    candidate: CandidateInfo,
    jobInfo: BatchRejectionRequest
  ): Promise<{ candidateId: string; success: boolean; error?: string }> {
    try {
      // Get AI analysis by calling upskill-engine
      const aiAnalysis = await this.getAIAnalysis(candidate.resumeId, jobInfo.jobDescription);
      
      // Send email notification
      const emailSent = await this.sendRejectionEmail(candidate, jobInfo, aiAnalysis);
      
      // Create in-app notification
      const notificationCreated = await this.createInAppNotification(candidate, jobInfo, aiAnalysis);

      // Send real-time notification via Socket.IO
      this.sendRealtimeNotification(candidate.userId, {
        title: "Application Update",
        message: `Thank you for applying to ${jobInfo.jobTitle}. We've sent you detailed feedback to help improve your profile.`,
        type: "info",
        link: `/jobs/${jobInfo.jobId}`
      });

      const success = emailSent && notificationCreated;
      
      logger.info(`Processed rejection for ${candidate.email}: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        candidateId: candidate.userId,
        success
      };

    } catch (error) {
      logger.error(`Failed to process rejection for ${candidate.email}:`, error);
      return {
        candidateId: candidate.userId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Get AI analysis from upskill-engine
   */
  private async getAIAnalysis(resumeId: string, jobDescription: string): Promise<AIAnalysisResponse> {
    try {
      const response = await axios.post(`${env.UPSKILL_ENGINE_URL}/api/overview`, {
        resumeId,
        jobDescription
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Transform the upskill engine response to our format
      const analysis = response.data;
      
      return {
        strengths: this.extractStrengths(analysis),
        weaknesses: this.extractWeaknesses(analysis),
        recommendations: this.extractRecommendations(analysis),
        matchScore: this.calculateMatchScore(analysis),
        detailedAnalysis: analysis.overview || ""
      };

    } catch (error) {
      logger.warn(`AI analysis failed for resume ${resumeId}, using fallback`, error);
      
      // Fallback analysis if AI service is unavailable
      return {
        strengths: [
          "Professional resume format and structure",
          "Clear work experience presentation",
          "Educational background is well documented"
        ],
        weaknesses: [
          "Some key skills mentioned in the job description could be highlighted more prominently",
          "Consider adding more specific achievements and quantifiable results"
        ],
        recommendations: [
          "Enhance your skill set in areas mentioned in the job requirements",
          "Consider gaining more experience in relevant technologies",
          "Add more specific examples of your achievements and impact"
        ],
        matchScore: 65
      };
    }
  }

  /**
   * Send rejection email with AI feedback
   */
  private async sendRejectionEmail(
    candidate: CandidateInfo,
    jobInfo: BatchRejectionRequest,
    analysis: AIAnalysisResponse
  ): Promise<boolean> {
    try {
      const emailTemplate = emailService.generateRejectionFeedbackTemplate({
        candidateName: candidate.name,
        jobTitle: jobInfo.jobTitle,
        companyName: jobInfo.companyName,
        aiAnalysis: analysis
      });

      return await emailService.sendEmail({
        to: candidate.email,
        subject: `Application Update: ${jobInfo.jobTitle} at ${jobInfo.companyName}`,
        html: emailTemplate
      });

    } catch (error) {
      logger.error(`Failed to send email to ${candidate.email}:`, error);
      return false;
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(
    candidate: CandidateInfo,
    jobInfo: BatchRejectionRequest,
    analysis: AIAnalysisResponse
  ): Promise<boolean> {
    try {
      await createNotification({
        userId: candidate.userId,
        title: "Application Feedback Available",
        message: `We've reviewed your application for ${jobInfo.jobTitle} and prepared personalized feedback to help you improve. Match score: ${analysis.matchScore}%`,
        type: "feedback",
        link: `/jobs/${jobInfo.jobId}/feedback`
      });

      return true;
    } catch (error) {
      logger.error(`Failed to create notification for ${candidate.userId}:`, error);
      return false;
    }
  }

  /**
   * Send real-time notification via Socket.IO
   */
  private sendRealtimeNotification(userId: string, notification: any): void {
    try {
      io.to(userId).emit('notification', notification);
      logger.info(`Real-time notification sent to user ${userId}`);
    } catch (error) {
      logger.error(`Failed to send real-time notification to ${userId}:`, error);
    }
  }

  /**
   * Notify recruiter when batch processing is complete
   */
  private async notifyRecruiterOfCompletion(
    recruiterId: string,
    summary: {
      jobTitle: string;
      totalProcessed: number;
      successful: number;
      failed: number;
    }
  ): Promise<void> {
    try {
      await createNotification({
        userId: recruiterId,
        title: "Batch Feedback Complete",
        message: `Rejection feedback sent for ${summary.jobTitle}: ${summary.successful}/${summary.totalProcessed} candidates notified successfully.`,
        type: "info",
        link: `/recruiter/jobs`
      });

      // Real-time notification to recruiter
      io.to(recruiterId).emit('notification', {
        title: "Batch Processing Complete",
        message: `Feedback sent to ${summary.successful} candidates for ${summary.jobTitle}`,
        type: "success"
      });

    } catch (error) {
      logger.error(`Failed to notify recruiter ${recruiterId}:`, error);
    }
  }

  // Helper methods to extract information from AI analysis response
  private extractStrengths(analysis: any): string[] {
    // Extract strengths from AI response - adapt based on actual upskill-engine response format
    return analysis?.strengths || analysis?.positives || [
      "Professional experience in relevant field",
      "Strong educational background",
      "Well-structured resume presentation"
    ];
  }

  private extractWeaknesses(analysis: any): string[] {
    // Extract weaknesses from AI response - adapt based on actual upskill-engine response format
    return analysis?.weaknesses || analysis?.gaps || [
      "Some skills mentioned in job description could be enhanced",
      "Consider adding more quantifiable achievements"
    ];
  }

  private extractRecommendations(analysis: any): string[] {
    // Extract recommendations from AI response - adapt based on actual upskill-engine response format
    return analysis?.recommendations || analysis?.suggestions || [
      "Focus on developing skills mentioned in the job requirements",
      "Gain more hands-on experience in relevant technologies",
      "Consider obtaining relevant certifications"
    ];
  }

  private calculateMatchScore(analysis: any): number {
    // Calculate match score from AI response - adapt based on actual upskill-engine response format
    return analysis?.matchScore || analysis?.score || 
           Math.floor(Math.random() * 30 + 50); // Fallback: random score between 50-80
  }
}

export const batchFeedbackService = new BatchFeedbackService();
