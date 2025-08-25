import { Router } from "express";
import { getUserNotifications, markAsRead } from "../services/notificationService";
import { handleIncomingEvent } from "../events/notificationHandler";
import { EventTypes } from "../events/eventTypes";
import logger from "../utils/logger";

const router = Router();

router.get("/:userId", async (req, res) => {
  const notifs = await getUserNotifications(req.params.userId);
  res.json(notifs);
});

router.patch("/:id/read", async (req, res) => {
  const updated = await markAsRead(req.params.id);
  res.json(updated);
});

// New endpoint for batch rejection feedback
router.post("/batch-rejection-feedback", async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      companyName,
      jobDescription,
      shortlistedCandidates,
      allApplicants,
      recruiterId
    } = req.body;

    // Validate required fields
    if (!jobId || !jobTitle || !companyName || !shortlistedCandidates || !allApplicants || !recruiterId) {
      return res.status(400).json({
        error: "Missing required fields: jobId, jobTitle, companyName, shortlistedCandidates, allApplicants, recruiterId"
      });
    }

    // Validate that shortlistedCandidates is an array
    if (!Array.isArray(shortlistedCandidates)) {
      return res.status(400).json({
        error: "shortlistedCandidates must be an array"
      });
    }

    // Validate that allApplicants is an array with proper structure
    if (!Array.isArray(allApplicants) || !allApplicants.every(candidate => 
      candidate.userId && candidate.name && candidate.email && candidate.resumeId
    )) {
      return res.status(400).json({
        error: "allApplicants must be an array of objects with userId, name, email, and resumeId"
      });
    }

    logger.info(`Received batch rejection request for job: ${jobId}`);

    // Trigger the batch processing via event handler
    await handleIncomingEvent({
      type: EventTypes.BATCH_REJECTION_FEEDBACK,
      jobId,
      jobTitle,
      companyName,
      jobDescription,
      shortlistedCandidates,
      allApplicants,
      recruiterId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Batch rejection feedback processing started",
      jobId,
      candidatesToProcess: allApplicants.length - shortlistedCandidates.length
    });

  } catch (error) {
    logger.error("Batch rejection feedback endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Alternative direct endpoint (bypassing event system)
router.post("/batch-rejection-feedback/direct", async (req, res) => {
  try {
    const batchRequest = req.body;

    // Validate required fields
    if (!batchRequest.jobId || !batchRequest.jobTitle || !batchRequest.companyName || 
        !batchRequest.shortlistedCandidates || !batchRequest.allApplicants || !batchRequest.recruiterId) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    logger.info(`Direct batch rejection request for job: ${batchRequest.jobId}`);

    // const result = await batchFeedbackService.processBatchRejectionFeedback(batchRequest);

    res.json({
      // success: result.success,
      // processed: result.processed,
      // failed: result.failed,
      // details: result.details,
      // message: `Batch processing completed: ${result.processed} successful, ${result.failed} failed`
    });

  } catch (error) {
    logger.error("Direct batch rejection feedback error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
