import { Router } from "express";
import { handleInAppNotifications } from "../in-app/handlers/inapp-notification.handler";
import { inAppNotificationService } from "../in-app/service/inapp-notification.service";
import { notificationController } from "../controllers";
import { EventTypes } from "../events/eventTypes";
import { asyncHandler, ApiResponse, ApiError } from "../utils";
import logger from "../utils/logger";

const router = Router();

router.get("/:userId", notificationController.fetchNotificationsOfAUser.bind(notificationController) );

router.put("/:notificationId/read", notificationController.readNotification.bind(notificationController));
router.put("/:userId/read-all", notificationController.readAllNotification.bind(notificationController));
router.delete("/:notificationId", notificationController.deleteNotification.bind(notificationController));

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
    await handleInAppNotifications({
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



export default router;
